import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FlashList } from '@shopify/flash-list';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { useTradeStore, TradeOrder } from '../../store/useTradeStore';
import { AnimatedCard } from '../../motion/primitives/AnimatedCard';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Clock } from 'lucide-react-native';

export const ActivityScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const orders = useTradeStore((s) => s.orders);

  const renderOrderItem = ({ item, index }: { item: TradeOrder; index: number }) => {
    const isBuy = item.side === 'BUY';
    const isCompleted = item.status === 'completed';

    return (
      <AnimatedCard index={index}>
        <View style={styles.card}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: isBuy ? colors.positiveMuted : colors.negativeMuted },
            ]}
          >
            {isBuy ? (
              <ArrowDownLeft size={20} color={colors.positive} />
            ) : (
              <ArrowUpRight size={20} color={colors.negative} />
            )}
          </View>

          <View style={styles.infoCol}>
            <Text style={styles.itemTitle}>
              {item.symbol} {isBuy ? 'Bought' : 'Sold'}
            </Text>
            <Text style={styles.date}>
              {new Date(item.createdAt).toLocaleDateString([], {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>

          <View style={styles.valueCol}>
            <Text style={styles.amount}>
              {isBuy ? '-' : '+'}£{item.amount.toFixed(2)}
            </Text>
            <View style={styles.statusRow}>
              {isCompleted ? (
                <CheckCircle2 size={12} color={colors.positive} />
              ) : (
                <Clock size={12} color={colors.amber} />
              )}
              <Text
                style={[
                  styles.statusText,
                  { color: isCompleted ? colors.positive : colors.amber },
                ]}
              >
                {item.status}
              </Text>
            </View>
          </View>
        </View>
      </AnimatedCard>
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <Text style={styles.headerTitle}>Activity History</Text>
        <Text style={styles.subtitle}>Recent simulated transactions</Text>
      </View>

      <FlashList
        data={orders}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        estimatedItemSize={76}
        renderItem={renderOrderItem}
        contentContainerStyle={{
          padding: spacing.md,
          paddingBottom: insets.bottom + spacing.md,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.primaryText,
  },
  subtitle: {
    ...typography.caption,
    color: colors.secondaryText,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoCol: {
    flex: 1,
  },
  itemTitle: {
    ...typography.bodyBold,
    color: colors.primaryText,
  },
  date: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  valueCol: {
    alignItems: 'flex-end',
  },
  amount: {
    ...typography.mono,
    color: colors.primaryText,
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
