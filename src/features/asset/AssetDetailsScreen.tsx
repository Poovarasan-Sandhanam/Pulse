import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { AnimatedPressable } from '../../motion/primitives/AnimatedPressable';
import { useMarketStore } from '../../store/useMarketStore';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { Loader } from '../../components/Loader';

const ChartGestureHandler = lazy(() => import('../../chart/ChartGestureHandler').then((m) => ({ default: m.ChartGestureHandler })));
const TradeBottomSheet = lazy(() => import('../trading/TradeBottomSheet').then((m) => ({ default: m.TradeBottomSheet })));
import { ArrowLeft, TrendingUp, TrendingDown, Clock } from 'lucide-react-native';
import { fetchCoinGeckoMarketData, getGeckoId } from '../../services/market/CoinGeckoService';
import { PricePoint } from '../../services/market/MarketSimulator';
import { haptics } from '../../services/haptics';

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

  const [timeframeData, setTimeframeData] = useState<PricePoint[]>(asset?.chartData || []);
  const [isLoadingTimeframe, setIsLoadingTimeframe] = useState<boolean>(false);
  const [scrubbedPoint, setScrubbedPoint] = useState<PricePoint | null>(null);

  const timeframes: ('1H' | '1D' | '1W' | '1M' | '1Y')[] = ['1H', '1D', '1W', '1M', '1Y'];

  // Dynamically load historical data for selected timeframe
  useEffect(() => {
    let isMounted = true;
    setIsLoadingTimeframe(true);
    setScrubbedPoint(null);

    const geckoId = getGeckoId(asset.id);
    const daysMap: Record<string, number> = {
      '1H': 1,
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '1Y': 365,
    };

    fetchCoinGeckoMarketData(geckoId, daysMap[selectedTimeframe] || 1)
      .then((data) => {
        if (!isMounted) return;
        let finalData = data;
        if (selectedTimeframe === '1H' && data.length > 12) {
          finalData = data.slice(-12);
        }
        if (finalData.length > 0) {
          setTimeframeData(finalData);
        }
        setIsLoadingTimeframe(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setIsLoadingTimeframe(false);
      });

    return () => {
      isMounted = false;
    };
  }, [asset?.id, selectedTimeframe]);

  const handlePointScrubbed = useCallback((point: PricePoint | null) => {
    setScrubbedPoint(point);
  }, []);

  // Compute period price metrics
  const activeData = timeframeData.length > 0 ? timeframeData : asset.chartData;
  const firstPrice = activeData[0]?.price || asset.currentPrice;
  const lastPrice = activeData[activeData.length - 1]?.price || asset.currentPrice;

  const displayPrice = scrubbedPoint ? scrubbedPoint.price : asset.currentPrice;
  const periodChangeAmount = lastPrice - firstPrice;
  const periodChangePercent = firstPrice > 0 ? (periodChangeAmount / firstPrice) * 100 : 0;
  const isPeriodPositive = periodChangePercent >= 0;

  // Format date and time string for scrubbed point
  const formattedScrubTime = scrubbedPoint
    ? `${new Date(scrubbedPoint.timestamp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })} • ${new Date(scrubbedPoint.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })}`
    : null;

  if (!asset) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Loader text="Loading asset..." />
      </View>
    );
  }

  const userQty = holdings[asset.id] || 0;

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

        {/* Live Hero Price & Dynamic Period PnL / Scrubbed Date & Time */}
        <View style={styles.priceContainer}>
          <Text style={styles.heroPrice}>
            ${displayPrice >= 1000
              ? displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              : displayPrice >= 1
              ? displayPrice.toFixed(2)
              : displayPrice.toFixed(4)}
          </Text>

          {formattedScrubTime ? (
            <View style={styles.scrubTimePill}>
              <Clock size={13} color={colors.accent} />
              <Text style={styles.scrubTimeText}>{formattedScrubTime}</Text>
            </View>
          ) : (
            <View
              style={[
                styles.pnlPill,
                { backgroundColor: isPeriodPositive ? colors.positiveMuted : colors.negativeMuted },
              ]}
            >
              {isPeriodPositive ? (
                <TrendingUp size={14} color={colors.positive} />
              ) : (
                <TrendingDown size={14} color={colors.negative} />
              )}
              <Text
                style={[
                  styles.pnlText,
                  { color: isPeriodPositive ? colors.positive : colors.negative },
                ]}
              >
                {isPeriodPositive ? '+' : ''}
                {periodChangePercent.toFixed(2)}% (${periodChangeAmount > 0 ? '+' : ''}
                {periodChangeAmount.toFixed(2)}) for {selectedTimeframe}
              </Text>
            </View>
          )}
        </View>

        {/* Large Skia Interactive Price Chart */}
        <View style={styles.chartWrapper}>
          {isLoadingTimeframe ? (
            <View style={styles.chartLoading}>
              <Loader />
            </View>
          ) : (
            <Suspense fallback={<View style={styles.chartLoading}><Loader text="Loading chart engine..." /></View>}>
              <ChartGestureHandler
                data={activeData}
                width={SCREEN_WIDTH - spacing.md * 2}
                height={240}
                isPositive={isPeriodPositive}
                onPointScrubbed={handlePointScrubbed}
              />
            </Suspense>
          )}
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
              onPress={() => {
                haptics.selection();
                setSelectedTimeframe(tf);
              }}
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
                ${(userQty * asset.currentPrice).toFixed(2)}
              </Text>
              <Text style={styles.holdingsSub}>
                {userQty.toFixed(6)} {asset.symbol}
              </Text>
            </View>
            <View style={styles.marketCapCol}>
              <Text style={styles.capLabel}>Market Price</Text>
              <Text style={styles.capValue}>${asset.currentPrice.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Action Buttons */}
      <View style={[styles.actionFooter, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        <AnimatedPressable
          testID="sell-button"
          accessibilityLabel="sell-button"
          style={[styles.actionBtn, styles.sellBtn]}
          onPress={() => setTradeSide('SELL')}
        >
          <Text style={styles.btnText}>SELL</Text>
        </AnimatedPressable>

        <AnimatedPressable
          testID="buy-button"
          accessibilityLabel="buy-button"
          style={[styles.actionBtn, styles.buyBtn]}
          onPress={() => setTradeSide('BUY')}
        >
          <Text style={styles.btnText}>BUY</Text>
        </AnimatedPressable>
      </View>

      {/* Trading Motion Bottom Sheet */}
      {tradeSide !== null && (
        <Suspense fallback={null}>
          <TradeBottomSheet
            isVisible={true}
            side={tradeSide}
            asset={asset}
            onClose={() => setTradeSide(null)}
          />
        </Suspense>
      )}
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
  scrubTimePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 5,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  scrubTimeText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.accent,
  },
  chartWrapper: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    marginBottom: spacing.md,
    minHeight: 250,
    justifyContent: 'center',
  },
  chartLoading: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
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
