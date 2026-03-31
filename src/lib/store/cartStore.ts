"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

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
  /** For flex tickets: true = weekend/peak, false = weekday/off-peak */
  isPeak?: boolean;
  /** For special-event: event uuid */
  eventId?: string;
}

interface CartState {
  items: CartItem[];

  addItems: (items: CartItem[]) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      // Scheduled: replace items for same slot. Event: replace items for same event.
      // General-daily/flex: merge into existing item if same product, else append.
      addItems: (newItems) =>
        set((state) => {
          const slotId = newItems[0]?.slotId;
          const eventId = newItems[0]?.eventId;

          let result =
            slotId !== undefined
              ? state.items.filter((item) => item.slotId !== slotId)
              : eventId !== undefined
                ? state.items.filter((item) => item.eventId !== eventId)
                : [...state.items];

          for (const newItem of newItems) {
            const match = result.find(
              (i) =>
                i.productId === newItem.productId &&
                i.productType === newItem.productType &&
                (newItem.productType !== "flex" || i.isPeak === newItem.isPeak) &&
                (newItem.productType !== "special-event" || i.eventId === newItem.eventId) &&
                (newItem.slotId == null || i.slotId === newItem.slotId)
            );
            if (match) {
              result = result.map((r) =>
                r.id === match.id
                  ? { ...r, quantity: r.quantity + newItem.quantity }
                  : r
              );
            } else {
              result.push(newItem);
            }
          }

          return { items: result };
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
    }),
    { name: "fairchild-cart" }
  )
);