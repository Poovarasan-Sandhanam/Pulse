import { usePortfolioStore } from '../store/usePortfolioStore';

describe('Portfolio Store', () => {
  beforeEach(() => {
    usePortfolioStore.setState({
      cashBalance: 1000,
      holdings: { btc: 0.1 },
      initialTotalValue: 5000,
    });
  });

  it('updates holdings and cash balance correctly', () => {
    const { updateHolding } = usePortfolioStore.getState();

    // Buy 0.05 BTC for £250
    updateHolding('btc', 0.05, -250);

    const state = usePortfolioStore.getState();
    expect(state.cashBalance).toBe(750);
    expect(state.holdings['btc']).toBeCloseTo(0.15);
  });

  it('handles sell transaction updating cash balance and holdings', () => {
    const { updateHolding } = usePortfolioStore.getState();

    // Sell 0.05 BTC for £250
    updateHolding('btc', -0.05, 250);

    const state = usePortfolioStore.getState();
    expect(state.cashBalance).toBe(1250);
    expect(state.holdings['btc']).toBeCloseTo(0.05);
  });
});
