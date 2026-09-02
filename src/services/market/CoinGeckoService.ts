import { PricePoint, CryptoAsset } from './MarketSimulator';

const ASSET_MAPPING: Record<string, { symbol: string; color: string }> = {
  bitcoin: { symbol: 'BTC', color: '#F7931A' },
  ethereum: { symbol: 'ETH', color: '#627EEA' },
  solana: { symbol: 'SOL', color: '#14F195' },
  ripple: { symbol: 'XRP', color: '#23292F' },
  cardano: { symbol: 'ADA', color: '#0033AD' },
  dogecoin: { symbol: 'DOGE', color: '#C2A633' },
};

/**
 * Fetch real-time market prices, 24h changes, and sparklines from CoinGecko API
 */
export async function fetchLiveMarketAssets(): Promise<CryptoAsset[]> {
  try {
    const ids = Object.keys(ASSET_MAPPING).join(',');
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const json = await response.json();
    if (!Array.isArray(json)) {
      throw new Error('Invalid format returned by CoinGecko coins/markets API');
    }

    const now = Date.now();
    const assets: CryptoAsset[] = json.map((coin: any) => {
      const meta = ASSET_MAPPING[coin.id] || {
        symbol: (coin.symbol || '').toUpperCase(),
        color: '#3B82F6',
      };

      const rawSparkline: number[] = coin.sparkline_in_7d?.price || [];
      // Subsample sparkline to ~30 points for crisp UI sparkline rendering
      const sparklineStep = Math.max(1, Math.floor(rawSparkline.length / 30));
      const sparkline = rawSparkline.filter((_, idx) => idx % sparklineStep === 0);

      const intervalMs = (7 * 24 * 3600 * 1000) / (sparkline.length || 1);
      const chartData: PricePoint[] = sparkline.map((price, idx) => ({
        timestamp: now - (sparkline.length - 1 - idx) * intervalMs,
        price: parseFloat(price.toFixed(price > 10 ? 2 : 4)),
      }));

      const currentPrice = coin.current_price || 0;
      const change24hAmount = coin.price_change_24h || 0;
      const previous24hPrice = currentPrice - change24hAmount;
      const change24h = coin.price_change_percentage_24h || 0;

      return {
        id: coin.symbol === 'btc' ? 'btc' : coin.symbol === 'eth' ? 'eth' : coin.symbol === 'sol' ? 'sol' : coin.id,
        name: coin.name,
        symbol: meta.symbol,
        color: meta.color,
        currentPrice: parseFloat(currentPrice.toFixed(currentPrice > 10 ? 2 : 4)),
        previous24hPrice: parseFloat(previous24hPrice.toFixed(previous24hPrice > 10 ? 2 : 4)),
        change24h: parseFloat(change24h.toFixed(2)),
        change24hAmount: parseFloat(change24hAmount.toFixed(4)),
        sparkline,
        chartData,
        isWatchlisted: coin.symbol === 'btc' || coin.symbol === 'eth' || coin.symbol === 'sol',
      };
    });

    return assets;
  } catch (error) {
    console.log('CoinGecko live prices fetch failed, returning static fallback:', error);
    return [];
  }
}

/**
 * Fetch historical market chart data from CoinGecko public API
 * @param assetId CoinGecko coin identifier (e.g., 'bitcoin', 'ethereum', 'solana')
 * @param days Number of days of history (e.g. 1, 7, 30, 90)
 */
export async function fetchCoinGeckoMarketData(
  assetId: string = 'bitcoin',
  days: number = 30
): Promise<PricePoint[]> {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${assetId}/market_chart?vs_currency=usd&days=${days}`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const json = await response.json();
    if (!json.prices || !Array.isArray(json.prices)) {
      throw new Error('Invalid format returned by CoinGecko API');
    }

    // CoinGecko returns array of [timestamp_ms, price]
    const dataPoints: PricePoint[] = json.prices.map(([timestamp, price]: [number, number]) => ({
      timestamp,
      price: parseFloat(price.toFixed(4)),
    }));

    return dataPoints;
  } catch (error) {
    console.log('CoinGecko API fetch failed, falling back to simulated data:', error);
    return generateFallbackCoinGeckoData(days * 24 * 4);
  }
}

/**
 * Fallback generator for realistic data when offline or rate-limited
 */
function generateFallbackCoinGeckoData(pointsCount: number): PricePoint[] {
  const data: PricePoint[] = [];
  const now = Date.now();
  const interval = (30 * 24 * 3600 * 1000) / pointsCount;
  let price = 62450.0;

  for (let i = pointsCount; i >= 0; i--) {
    const timestamp = now - i * interval;
    const variation = (Math.random() - 0.492) * 0.006 * price;
    price = Math.max(100, price + variation);
    data.push({ timestamp, price: parseFloat(price.toFixed(2)) });
  }

  return data;
}
