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
    validateCart: () => Promise<void>;
    syncCart: (userId: string) => Promise<void>;
    setItems: (items: CartItem[]) => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (product, size = '', quantity = 1) => {
                if (quantity <= 0) return; // Prevent adding invalid quantities

                const items = get().items;
                const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
                const MAX_ITEMS = 50;

                if (totalItems + quantity > MAX_ITEMS) {
                    // You might want to show a toast here, but store actions are pure.
                    // The UI calling this should handle the error or we can return a success boolean.
                    // For now, we just cap it or return.
                    console.warn("Cart limit reached");
                    return;
                }

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
            validateCart: async () => {
                const items = get().items;
                if (items.length === 0) return;

                try {
                    const { doc, getDoc } = await import("firebase/firestore");
                    const { db } = await import("@/utils/firebase");
                    const { toast } = await import("sonner");

                    const updatedItems = [...items];
                    let hasChanges = false;

                    for (let i = 0; i < updatedItems.length; i++) {
                        const item = updatedItems[i];
                        const productRef = doc(db, "products", item.id);
                        const productSnap = await getDoc(productRef);

                        if (!productSnap.exists()) {
                            // Product deleted
                            updatedItems.splice(i, 1);
                            i--;
                            hasChanges = true;
                            toast.error(`Item removed: ${item.title}`, {
                                description: "This product is no longer available."
                            });
                            continue;
                        }

                        const data = productSnap.data();

                        // Check for price change
                        if (data.price !== item.price) {
                            updatedItems[i] = { ...item, price: data.price };
                            hasChanges = true;
                            toast.info(`Price updated: ${item.title}`, {
                                description: `Price changed from ₹${item.price} to ₹${data.price}`
                            });
                        }

                        // Check for stock availability (Optional: could remove if OOS)
                        // For now, we just validate existence and price.
                    }

                    if (hasChanges) {
                        set({ items: updatedItems });
                    }
                } catch (error) {
                    console.error("Error validating cart:", error);
                }
            },
            syncCart: async (userId: string) => {
                if (!userId) return;
                try {
                    const { doc, getDoc, setDoc } = await import("firebase/firestore");
                    const { db } = await import("@/utils/firebase");

                    const cartRef = doc(db, "users", userId, "cart", "default");
                    const cartSnap = await getDoc(cartRef);

                    const localItems = get().items;
                    let serverItems: CartItem[] = [];

                    if (cartSnap.exists()) {
                        serverItems = cartSnap.data().items || [];
                    }

                    // Merge logic: Local items take precedence if conflict, or just add them
                    // Simple merge: Combine and deduplicate by ID+Size
                    const mergedItems = [...serverItems];

                    localItems.forEach(localItem => {
                        const existingIndex = mergedItems.findIndex(
                            i => i.id === localItem.id && i.size === localItem.size
                        );

                        if (existingIndex > -1) {
                            // Update quantity if exists (optional: strategy could be max or sum)
                            mergedItems[existingIndex].quantity = Math.max(
                                mergedItems[existingIndex].quantity,
                                localItem.quantity
                            );
                        } else {
                            mergedItems.push(localItem);
                        }
                    });

                    // Update store
                    set({ items: mergedItems });

                    // Update server
                    await setDoc(cartRef, { items: mergedItems, updatedAt: new Date() }, { merge: true });

                } catch (error) {
                    console.error("Error syncing cart:", error);
                }
            },
            setItems: (items) => set({ items }),
        }),
        {
            name: 'flashfit-cart',
            storage: createJSONStorage(() => localStorage),
        }
    )
);
