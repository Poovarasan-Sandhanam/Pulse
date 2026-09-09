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
    const tooltipWidth = 120;
    const xPos = Math.max(10, Math.min(touchX.value - tooltipWidth / 2, 220));

    return {
      opacity: isTouchActive.value ? 1 : 0,
      transform: [
        { translateX: xPos },
        { translateY: Math.max(10, touchY.value - 60) },
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.xs,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  price: {
    ...typography.caption,
    color: colors.primaryText,
    fontWeight: '700',
  },
  time: {
    fontSize: 10,
    color: colors.secondaryText,
    marginTop: 2,
  },
});
