import { create } from 'zustand';

export interface TradeOrder {
  id: string;
  assetId: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  amount: number;
  quantity: number;
  fee: number;
  price: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: number;
}

interface TradeState {
  orders: TradeOrder[];
  addOrder: (order: TradeOrder) => void;
  updateOrderStatus: (id: string, status: TradeOrder['status']) => void;
}

export const useTradeStore = create<TradeState>((set) => ({
  orders: [
    {
      id: 'ord-101',
      assetId: 'btc',
      symbol: 'BTC',
      side: 'BUY',
      amount: 500,
      quantity: 0.00788,
      fee: 2.50,
      price: 63420.25,
      status: 'completed',
      createdAt: Date.now() - 3600 * 1000 * 2,
    },
    {
      id: 'ord-102',
      assetId: 'eth',
      symbol: 'ETH',
      side: 'SELL',
      amount: 200,
      quantity: 0.0586,
      fee: 1.00,
      price: 3412.50,
      status: 'completed',
      createdAt: Date.now() - 3600 * 1000 * 26,
    },
  ],

  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),

  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
    })),
}));
