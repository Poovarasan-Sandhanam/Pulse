import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, LayoutChangeEvent } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
  withTiming,
} from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '../theme/tokens';
import { springConfig } from '../motion/springs';
import { haptics } from '../services/haptics';
import { useSettingsStore } from '../store/useSettingsStore';
import { Check, ArrowRight } from 'lucide-react-native';

interface SwipeToConfirmProps {
  label?: string;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
}

export const SwipeToConfirm: React.FC<SwipeToConfirmProps> = ({
  label = 'Swipe to Confirm',
  onConfirm,
  disabled = false,
}) => {
  const [containerWidth, setContainerWidth] = useState(300);
  const [status, setStatus] = useState<'idle' | 'processing' | 'confirmed'>('idle');
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  const thumbSize = 52;
  const padding = 4;
  const maxTranslate = useSharedValue(containerWidth - thumbSize - padding * 2);

  // Keep maxTranslate shared value in sync with containerWidth
  useEffect(() => {
    maxTranslate.value = containerWidth - thumbSize - padding * 2;
  }, [containerWidth, maxTranslate]);

  const translateX = useSharedValue(0);
  const isLocked = useSharedValue(false);
  const hapticTriggered = useSharedValue(false);

  const triggerThresholdHaptic = () => {
    haptics.threshold();
  };

  const triggerSuccessHaptic = () => {
    haptics.success();
  };

  const executeConfirm = async () => {
    setStatus('processing');
    try {
      await onConfirm();
      setStatus('confirmed');
    } catch {
      setStatus('idle');
      translateX.value = reduceMotion
        ? withTiming(0, { duration: 100 })
        : withSpring(0, springConfig.snappy);
      isLocked.value = false;
    }
  };

  const panGesture = Gesture.Pan()
    .enabled(!disabled && status === 'idle')
    .onChange((event) => {
      'worklet';
      if (isLocked.value) return;

      const newX = Math.max(0, Math.min(event.translationX, maxTranslate.value));
      translateX.value = newX;

      // 50% threshold haptic trigger
      const progress = maxTranslate.value > 0 ? newX / maxTranslate.value : 0;
      if (progress >= 0.5 && !hapticTriggered.value) {
        hapticTriggered.value = true;
        runOnJS(triggerThresholdHaptic)();
      } else if (progress < 0.5 && hapticTriggered.value) {
        hapticTriggered.value = false;
      }
    })
    .onEnd((event) => {
      'worklet';
      if (isLocked.value) return;

      const progress = maxTranslate.value > 0 ? translateX.value / maxTranslate.value : 0;
      const velocityX = event.velocityX;

      // Velocity & progress threshold calculations for natural physical feel:
      // 1. Slow drag: requires >= 75% progress (and not flicked hard backwards)
      // 2. Fast intentional flick: velocityX >= 450 px/s AND progress >= 25% (safety distance)
      // 3. Physical momentum projection: projected distance over 0.2s >= 75% AND progress >= 25% AND velocityX > -200
      const isNormalConfirm = progress >= 0.75 && velocityX > -300;
      const isFlickConfirm = velocityX >= 450 && progress >= 0.25;
      const projectedProgress = maxTranslate.value > 0 ? (translateX.value + velocityX * 0.2) / maxTranslate.value : 0;
      const isProjectedConfirm = projectedProgress >= 0.75 && progress >= 0.25 && velocityX > -200;

      const shouldConfirm = isNormalConfirm || isFlickConfirm || isProjectedConfirm;

      if (shouldConfirm) {
        isLocked.value = true;
        if (reduceMotion) {
          translateX.value = withTiming(maxTranslate.value, { duration: 100 });
        } else {
          translateX.value = withSpring(maxTranslate.value, {
            ...springConfig.stiff,
            velocity: velocityX,
          });
        }
        runOnJS(triggerSuccessHaptic)();
        runOnJS(executeConfirm)();
      } else {
        if (reduceMotion) {
          translateX.value = withTiming(0, { duration: 100 });
        } else {
          translateX.value = withSpring(0, {
            ...springConfig.snappy,
            velocity: velocityX,
          });
        }
        hapticTriggered.value = false;
      }
    });

  const onLayout = (e: LayoutChangeEvent) => {
    setContainerWidth(e.nativeEvent.layout.width);
  };

  const thumbAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const progressFillStyle = useAnimatedStyle(() => ({
    width: translateX.value + thumbSize / 2 + padding,
  }));

  const labelAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, maxTranslate.value * 0.6],
      [1, 0],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  return (
    <View
      style={[
        styles.track,
        disabled && styles.disabledTrack,
        status === 'confirmed' && styles.confirmedTrack,
      ]}
      onLayout={onLayout}
    >
      {/* Animated Fill Progress Bar */}
      <Animated.View style={[styles.progressFill, progressFillStyle]} />

      {/* Track Label */}
      <Animated.View style={[styles.labelContainer, labelAnimatedStyle]}>
        <Text style={styles.label}>{label}</Text>
      </Animated.View>

      {/* Swipe Thumb Handle */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.thumb, thumbAnimatedStyle]}>
          {status === 'confirmed' ? (
            <Check size={24} color={colors.primaryText} strokeWidth={3} />
          ) : (
            <ArrowRight size={24} color={colors.primaryText} strokeWidth={2.5} />
          )}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    height: 60,
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    justifyContent: 'center',
    padding: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  disabledTrack: {
    opacity: 0.5,
  },
  confirmedTrack: {
    backgroundColor: colors.positiveMuted,
    borderColor: colors.positive,
  },
  progressFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.accentGlow,
    borderRadius: radius.full,
  },
  labelContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    ...typography.bodyBold,
    color: colors.primaryText,
    letterSpacing: 0.5,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
});
