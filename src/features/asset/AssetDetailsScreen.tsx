import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { AnimatedPressable } from '../../motion/primitives/AnimatedPressable';
import { ChartGestureHandler } from '../../chart/ChartGestureHandler';
import { useMarketStore } from '../../store/useMarketStore';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { TradeBottomSheet } from '../trading/TradeBottomSheet';
import { ArrowLeft, TrendingUp } from 'lucide-react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface AssetDetailsScreenProps {
  assetId: string;
  onBack?: () => void;
}

export const AssetDetailsScreen: React.FC<AssetDetailsScreenProps> = ({
  assetId,
  onBack,
}) => {
  const insets = useSafeAreaInsets();
  const [tradeSide, setTradeSide] = useState<'BUY' | 'SELL' | null>(null);
  const assets = useMarketStore((s) => s.assets);
  const selectedTimeframe = useMarketStore((s) => s.selectedTimeframe);
  const setSelectedTimeframe = useMarketStore((s) => s.setSelectedTimeframe);
  const holdings = usePortfolioStore((s) => s.holdings);

  const asset = assets.find((a) => a.id === assetId) || assets[0];
  const userQty = holdings[asset.id] || 0;
  const isPositive = asset.change24h >= 0;

  const timeframes: ('1H' | '1D' | '1W' | '1M' | '1Y')[] = ['1H', '1D', '1W', '1M', '1Y'];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + 100 },
        ]}
      >
        {/* Navigation Header */}
        <View style={styles.header}>
          {onBack && (
            <AnimatedPressable style={styles.backButton} onPress={onBack}>
              <ArrowLeft size={20} color={colors.primaryText} />
            </AnimatedPressable>
          )}
          <View>
            <Text style={styles.assetTitle}>{asset.name}</Text>
            <Text style={styles.assetTicker}>{asset.symbol}</Text>
          </View>
        </View>

        {/* Live Hero Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.heroPrice}>
            £{asset.currentPrice > 10 ? asset.currentPrice.toLocaleString('en-GB', { minimumFractionDigits: 2 }) : asset.currentPrice.toFixed(4)}
          </Text>

          <View
            style={[
              styles.pnlPill,
              { backgroundColor: isPositive ? colors.positiveMuted : colors.negativeMuted },
            ]}
          >
            <TrendingUp size={14} color={isPositive ? colors.positive : colors.negative} />
            <Text
              style={[
                styles.pnlText,
                { color: isPositive ? colors.positive : colors.negative },
              ]}
            >
              {isPositive ? '+' : ''}
              {asset.change24h.toFixed(2)}% (£{asset.change24hAmount > 0 ? '+' : ''}
              {asset.change24hAmount.toFixed(2)})
            </Text>
          </View>
        </View>

        {/* Large Skia Interactive Price Chart */}
        <View style={styles.chartWrapper}>
          <ChartGestureHandler
            data={asset.chartData}
            width={SCREEN_WIDTH - spacing.md * 2}
            height={240}
            isPositive={isPositive}
          />
        </View>

        {/* Timeframe Pills Selector */}
        <View style={styles.timeframeRow}>
          {timeframes.map((tf) => (
            <AnimatedPressable
              key={tf}
              style={[
                styles.tfPill,
                selectedTimeframe === tf && styles.tfPillActive,
              ]}
              onPress={() => setSelectedTimeframe(tf)}
            >
              <Text
                style={[
                  styles.tfText,
                  selectedTimeframe === tf && styles.tfTextActive,
                ]}
              >
                {tf}
              </Text>
            </AnimatedPressable>
          ))}
        </View>

        {/* User Holdings Summary Card */}
        <View style={styles.holdingsCard}>
          <Text style={styles.holdingsTitle}>Your {asset.symbol} Balance</Text>
          <View style={styles.holdingsRow}>
            <View>
              <Text style={styles.holdingsValue}>
                £{(userQty * asset.currentPrice).toFixed(2)}
              </Text>
              <Text style={styles.holdingsSub}>
                {userQty.toFixed(6)} {asset.symbol}
              </Text>
            </View>
            <View style={styles.marketCapCol}>
              <Text style={styles.capLabel}>Market Price</Text>
              <Text style={styles.capValue}>£{asset.currentPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Buttons */}
      <View style={[styles.actionFooter, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <AnimatedPressable
          style={[styles.actionBtn, styles.sellBtn]}
          onPress={() => setTradeSide('SELL')}
        >
          <Text style={styles.btnText}>SELL</Text>
        </AnimatedPressable>

        <AnimatedPressable
          style={[styles.actionBtn, styles.buyBtn]}
          onPress={() => setTradeSide('BUY')}
        >
          <Text style={styles.btnText}>BUY</Text>
        </AnimatedPressable>
      </View>

      {/* Trading Motion Bottom Sheet */}
      <TradeBottomSheet
        isVisible={tradeSide !== null}
        side={tradeSide || 'BUY'}
        asset={asset}
        onClose={() => setTradeSide(null)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    paddingTop: spacing.xl,
    // paddingBottom handled dynamically via contentContainerStyle (insets.bottom + 100)
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  assetTitle: {
    ...typography.h2,
    color: colors.primaryText,
  },
  assetTicker: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  priceContainer: {
    marginBottom: spacing.lg,
  },
  heroPrice: {
    ...typography.monoLarge,
    color: colors.primaryText,
  },
  // pnlRow was defined but never used — removed
  pnlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 4,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  pnlText: {
    ...typography.caption,
    fontWeight: '700',
  },
  chartWrapper: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timeframeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    backgroundColor: colors.surface,
    padding: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tfPill: {
    flex: 1,
    paddingVertical: spacing.xs,
    alignItems: 'center',
    borderRadius: radius.xs,
  },
  tfPillActive: {
    backgroundColor: colors.accent,
  },
  tfText: {
    ...typography.caption,
    color: colors.secondaryText,
    fontWeight: '600',
  },
  tfTextActive: {
    color: colors.primaryText,
    fontWeight: '700',
  },
  holdingsCard: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  holdingsTitle: {
    ...typography.caption,
    color: colors.secondaryText,
    marginBottom: spacing.xs,
  },
  holdingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  holdingsValue: {
    ...typography.h3,
    color: colors.primaryText,
  },
  holdingsSub: {
    ...typography.caption,
    color: colors.tertiaryText,
  },
  marketCapCol: {
    alignItems: 'flex-end',
  },
  capLabel: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  capValue: {
    ...typography.bodyBold,
    color: colors.primaryText,
  },
  actionFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surfaceElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  actionBtn: {
    flex: 1,
    height: 52,
    borderRadius: radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buyBtn: {
    backgroundColor: colors.positive,
  },
  sellBtn: {
    backgroundColor: colors.negative,
  },
  btnText: {
    ...typography.bodyBold,
    color: colors.primaryText,
    letterSpacing: 1,
  },
});
