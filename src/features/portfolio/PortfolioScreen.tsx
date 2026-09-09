import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { AnimatedNumber } from '../../motion/primitives/AnimatedNumber';
import { AnimatedPressable } from '../../motion/primitives/AnimatedPressable';
import { AnimatedCard } from '../../motion/primitives/AnimatedCard';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { useMarketStore } from '../../store/useMarketStore';
import { useTradeStore } from '../../store/useTradeStore';
import { TrendingUp, ArrowUpRight, ArrowDownLeft, Plus, ArrowDownToLine, ArrowRightLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { SkiaPriceChart } from '../../chart/SkiaPriceChart';
import { BiometricService } from '../../services/security/BiometricService';
import { Alert } from 'react-native';

export const PortfolioScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [refreshing, setRefreshing] = useState(false);

  const { cashBalance, holdings, initialTotalValue } = usePortfolioStore();
  const assets = useMarketStore((s) => s.assets);
  const tickMarket = useMarketStore((s) => s.tickMarket);
  const orders = useTradeStore((s) => s.orders);

  // Compute total portfolio value
  const holdingsValue = Object.entries(holdings).reduce((total, [id, qty]) => {
    const asset = assets.find((a) => a.id === id);
    return total + (asset ? asset.currentPrice * qty : 0);
  }, 0);

  const totalPortfolioValue = cashBalance + holdingsValue;
  const pnlAmount = totalPortfolioValue - initialTotalValue;
  const pnlPercent = (pnlAmount / initialTotalValue) * 100;
  const isPositive = pnlAmount >= 0;

  // Derive greeting from actual time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Deterministic smooth portfolio performance chart (no Math.random — avoids flicker on market ticks)
  const portfolioChartData = React.useMemo(() => {
    const steps = 20;
    return Array.from({ length: steps }).map((_, i) => {
      const progress = (i + 1) / steps;
      // Eased curve: ease-in-out using sine approximation
      const easedProgress = 0.5 - Math.cos(progress * Math.PI) / 2;
      return {
        price: initialTotalValue + pnlAmount * easedProgress,
        timestamp: Date.now() - (steps - i) * 3600000,
      };
    });
  }, [initialTotalValue, pnlAmount]);

  const onRefresh = () => {
    setRefreshing(true);
    tickMarket();
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleSecureAction = async (actionName: string) => {
    const success = await BiometricService.authenticate(`Authenticate to ${actionName}`);
    if (success) {
      Alert.alert('Authentication Successful', `Proceeding with ${actionName}...`);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + spacing.md, paddingBottom: insets.bottom + spacing.md },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.accent}
        />
      }
    >
      {/* Greeting Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.subtitle}>Portfolio Overview</Text>
      </View>

      {/* Hero Portfolio Balance Card */}
      <AnimatedCard index={0} style={styles.balanceCard}>
        <View style={styles.balanceHeader}>
          <View>
            <Text style={styles.balanceLabel}>Total Portfolio Value</Text>
            <AnimatedNumber
              value={totalPortfolioValue}
              prefix="£"
              decimals={2}
              style={styles.balanceValue}
            />
          </View>
          {/* P&L Badge */}
          <View
            style={[
              styles.pnlPill,
              { backgroundColor: isPositive ? colors.positiveMuted : colors.negativeMuted },
            ]}
          >
            <TrendingUp
              size={14}
              color={isPositive ? colors.positive : colors.negative}
            />
            <Text
              style={[
                styles.pnlText,
                { color: isPositive ? colors.positive : colors.negative },
              ]}
            >
              {isPositive ? '+' : ''}£{pnlAmount.toFixed(2)} ({isPositive ? '+' : ''}
              {pnlPercent.toFixed(2)}%)
            </Text>
          </View>
        </View>

        <View style={styles.chartContainer}>
          <SkiaPriceChart
            data={portfolioChartData}
            width={320}
            height={120}
            isPositive={isPositive}
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <AnimatedPressable style={styles.actionButton} onPress={() => handleSecureAction('Deposit')}>
            <View style={styles.actionIcon}>
              <Plus size={20} color={colors.primaryText} />
            </View>
            <Text style={styles.actionText}>Deposit</Text>
          </AnimatedPressable>
          <AnimatedPressable style={styles.actionButton} onPress={() => handleSecureAction('Withdraw')}>
            <View style={styles.actionIcon}>
              <ArrowDownToLine size={20} color={colors.primaryText} />
            </View>
            <Text style={styles.actionText}>Withdraw</Text>
          </AnimatedPressable>
          <AnimatedPressable style={styles.actionButton} onPress={() => handleSecureAction('Trade')}>
            <View style={styles.actionIcon}>
              <ArrowRightLeft size={20} color={colors.primaryText} />
            </View>
            <Text style={styles.actionText}>Trade</Text>
          </AnimatedPressable>
        </View>
      </AnimatedCard>

      {/* Assets Breakdown Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Your Assets</Text>
        <AnimatedPressable onPress={() => router.push('/(tabs)/markets')}>
          <Text style={styles.seeAll}>See All</Text>
        </AnimatedPressable>
      </View>

      {assets
        .filter((a) => (holdings[a.id] || 0) > 0)
        .map((asset, index) => {
          const qty = holdings[asset.id] || 0;
          const value = qty * asset.currentPrice;

          return (
            <AnimatedCard key={asset.id} index={index + 1}>
              <AnimatedPressable
                style={styles.assetRow}
                onPress={() => router.push(`/(tabs)/markets`)}
              >
                <View style={styles.assetIconContainer}>
                  <Text style={styles.assetSymbolText}>{asset.symbol.slice(0, 2)}</Text>
                </View>

                <View style={styles.assetInfo}>
                  <Text style={styles.assetName}>{asset.name}</Text>
                  <Text style={styles.assetQty}>
                    {qty.toFixed(4)} {asset.symbol}
                  </Text>
                </View>

                <View style={styles.assetValueCol}>
                  <Text style={styles.assetValue}>£{value.toFixed(2)}</Text>
                  <Text
                    style={[
                      styles.assetChange,
                      { color: asset.change24h >= 0 ? colors.positive : colors.negative },
                    ]}
                  >
                    {asset.change24h >= 0 ? '+' : ''}
                    {asset.change24h.toFixed(2)}%
                  </Text>
                </View>
              </AnimatedPressable>
            </AnimatedCard>
          );
        })}

      {/* Recent Activity Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <AnimatedPressable onPress={() => router.push('/(tabs)/activity')}>
          <Text style={styles.seeAll}>History</Text>
        </AnimatedPressable>
      </View>

      {orders.slice(0, 3).map((order, idx) => (
        <AnimatedCard key={order.id} index={idx + 4}>
          <View style={styles.activityRow}>
            <View
              style={[
                styles.activityIcon,
                {
                  backgroundColor:
                    order.side === 'BUY' ? colors.positiveMuted : colors.negativeMuted,
                },
              ]}
            >
              {order.side === 'BUY' ? (
                <ArrowDownLeft size={18} color={colors.positive} />
              ) : (
                <ArrowUpRight size={18} color={colors.negative} />
              )}
            </View>

            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>
                {order.symbol} {order.side === 'BUY' ? 'Bought' : 'Sold'}
              </Text>
              <Text style={styles.activityTime}>
                {new Date(order.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>

            <Text style={styles.activityAmount}>
              {order.side === 'BUY' ? '-' : '+'}£{order.amount.toFixed(2)}
            </Text>
          </View>
        </AnimatedCard>
      ))}
    </ScrollView>
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
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    ...typography.caption,
    color: colors.secondaryText,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    ...typography.h2,
    color: colors.primaryText,
    marginTop: 2,
  },
  balanceCard: {
    backgroundColor: colors.surfaceElevated,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.xl,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  balanceValue: {
    ...typography.h1,
    color: colors.primaryText,
    marginVertical: spacing.xs,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: spacing.sm,
    height: 120,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderHighlight,
  },
  actionText: {
    ...typography.caption,
    color: colors.primaryText,
    fontWeight: '600',
  },
  // pnlRow was defined but never used — removed
  pnlPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    gap: 4,
  },
  pnlText: {
    ...typography.caption,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.primaryText,
  },
  seeAll: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  assetIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderHighlight,
  },
  assetSymbolText: {
    ...typography.bodyBold,
    color: colors.primaryText,
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    ...typography.bodyBold,
    color: colors.primaryText,
  },
  assetQty: {
    ...typography.caption,
    color: colors.secondaryText,
    marginTop: 2,
  },
  assetValueCol: {
    alignItems: 'flex-end',
  },
  assetValue: {
    ...typography.bodyBold,
    color: colors.primaryText,
  },
  assetChange: {
    ...typography.caption,
    fontWeight: '600',
    marginTop: 2,
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceElevated,
    padding: spacing.lg,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    ...typography.bodyBold,
    color: colors.primaryText,
  },
  activityTime: {
    ...typography.caption,
    color: colors.secondaryText,
    marginTop: 2,
  },
  activityAmount: {
    ...typography.bodyBold,
    color: colors.primaryText,
  },
});
