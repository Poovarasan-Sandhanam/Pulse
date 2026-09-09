import { initializeMarketData, generateMarketTick } from '../services/market/MarketSimulator';

describe('Market Simulator Engine', () => {
  it('initializes market assets with valid historical dataset and sparklines', () => {
    const assets = initializeMarketData();
    expect(assets.length).toBeGreaterThan(0);

    const btc = assets.find((a) => a.symbol === 'BTC');
    expect(btc).toBeDefined();
    expect(btc?.sparkline.length).toBe(20);
    expect(btc?.chartData.length).toBeGreaterThan(50);
  });

  it('updates asset prices smoothly on tick simulation', () => {
    const initialAssets = initializeMarketData();
    const btcInitial = initialAssets.find((a) => a.symbol === 'BTC')?.currentPrice || 0;

    const tickedAssets = generateMarketTick(initialAssets);
    const btcTicked = tickedAssets.find((a) => a.symbol === 'BTC')?.currentPrice || 0;

    expect(btcTicked).toBeGreaterThan(0);
    // Price delta should be controlled (within 2% per tick)
    expect(Math.abs(btcTicked - btcInitial)).toBeLessThan(btcInitial * 0.02);
  });
});
