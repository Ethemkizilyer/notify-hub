import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  priceCents: number;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

export const MAX_QUANTITY = 99;

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) =>
        set((state) => {
          const existing = state.items.find((item) => item.productId === product.productId);
          if (!existing) return { items: [...state.items, { ...product, quantity: 1 }] };
          return {
            items: state.items.map((item) =>
              item.productId === product.productId
                ? { ...item, quantity: Math.min(item.quantity + 1, MAX_QUANTITY) }
                : item,
            ),
          };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(Math.max(quantity, 1), MAX_QUANTITY) }
              : item,
          ),
        })),
      removeItem: (productId) =>
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    { name: 'notifyhub-cart' },
  ),
);
