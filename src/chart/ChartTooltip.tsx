import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '../theme/tokens';

const TOOLTIP_WIDTH = 160;

interface ChartTooltipProps {
  chartWidth: number;
  touchX: SharedValue<number>;
  touchY: SharedValue<number>;
  activeOpacity: SharedValue<number>;
  activePriceText: string;
  activeTimeText: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  chartWidth,
  touchX,
  touchY,
  activeOpacity,
  activePriceText,
  activeTimeText,
}) => {
  const containerStyle = useAnimatedStyle(() => {
    const maxX = Math.max(10, chartWidth - TOOLTIP_WIDTH - 10);
    const rawX = touchX.value - TOOLTIP_WIDTH / 2;
    const xPos = Number.isFinite(rawX)
      ? Math.max(10, Math.min(rawX, maxX))
      : 10;
    const rawY = touchY.value - 62;
    const yPos = Number.isFinite(rawY) ? Math.max(10, rawY) : 10;

    return {
      opacity: activeOpacity.value,
      transform: [{ translateX: xPos }, { translateY: yPos }],
    };
  });

  return (
    <Animated.View style={[styles.tooltip, containerStyle]} pointerEvents="none">
      <Text style={styles.price}>{activePriceText}</Text>
      <Text style={styles.time}>{activeTimeText}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(18, 24, 38, 0.95)',
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
    width: TOOLTIP_WIDTH,
  },
  price: {
    ...typography.mono,
    fontSize: 13,
    color: colors.primaryText,
    fontWeight: '700',
  },
  time: {
    ...typography.caption,
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 2,
    fontWeight: '500',
  },
});
