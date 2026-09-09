import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors, typography, spacing } from '../theme/tokens';

interface ChartNativeOverlayProps {
  width: number;
  height: number;
  minPrice: number;
  maxPrice: number;
  startTime?: number;
  endTime?: number;
  assetSymbol?: string;
  isPositive?: boolean;
  showOverlay?: boolean;
}

export const ChartNativeOverlay: React.FC<ChartNativeOverlayProps> = ({
  width,
  height,
  minPrice,
  maxPrice,
  startTime,
  endTime,
  assetSymbol = 'Asset',
  isPositive = true,
  showOverlay = true,
}) => {
  if (!showOverlay) {
    return null;
  }

  const priceRange = maxPrice - minPrice || 1;
  const midPrice = minPrice + priceRange / 2;

  // Format currency text
  const formatPrice = (val: number) =>
    val >= 1000
      ? `$${val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
      : `$${val.toFixed(3)}`;

  // Format date time text
  const formatDate = (time?: number) => {
    if (!time || time <= 86400000) return '';
    const date = new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const changeText = isPositive ? 'up' : 'down';
  const accessibilityText = `${assetSymbol} price chart. High ${formatPrice(
    maxPrice
  )}, Low ${formatPrice(minPrice)}. Currently trending ${changeText}.`;

  const hasValidTime =
    typeof startTime === 'number' &&
    typeof endTime === 'number' &&
    startTime > 86400000 &&
    endTime > 86400000;

  return (
    <View
      style={[styles.container, { width, height }]}
      pointerEvents="none"
      accessible={true}
      accessibilityRole="summary"
      accessibilityLabel={accessibilityText}
      accessibilityValue={{
        text: `Range from ${formatPrice(minPrice)} to ${formatPrice(maxPrice)}`,
      }}
    >
      {/* Y-Axis Price Label Ticks */}
      <View style={styles.yAxisLabels}>
        <Text style={styles.tickText}>{formatPrice(maxPrice)}</Text>
        <Text style={styles.tickText}>{formatPrice(midPrice)}</Text>
        <Text style={styles.tickText}>{formatPrice(minPrice)}</Text>
      </View>

      {/* X-Axis Time Label Ticks */}
      {hasValidTime ? (
        <View style={styles.xAxisLabels}>
          <Text style={styles.tickText}>{formatDate(startTime)}</Text>
          <Text style={styles.tickText}>{formatDate(endTime)}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  yAxisLabels: {
    position: 'absolute',
    right: spacing.xs,
    top: spacing.xs,
    bottom: spacing.lg,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 4,
    left: spacing.sm,
    right: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tickText: {
    ...typography.caption,
    fontSize: 10,
    color: colors.secondaryText,
    fontWeight: '500',
    backgroundColor: 'rgba(11, 14, 20, 0.65)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: 'hidden',
  },
});
