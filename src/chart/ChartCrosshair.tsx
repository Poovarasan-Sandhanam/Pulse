import React from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { colors } from '../theme/tokens';

interface ChartCrosshairProps {
  width: number;
  height: number;
  touchX: SharedValue<number>;
  touchY: SharedValue<number>;
  activeOpacity: SharedValue<number>;
}

export const ChartCrosshair: React.FC<ChartCrosshairProps> = ({
  width,
  height,
  touchX,
  touchY,
  activeOpacity,
}) => {
  const verticalLineStyle = useAnimatedStyle(() => ({
    opacity: activeOpacity.value,
    transform: [{ translateX: touchX.value }],
  }));

  const horizontalLineStyle = useAnimatedStyle(() => ({
    opacity: activeOpacity.value * 0.6,
    transform: [{ translateY: touchY.value }],
  }));

  const pointDotStyle = useAnimatedStyle(() => ({
    opacity: activeOpacity.value,
    transform: [
      { translateX: touchX.value - 6 },
      { translateY: touchY.value - 6 },
    ],
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { width, height }]} pointerEvents="none">
      {/* Vertical Crosshair Line */}
      <Animated.View style={[styles.verticalLine, { height }, verticalLineStyle]} />

      {/* Horizontal Crosshair Line */}
      <Animated.View style={[styles.horizontalLine, { width }, horizontalLineStyle]} />

      {/* Active Intersection Dot */}
      <Animated.View style={[styles.activeDot, pointDotStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  verticalLine: {
    position: 'absolute',
    width: 1.5,
    backgroundColor: colors.primaryText,
    opacity: 0.8,
  },
  horizontalLine: {
    position: 'absolute',
    height: 1,
    backgroundColor: colors.secondaryText,
  },
  activeDot: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primaryText,
    borderWidth: 2,
    borderColor: colors.accent,
  },
});
