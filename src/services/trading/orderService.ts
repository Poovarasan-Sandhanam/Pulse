import { useTradeStore, TradeOrder } from '../../store/useTradeStore';
import { usePortfolioStore } from '../../store/usePortfolioStore';
import { soundService } from '../sound';
import { haptics } from '../haptics';

interface PlaceOrderParams {
  assetId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  amount: number;
  price: number;
}

export async function placeOrder(params: PlaceOrderParams): Promise<TradeOrder> {
  const fee = parseFloat((params.amount * 0.005).toFixed(2)); // 0.5% simulated fee
  const netAmount = params.side === 'BUY' ? params.amount - fee : params.amount;
  const quantity = parseFloat((netAmount / params.price).toFixed(6));

  const orderId = `ord-${Date.now()}`;
  const newOrder: TradeOrder = {
    id: orderId,
    assetId: params.assetId,
    symbol: params.symbol,
    side: params.side,
    amount: params.amount,
    quantity,
    fee,
    price: params.price,
    status: 'pending',
    createdAt: Date.now(),
  };

  const { addOrder, updateOrderStatus } = useTradeStore.getState();
  const { updateHolding } = usePortfolioStore.getState();

  addOrder(newOrder);

  // Simulate realistic short processing delay
  await new Promise((resolve) => setTimeout(resolve, 600));
  updateOrderStatus(orderId, 'processing');

  await new Promise((resolve) => setTimeout(resolve, 800));
  updateOrderStatus(orderId, 'completed');

  // Update portfolio balances
  if (params.side === 'BUY') {
    updateHolding(params.assetId, quantity, -params.amount);
  } else {
    updateHolding(params.assetId, -quantity, params.amount - fee);
  }

  // Trigger feedback
  haptics.success();
  soundService.playSuccessSound().catch(() => {});

  return { ...newOrder, status: 'completed' };
}
