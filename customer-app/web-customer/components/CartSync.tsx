"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { auth, db } from "@/shared/infrastructure/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function CartSync() {
    const { items, setItems, clearCart } = useCartStore();
    const hasInitialized = useRef(false);
    const itemsRef = useRef(items);

    // Keep ref synced with current items to use in callbacks without dependency loop
    useEffect(() => {
        itemsRef.current = items;
    }, [items]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User logged in
                const cartRef = doc(db, "carts", user.uid);
                const cartSnap = await getDoc(cartRef);

                if (cartSnap.exists()) {
                    const savedCart = cartSnap.data().items;
                    const localItems = itemsRef.current; // Use ref to avoid dependency loop

                    if (localItems.length > 0 && !hasInitialized.current) {
                        // Merge strategies:
                        // 1. If item exists in both, add quantities
                        // 2. If item only in local, add to saved
                        const mergedItems = [...savedCart];

                        localItems.forEach(localItem => {
                            const existingIndex = mergedItems.findIndex(i => i.id === localItem.id && i.size === localItem.size);
                            if (existingIndex > -1) {
                                mergedItems[existingIndex].quantity += localItem.quantity;
                            } else {
                                mergedItems.push(localItem);
                            }
                        });

                        // Prioritize preserving user's local cart additions + saved cart
                        await setDoc(cartRef, { items: mergedItems }, { merge: true });
                        setItems(mergedItems);
                    } else if (!hasInitialized.current) {
                        // If local empty, just load saved
                        setItems(savedCart);
                    }
                } else if (itemsRef.current.length > 0 && !hasInitialized.current) {
                    // No saved cart but have local items -> save them
                    await setDoc(cartRef, { items: itemsRef.current }, { merge: true });
                }
                hasInitialized.current = true;
            } else {
                // User logged out
                clearCart();
                hasInitialized.current = false;
            }
        });

        return () => unsubscribe();
    }, [setItems, clearCart]); // IMPORTANT: removed 'items' from dependency to prevent infinite loop

    // Sync changes to DB when items change (only if logged in)
    useEffect(() => {
        const user = auth.currentUser;
        if (user && items.length > 0) {
            const saveCart = async () => {
                const cartRef = doc(db, "carts", user.uid);
                await setDoc(cartRef, { items }, { merge: true });
            };
            // Debounce
            const timeout = setTimeout(saveCart, 1000);
            return () => clearTimeout(timeout);
        }
    }, [items]);

    return null;
}
