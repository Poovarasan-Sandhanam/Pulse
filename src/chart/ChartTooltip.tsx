import React from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { colors, radius, spacing, typography } from '../theme/tokens';

interface ChartTooltipProps {
  touchX: SharedValue<number>;
  touchY: SharedValue<number>;
  isTouchActive: SharedValue<boolean>;
  activePriceText: string;
  activeTimeText: string;
}

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  touchX,
  touchY,
  isTouchActive,
  activePriceText,
  activeTimeText,
}) => {
  const containerStyle = useAnimatedStyle(() => {
    const tooltipWidth = 160;
    const xPos = Math.max(10, Math.min(touchX.value - tooltipWidth / 2, 190));

    return {
      opacity: isTouchActive.value ? 1 : 0,
      transform: [
        { translateX: xPos },
        { translateY: Math.max(10, touchY.value - 62) },
      ],
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
    minWidth: 150,
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
