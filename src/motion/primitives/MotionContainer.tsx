import React from 'react';
import { View, ViewProps } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSettingsStore } from '../../store/useSettingsStore';

export const MotionContainer: React.FC<ViewProps> = ({ children, style, ...rest }) => {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);

  if (reduceMotion) {
    return (
      <View style={style} {...rest}>
        {children}
      </View>
    );
  }

  return (
    <Animated.View entering={FadeIn.duration(200)} style={style} {...rest}>
      {children}
    </Animated.View>
  );
};
