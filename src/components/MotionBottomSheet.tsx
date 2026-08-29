import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableWithoutFeedback,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { colors, radius, spacing } from '../theme/tokens';
import { springConfig } from '../motion/springs';
import { useSettingsStore } from '../store/useSettingsStore';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface MotionBottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[]; // Percentage of screen height e.g. [0.5, 0.9]
}

export const MotionBottomSheet: React.FC<MotionBottomSheetProps> = ({
  isVisible,
  onClose,
  children,
  snapPoints = [0.85],
}) => {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const targetHeight = SCREEN_HEIGHT * (snapPoints[0] || 0.85);
  const translateY = useSharedValue(SCREEN_HEIGHT);

  useEffect(() => {
    if (isVisible) {
      translateY.value = reduceMotion
        ? SCREEN_HEIGHT - targetHeight
        : withSpring(SCREEN_HEIGHT - targetHeight, springConfig.gentle);
    } else {
      translateY.value = reduceMotion
        ? SCREEN_HEIGHT
        : withSpring(SCREEN_HEIGHT, springConfig.gentle);
    }
  }, [isVisible, targetHeight, reduceMotion, translateY]);

  const panGesture = Gesture.Pan()
    .onChange((event) => {
      'worklet';
      const newY = translateY.value + event.changeY;
      translateY.value = Math.max(SCREEN_HEIGHT - targetHeight, newY);
    })
    .onEnd((event) => {
      'worklet';
      if (event.velocityY > 500 || translateY.value > SCREEN_HEIGHT - targetHeight * 0.6) {
        translateY.value = withSpring(SCREEN_HEIGHT, springConfig.gentle, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withSpring(SCREEN_HEIGHT - targetHeight, springConfig.gentle);
      }
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [SCREEN_HEIGHT, SCREEN_HEIGHT - targetHeight],
      [0, 1],
      Extrapolation.CLAMP
    );
    return { opacity };
  });

  if (!isVisible && translateY.value >= SCREEN_HEIGHT) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={isVisible ? 'auto' : 'none'}>
      {/* Animated Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} />
      </TouchableWithoutFeedback>

      {/* Sheet Container */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.sheet, { height: targetHeight }, sheetAnimatedStyle]}>
          {/* Drag Handle Indicator */}
          <View style={styles.handleContainer}>
            <View style={styles.handle} />
          </View>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.surfaceElevated,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 20,
  },
  handleContainer: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.borderHighlight,
  },
});
