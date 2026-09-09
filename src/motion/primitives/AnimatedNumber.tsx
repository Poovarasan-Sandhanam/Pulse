import React, { useEffect } from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useDerivedValue,
  withSpring,
  withTiming,
  useAnimatedProps,
} from 'react-native-reanimated';
import { useSettingsStore } from '../../store/useSettingsStore';
import { springConfig } from '../springs';

interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  style?: TextStyle;
}

const AnimatedText = Animated.createAnimatedComponent(Text);

export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  prefix = '',
  suffix = '',
  decimals = 2,
  style,
}) => {
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const animatedValue = useSharedValue(value);

  useEffect(() => {
    if (reduceMotion) {
      animatedValue.value = value;
    } else {
      animatedValue.value = withSpring(value, springConfig.snappy);
    }
  }, [value, reduceMotion, animatedValue]);

  // Derived display text computed on UI thread
  const formattedText = useDerivedValue(() => {
    const formatted = animatedValue.value.toLocaleString('en-GB', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  const animatedProps = useAnimatedProps(() => {
    return {
      text: formattedText.value,
    } as any;
  });

  return (
    <AnimatedText style={[styles.defaultStyle, style]}>
      {`${prefix}${value.toLocaleString('en-GB', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`}
    </AnimatedText>
  );
};

const styles = StyleSheet.create({
  defaultStyle: {
    fontVariant: ['tabular-nums'],
  },
});
