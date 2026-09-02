import { create } from 'zustand';
import { CryptoAsset, initializeMarketData, generateMarketTick } from '../services/market/MarketSimulator';
import { fetchLiveMarketAssets } from '../services/market/CoinGeckoService';

interface MarketState {
  assets: CryptoAsset[];
  searchQuery: string;
  watchlistOnly: boolean;
  selectedTimeframe: '1H' | '1D' | '1W' | '1M' | '1Y';
  isLiveUpdating: boolean;
  isLoadingRealData: boolean;

  setSearchQuery: (query: string) => void;
  setWatchlistOnly: (watchlistOnly: boolean) => void;
  toggleWatchlist: (assetId: string) => void;
  setSelectedTimeframe: (timeframe: '1H' | '1D' | '1W' | '1M' | '1Y') => void;
  tickMarket: () => void;
  setLiveUpdating: (active: boolean) => void;
  fetchRealMarketPrices: () => Promise<void>;
}

export const useMarketStore = create<MarketState>((set, get) => {
  // Trigger initial background fetch of real market prices
  setTimeout(() => {
    get().fetchRealMarketPrices();
  }, 100);

  return {
    assets: [],
    searchQuery: '',
    watchlistOnly: false,
    selectedTimeframe: '1D',
    isLiveUpdating: true,
    isLoadingRealData: true,

    setSearchQuery: (searchQuery) => set({ searchQuery }),
    setWatchlistOnly: (watchlistOnly) => set({ watchlistOnly }),

    toggleWatchlist: (assetId) =>
      set((state) => ({
        assets: state.assets.map((asset) =>
          asset.id === assetId ? { ...asset, isWatchlisted: !asset.isWatchlisted } : asset
        ),
      })),

    setSelectedTimeframe: (selectedTimeframe) => set({ selectedTimeframe }),

    tickMarket: () =>
      set((state) => {
        if (!state.isLiveUpdating) return state;
        return { assets: generateMarketTick(state.assets) };
      }),

    setLiveUpdating: (isLiveUpdating) => set({ isLiveUpdating }),

    fetchRealMarketPrices: async () => {
      set({ isLoadingRealData: true });
      const liveAssets = await fetchLiveMarketAssets();
      if (liveAssets && liveAssets.length > 0) {
        set((state) => {
          // Merge watchlisted status from previous state
          const watchlistedMap = new Map(state.assets.map((a) => [a.id, a.isWatchlisted]));
          const mergedAssets = liveAssets.map((asset) => ({
            ...asset,
            isWatchlisted: watchlistedMap.has(asset.id)
              ? Boolean(watchlistedMap.get(asset.id))
              : asset.isWatchlisted,
          }));
          return { assets: mergedAssets, isLoadingRealData: false };
        });
      } else {
        // Fallback to synthetic if live fetch fails and we have no assets
        set((state) => ({
          assets: state.assets.length > 0 ? state.assets : initializeMarketData(),
          isLoadingRealData: false,
        }));
      }
    },
  };
});
