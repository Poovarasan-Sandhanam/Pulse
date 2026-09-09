import { create } from 'zustand';

export interface AssetHolding {
  assetId: string;
  symbol: string;
  amount: number; // e.g. 0.0826 BTC
}

interface PortfolioState {
  cashBalance: number; // USD cash
  holdings: Record<string, number>; // assetId -> crypto quantity (e.g. 'btc': 0.0826)
  initialTotalValue: number;

  updateHolding: (assetId: string, deltaAmount: number, deltaCash: number) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  cashBalance: 2281.72,
  holdings: {
    btc: 0.0826,
    eth: 0.9144,
    sol: 12.424,
  },
  initialTotalValue: 12054.20,

  updateHolding: (assetId, deltaQuantity, deltaCash) =>
    set((state) => ({
      cashBalance: Math.max(0, state.cashBalance + deltaCash),
      holdings: {
        ...state.holdings,
        [assetId]: Math.max(0, (state.holdings[assetId] || 0) + deltaQuantity),
      },
    })),
}));
