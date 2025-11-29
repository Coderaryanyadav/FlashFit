import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, CartItem } from "@flashfit/types";

// Removed local Product and CartItem interfaces as they are now imported

interface CartStore {
    items: CartItem[];
    addItem: (product: Product, size?: string, quantity?: number) => void;
    removeItem: (productId: string, size?: string) => void;
    updateQuantity: (productId: string, size: string, quantity: number) => void;
    clearCart: () => void;
    total: () => number;
    getTotal: () => number;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product, size = '', quantity = 1) => {
                const items = get().items;
                const existingItem = items.find((item) => item.id === product.id && item.size === size);

                if (existingItem) {
                    set({
                        items: items.map((item) =>
                            item.id === product.id && item.size === size
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        ),
                    });
                } else {
                    set({ items: [...items, { ...product, quantity, size }] });
                }
            },
            removeItem: (productId, size = '') => {
                set({ items: get().items.filter((item) => !(item.id === productId && item.size === size)) });
            },
            updateQuantity: (productId, size, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId, size);
                    return;
                }
                set({
                    items: get().items.map((item) =>
                        item.id === productId && item.size === size ? { ...item, quantity } : item
                    ),
                });
            },
            clearCart: () => set({ items: [] }),
            total: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
            getTotal: () => get().items.reduce((acc, item) => acc + item.price * item.quantity, 0),
        }),
        {
            name: 'flashfit-cart',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
