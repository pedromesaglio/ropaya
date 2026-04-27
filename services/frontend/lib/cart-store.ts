import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "./api";

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, size: string) => void;
  removeItem: (productId: number, size: string) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size) => {
        set((state) => {
          const existing = state.items.find(
            (i) => i.product.id === product.id && i.size === size
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.product.id === product.id && i.size === size
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
            };
          }
          return { items: [...state.items, { product, size, quantity: 1 }] };
        });
      },
      removeItem: (productId, size) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.product.id === productId && i.size === size)
          ),
        }));
      },
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    }),
    { name: "ropaya-cart" }
  )
);
