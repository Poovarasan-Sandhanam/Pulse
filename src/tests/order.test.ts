import { placeOrder } from '../services/trading/orderService';
import { usePortfolioStore } from '../store/usePortfolioStore';
import { useTradeStore } from '../store/useTradeStore';

describe('Order Service & Portfolio Calculations', () => {
  beforeEach(() => {
    usePortfolioStore.setState({
      cashBalance: 2000,
      holdings: { btc: 0.1 },
    });
    useTradeStore.setState({ orders: [] });
  });

  it('correctly calculates 0.5% fee and updates holdings on BUY', async () => {
    const initialCash = usePortfolioStore.getState().cashBalance;

    const order = await placeOrder({
      assetId: 'btc',
      symbol: 'BTC',
      side: 'BUY',
      amount: 500,
      price: 50000,
    });

    expect(order.fee).toBe(2.5); // 0.5% of £500
    expect(order.status).toBe('completed');

    const updatedCash = usePortfolioStore.getState().cashBalance;
    expect(updatedCash).toBe(initialCash - 500);

    const btcQty = usePortfolioStore.getState().holdings['btc'];
    expect(btcQty).toBeGreaterThan(0.1);
  });
});
