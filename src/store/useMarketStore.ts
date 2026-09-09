import { create } from 'zustand';
import { CryptoAsset, initializeMarketData, generateMarketTick } from '../services/market/MarketSimulator';

interface MarketState {
  assets: CryptoAsset[];
  searchQuery: string;
  watchlistOnly: boolean;
  selectedTimeframe: '1H' | '1D' | '1W' | '1M' | '1Y';
  isLiveUpdating: boolean;

  setSearchQuery: (query: string) => void;
  setWatchlistOnly: (watchlistOnly: boolean) => void;
  toggleWatchlist: (assetId: string) => void;
  setSelectedTimeframe: (timeframe: '1H' | '1D' | '1W' | '1M' | '1Y') => void;
  tickMarket: () => void;
  setLiveUpdating: (active: boolean) => void;
}

export const useMarketStore = create<MarketState>((set) => ({
  assets: initializeMarketData(),
  searchQuery: '',
  watchlistOnly: false,
  selectedTimeframe: '1D',
  isLiveUpdating: true,

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
}));
