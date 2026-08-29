import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { useSettingsStore } from '../../store/useSettingsStore';

interface AnimatedCardProps {
  index?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  index = 0,
  style,
  children,
}) => {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  if (reduceMotion) {
    return <Animated.View style={style}>{children}</Animated.View>;
  }

  const delay = Math.min(index * 60, 300);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(300).springify().damping(18)}
      exiting={FadeOut.duration(150)}
      style={style}
    >
      {children}
    </Animated.View>
  );
};
