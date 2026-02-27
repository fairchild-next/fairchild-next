"use client";

import { create } from "zustand";

export type ProductType =
  | "scheduled-daily"
  | "general-daily"
  | "special-event"
  | "flex"
  | "membership";

export interface CartItem {
  id: string;
  productType: ProductType;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  slotId?: string;
}

interface CartState {
  items: CartItem[];

  addItems: (items: CartItem[]) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],

  // Replace items for same slot instead of blindly appending
  addItems: (newItems) =>
    set((state) => {
      const slotId = newItems[0]?.slotId;

      const filtered = state.items.filter(
        (item) => item.slotId !== slotId
      );

      return {
        items: [...filtered, ...newItems],
      };
    }),

  updateQuantity: (id, quantity) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, quantity } : item
      ),
    })),

  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),

  clearCart: () => set({ items: [] }),
}));