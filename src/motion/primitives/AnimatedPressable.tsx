import React from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { springConfig } from '../springs';
import { haptics } from '../../services/haptics';
import { useSettingsStore } from '../../store/useSettingsStore';

const AnimatedPressableBase = Animated.createAnimatedComponent(Pressable);

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  enableHaptic?: boolean;
  children: React.ReactNode;
}

export const AnimatedPressable: React.FC<AnimatedPressableProps> = ({
  children,
  style,
  scaleTo = 0.96,
  enableHaptic = true,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}) => {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: any) => {
    if (!reduceMotion) {
      scale.value = withSpring(scaleTo, springConfig.snappy);
    }
    if (enableHaptic) {
      haptics.tap();
    }
    onPressIn?.(e);
  };

  const handlePressOut = (e: any) => {
    if (!reduceMotion) {
      scale.value = withSpring(1, springConfig.snappy);
    }
    onPressOut?.(e);
  };

  return (
    <AnimatedPressableBase
      style={[style, animatedStyle]}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      {...rest}
    >
      {children}
    </AnimatedPressableBase>
  );
};
