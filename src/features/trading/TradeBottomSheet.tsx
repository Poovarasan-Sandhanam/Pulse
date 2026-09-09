import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
} from 'react-native';
import { colors, radius, spacing, typography } from '../../theme/tokens';
import { MotionBottomSheet } from '../../components/MotionBottomSheet';
import { SwipeToConfirm } from '../../components/SwipeToConfirm';
import { CryptoAsset } from '../../services/market/MarketSimulator';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { placeOrder } from '../../services/trading/orderService';
import { AnimatedCard } from '../../motion/primitives/AnimatedCard';
import { CheckCircle2 } from 'lucide-react-native';

interface TradeBottomSheetProps {
  isVisible: boolean;
  side: 'BUY' | 'SELL';
  asset: CryptoAsset;
  onClose: () => void;
}

export const TradeBottomSheet: React.FC<TradeBottomSheetProps> = ({
  isVisible,
  side,
  asset,
  onClose,
}) => {
  const [amountStr, setAmountStr] = useState('500');
  const [isCompleted, setIsCompleted] = useState(false);
  // Track a session key so SwipeToConfirm fully remounts (resets shared values) each open
  const sessionRef = useRef(0);

  // Reset all form state whenever the sheet opens
  useEffect(() => {
    if (isVisible) {
      sessionRef.current += 1;
      setAmountStr('500');
      setIsCompleted(false);
    }
  }, [isVisible]);

  const { cashBalance, holdings } = usePortfolioStore();

  const amount = parseFloat(amountStr) || 0;
  const userQty = holdings[asset.id] || 0;
  const availableBalance = side === 'BUY' ? cashBalance : userQty * asset.currentPrice;

  const estimatedFee = parseFloat((amount * 0.005).toFixed(2));
  const netAmount = side === 'BUY' ? Math.max(0, amount - estimatedFee) : amount;
  const receiveQuantity = amount > 0 ? (netAmount / asset.currentPrice).toFixed(6) : '0';

  const isValidAmount = amount > 0 && amount <= availableBalance;

  const handleConfirmTrade = async () => {
    await placeOrder({
      assetId: asset.id,
      symbol: asset.symbol,
      side,
      amount,
      price: asset.currentPrice,
    });

    setIsCompleted(true);
    setTimeout(() => {
      setIsCompleted(false);
      onClose();
    }, 2000);
  };

  return (
    <MotionBottomSheet isVisible={isVisible} onClose={onClose} snapPoints={[0.85]}>
      <ScrollView
        style={styles.scrollContent}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {isCompleted ? (
          <AnimatedCard style={styles.successContainer}>
            <CheckCircle2 size={64} color={colors.positive} strokeWidth={2} />
            <Text style={styles.successTitle}>
              {asset.symbol} {side === 'BUY' ? 'Purchased' : 'Sold'}
            </Text>
            <Text style={styles.successAmount}>${amount.toFixed(2)}</Text>
            <Text style={styles.successQuantity}>
              {receiveQuantity} {asset.symbol}
            </Text>
          </AnimatedCard>
        ) : (
          <>
            <Text style={styles.sheetTitle}>
              {side} {asset.name}
            </Text>

            {/* Available Balance Header */}
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Available</Text>
              <Text style={styles.balanceValue}>
                {side === 'BUY'
                  ? `$${cashBalance.toFixed(2)}`
                  : `${userQty.toFixed(4)} ${asset.symbol} ($${(userQty * asset.currentPrice).toFixed(2)})`}
              </Text>
            </View>

            {/* Amount Input */}
            <View style={styles.inputCard}>
              <Text style={styles.inputLabel}>Amount (USD)</Text>
              <View style={styles.inputRow}>
                <Text style={styles.currencyPrefix}>$</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={amountStr}
                  onChangeText={setAmountStr}
                  placeholder="0"
                  placeholderTextColor={colors.tertiaryText}
                />
              </View>

              {amount > availableBalance && (
                <Text style={styles.errorText}>
                  {availableBalance === 0
                    ? `You don't own any ${asset.symbol} to sell`
                    : 'Insufficient available balance'}
                </Text>
              )}
            </View>

            {/* Calculation Breakdown */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakdownRow}>
                {/* BUY: show crypto received. SELL: show USD received after fee */}
                <Text style={styles.bdLabel}>
                  {side === 'BUY' ? 'You receive' : 'You receive (USD)'}
                </Text>
                <Text style={styles.bdValue}>
                  {side === 'BUY'
                    ? `${receiveQuantity} ${asset.symbol}`
                    : `$${Math.max(0, amount - estimatedFee).toFixed(2)}`}
                </Text>
              </View>

              {side === 'BUY' && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.bdLabel}>Crypto sold</Text>
                  <Text style={styles.bdValue}>
                    {amount > 0 ? (amount / asset.currentPrice).toFixed(6) : '0'} {asset.symbol}
                  </Text>
                </View>
              )}

              {side === 'SELL' && (
                <View style={styles.breakdownRow}>
                  <Text style={styles.bdLabel}>Crypto sold</Text>
                  <Text style={styles.bdValue}>
                    {amount > 0 ? (amount / asset.currentPrice).toFixed(6) : '0'} {asset.symbol}
                  </Text>
                </View>
              )}

              <View style={styles.breakdownRow}>
                <Text style={styles.bdLabel}>Execution Price</Text>
                <Text style={styles.bdValue}>${asset.currentPrice.toFixed(2)}</Text>
              </View>

              <View style={styles.breakdownRow}>
                <Text style={styles.bdLabel}>Estimated fee (0.5%)</Text>
                <Text style={styles.bdValue}>${estimatedFee.toFixed(2)}</Text>
              </View>
            </View>

            {/* Hero Swipe to Confirm — keyed by session so shared values reset each open */}
            <View style={styles.swipeContainer}>
              <SwipeToConfirm
                key={sessionRef.current}
                label={`Swipe to ${side}`}
                disabled={!isValidAmount}
                onConfirm={handleConfirmTrade}
              />
            </View>
          </>
        )}
      </ScrollView>
    </MotionBottomSheet>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sheetTitle: {
    ...typography.h2,
    color: colors.primaryText,
    marginBottom: spacing.xs,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  balanceLabel: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  balanceValue: {
    ...typography.caption,
    color: colors.primaryText,
    fontWeight: '700',
  },
  inputCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  currencyPrefix: {
    ...typography.monoLarge,
    color: colors.primaryText,
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.monoLarge,
    color: colors.primaryText,
  },
  errorText: {
    ...typography.caption,
    color: colors.negative,
    marginTop: spacing.xs,
  },
  breakdownCard: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bdLabel: {
    ...typography.caption,
    color: colors.secondaryText,
  },
  bdValue: {
    ...typography.caption,
    color: colors.primaryText,
    fontWeight: '600',
  },
  swipeContainer: {
    marginTop: 'auto',
    marginBottom: spacing.md,
  },
  successContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  successTitle: {
    ...typography.h2,
    color: colors.primaryText,
    marginTop: spacing.md,
  },
  successAmount: {
    ...typography.monoLarge,
    color: colors.positive,
  },
  successQuantity: {
    ...typography.bodyBold,
    color: colors.secondaryText,
  },
});
