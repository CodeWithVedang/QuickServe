import { create } from 'zustand';
import type { MenuItem } from '../types';

export interface CartItem extends MenuItem {
  quantity: number;
}

interface OrderState {
  tableNumber: number | null;
  items: CartItem[];
  setTableNumber: (num: number | null) => void;
  addItem: (menuItem: MenuItem) => void;
  removeItem: (menuItemId: string) => void;
  clearOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
  tableNumber: null,
  items: [],
  setTableNumber: (num) => set({ tableNumber: num }),
  addItem: (menuItem) => set((state) => {
    const existing = state.items.find(i => i.id === menuItem.id);
    if (existing) {
      return {
        items: state.items.map(i => 
          i.id === menuItem.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      };
    }
    return { items: [...state.items, { ...menuItem, quantity: 1 }] };
  }),
  removeItem: (menuItemId) => set((state) => ({
    items: state.items.filter(i => i.id !== menuItemId)
  })),
  clearOrder: () => set({ items: [], tableNumber: null })
}));
