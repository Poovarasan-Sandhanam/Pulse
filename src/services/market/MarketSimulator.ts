export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface CryptoAsset {
  id: string;
  name: string;
  symbol: string;
  color: string;
  currentPrice: number;
  previous24hPrice: number;
  change24h: number;
  change24hAmount: number;
  sparkline: number[];
  chartData: PricePoint[];
  isWatchlisted: boolean;
  /** Last real price from the market feed. Ticks drift around this, not away from it. */
  anchorPrice: number;
}

/** Hard cap on how far a tick may wander from the anchor, as a fraction of it. */
const MAX_DRIFT = 0.002;
/** Pull back toward the anchor per tick; keeps drift bounded between fetches. */
const REVERSION = 0.15;

const INITIAL_ASSETS: Omit<CryptoAsset, 'sparkline' | 'chartData' | 'change24h' | 'change24hAmount'>[] = [
  { id: 'btc', name: 'Bitcoin', symbol: 'BTC', color: '#F7931A', currentPrice: 63420.25, previous24hPrice: 60832.10, isWatchlisted: true },
  { id: 'eth', name: 'Ethereum', symbol: 'ETH', color: '#627EEA', currentPrice: 3412.50, previous24hPrice: 3342.30, isWatchlisted: true },
  { id: 'sol', name: 'Solana', symbol: 'SOL', color: '#14F195', currentPrice: 148.10, previous24hPrice: 149.30, isWatchlisted: true },
  { id: 'xrp', name: 'XRP', symbol: 'XRP', color: '#23292F', currentPrice: 0.584, previous24hPrice: 0.562, isWatchlisted: false },
  { id: 'ada', name: 'Cardano', symbol: 'ADA', color: '#0033AD', currentPrice: 0.382, previous24hPrice: 0.395, isWatchlisted: false },
  { id: 'doge', name: 'Dogecoin', symbol: 'DOGE', color: '#C2A633', currentPrice: 0.124, previous24hPrice: 0.118, isWatchlisted: false },
];

/**
 * Generate historical price dataset for an asset
 */
function generateHistoricalChart(basePrice: number, points = 60): PricePoint[] {
  const data: PricePoint[] = [];
  const now = Date.now();
  const interval = 60 * 1000; // 1 minute interval
  let price = basePrice * 0.96;

  for (let i = points; i >= 0; i--) {
    const time = now - i * interval;
    const variation = (Math.random() - 0.48) * 0.008 * price;
    price = Math.max(0.01, price + variation);
    data.push({ timestamp: time, price: parseFloat(price.toFixed(4)) });
  }

  // Ensure last point aligns with base price
  data[data.length - 1].price = basePrice;
  return data;
}

/**
 * Generate large synthetic benchmark dataset using Geometric Brownian Motion
 */
export function generateSyntheticDataset(count: number, basePrice: number = 63420.25): PricePoint[] {
  const data: PricePoint[] = new Array(count);
  const now = Date.now();
  const intervalMs = 5000; // 5-second interval between samples
  let price = basePrice * 0.85;

  for (let i = 0; i < count; i++) {
    const timestamp = now - (count - i) * intervalMs;
    const variation = (Math.random() - 0.492) * 0.004 * price;
    price = Math.max(0.01, price + variation);
    data[i] = { timestamp, price: parseFloat(price.toFixed(2)) };
  }

  return data;
}


export function initializeMarketData(): CryptoAsset[] {
  return INITIAL_ASSETS.map((asset) => {
    const chartData = generateHistoricalChart(asset.currentPrice, 60);
    const sparkline = chartData.slice(-20).map((d) => d.price);
    const change24hAmount = asset.currentPrice - asset.previous24hPrice;
    const change24h = (change24hAmount / asset.previous24hPrice) * 100;

    return {
      ...asset,
      change24h: parseFloat(change24h.toFixed(2)),
      change24hAmount: parseFloat(change24hAmount.toFixed(4)),
      sparkline,
      chartData,
      anchorPrice: asset.currentPrice,
    };
  });
}

/**
 * Controlled Random Walk (Geometric Brownian Motion tick update)
 */
export function generateMarketTick(assets: CryptoAsset[], rand: () => number = Math.random): CryptoAsset[] {
  return assets.map((asset) => {
    const anchor = asset.anchorPrice || asset.currentPrice;

    // Ornstein-Uhlenbeck style step: random jitter plus a pull back toward the
    // anchor, so intra-fetch motion stays visible without wandering off the
    // real price. Clamping bounds the worst case if fetches stop arriving.
    const volatility = anchor > 1000 ? 0.0012 : 0.0025;
    const jitter = (rand() - 0.5) * volatility * anchor;
    const reversion = (anchor - asset.currentPrice) * REVERSION;
    const drifted = asset.currentPrice + jitter + reversion;

    const clamped = Math.min(
      anchor * (1 + MAX_DRIFT),
      Math.max(anchor * (1 - MAX_DRIFT), drifted)
    );
    const newPrice = Math.max(0.001, parseFloat(clamped.toFixed(anchor > 10 ? 2 : 4)));

    const newChartData = [
      ...asset.chartData.slice(1),
      { timestamp: Date.now(), price: newPrice },
    ];
    const newSparkline = newChartData.slice(-20).map((d) => d.price);

    const change24hAmount = newPrice - asset.previous24hPrice;
    const change24h = (change24hAmount / asset.previous24hPrice) * 100;

    return {
      ...asset,
      currentPrice: newPrice,
      change24h: parseFloat(change24h.toFixed(2)),
      change24hAmount: parseFloat(change24hAmount.toFixed(4)),
      sparkline: newSparkline,
      chartData: newChartData,
    };
  });
}
