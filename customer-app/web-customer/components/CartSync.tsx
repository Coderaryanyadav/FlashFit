"use client";

import { useEffect, useRef } from "react";
import { useCartStore } from "@/store/useCartStore";
import { auth, db } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

export function CartSync() {
    const { items, setItems, clearCart } = useCartStore();
    const hasInitialized = useRef(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User logged in
                const cartRef = doc(db, "carts", user.uid);
                const cartSnap = await getDoc(cartRef);

                if (cartSnap.exists()) {
                    const savedCart = cartSnap.data().items;

                    // Merge strategy: 
                    // If local cart has items, merge them with saved cart (local takes precedence or adds to it)
                    // For simplicity here, we'll just load the saved cart if local is empty, 
                    // or merge if both exist.

                    if (items.length > 0 && !hasInitialized.current) {
                        // Merge logic could be complex. For now, let's just save local to DB
                        // effectively overwriting DB with current session if we have items.
                        // Or we could append.
                        // Let's try to merge:
                        const mergedItems = [...savedCart];
                        items.forEach(localItem => {
                            const existing = mergedItems.find(i => i.id === localItem.id && i.size === localItem.size);
                            if (existing) {
                                existing.quantity += localItem.quantity;
                            } else {
                                mergedItems.push(localItem);
                            }
                        });

                        // Update DB and Local
                        await setDoc(cartRef, { items: mergedItems }, { merge: true });
                        setItems(mergedItems);
                    } else if (!hasInitialized.current) {
                        // Local empty, load from DB
                        setItems(savedCart);
                    }
                } else if (items.length > 0 && !hasInitialized.current) {
                    // No saved cart, but local items exist -> Save to DB
                    await setDoc(cartRef, { items }, { merge: true });
                }
                hasInitialized.current = true;
            } else {
                // User logged out
                // Optionally clear cart or keep it as guest cart
                // Usually we keep it so they can continue shopping as guest
                // But if they were logged in, 'items' currently reflects their user cart.
                // We might want to clear it to avoid showing user items to guest.
                clearCart();
                hasInitialized.current = false;
            }
        });

        return () => unsubscribe();
    }, [items, setItems, clearCart]);

    // Sync changes to DB when items change (if logged in)
    useEffect(() => {
        const user = auth.currentUser;
        if (user && items.length > 0) {
            const saveCart = async () => {
                const cartRef = doc(db, "carts", user.uid);
                await setDoc(cartRef, { items }, { merge: true });
            };
            // Debounce could be good here
            const timeout = setTimeout(saveCart, 1000);
            return () => clearTimeout(timeout);
        }
    }, [items]);

    return null;
}
