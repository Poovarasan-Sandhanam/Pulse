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

  it('keeps ticked prices anchored to the last real price', () => {
    // Worst case: an RNG pinned to its maximum, pushing upward every tick.
    let assets = initializeMarketData().map((a) => ({ ...a, anchorPrice: a.currentPrice }));
    const anchors = new Map(assets.map((a) => [a.id, a.anchorPrice]));

    for (let i = 0; i < 500; i++) {
      assets = generateMarketTick(assets, () => 1);
    }

    for (const asset of assets) {
      const anchor = anchors.get(asset.id) as number;
      const drift = Math.abs(asset.currentPrice - anchor) / anchor;
      expect(drift).toBeLessThanOrEqual(0.0021);
    }
  });

  it('pulls price back toward the anchor when it has moved away', () => {
    const [asset] = initializeMarketData();
    const anchor = asset.currentPrice;
    // Start well above the anchor, then tick with a neutral RNG.
    let drifted = [{ ...asset, currentPrice: anchor * 1.05, anchorPrice: anchor }];

    const before = Math.abs(drifted[0].currentPrice - anchor);
    for (let i = 0; i < 10; i++) {
      drifted = generateMarketTick(drifted, () => 0.5);
    }
    const after = Math.abs(drifted[0].currentPrice - anchor);

    expect(after).toBeLessThan(before);
  });
});
