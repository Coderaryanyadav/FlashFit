// store/useWishlistStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { auth, db } from '@/shared/infrastructure/firebase';
import { doc, setDoc, getDoc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

interface WishlistItem {
    id: string;
    title: string;
    price: number;
    image: string;
}

interface WishlistState {
    items: WishlistItem[];
    addItem: (item: WishlistItem) => void;
    removeItem: (id: string) => void;
    toggleItem: (item: WishlistItem) => void;
    isInWishlist: (id: string) => boolean;
    syncWithFirestore: () => void;
}

export const useWishlistStore = create<WishlistState>()(
    persist(
        (set, get) => ({
            items: [],
            addItem: (item) => {
                set((state) => ({ items: [...state.items, item] }));
                get().syncWithFirestore();
            },
            removeItem: (id) => {
                set((state) => ({ items: state.items.filter((i) => i.id !== id) }));
                get().syncWithFirestore();
            },
            toggleItem: (item) => {
                const exists = get().isInWishlist(item.id);
                if (exists) {
                    get().removeItem(item.id);
                } else {
                    get().addItem(item);
                }
            },
            isInWishlist: (id) => get().items.some((i) => i.id === id),
            syncWithFirestore: async () => {
                const user = auth.currentUser;
                if (user) {
                    try {
                        const wishlistRef = doc(db, 'wishlists', user.uid);
                        await setDoc(wishlistRef, { items: get().items }, { merge: true });
                    } catch (error) {
                        console.error('Failed to sync wishlist:', error);
                    }
                }
            },
        }),
        {
            name: 'flashfit-wishlist',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Listen to auth state and sync wishlist from Firestore
onAuthStateChanged(auth, async (user) => {
    if (user) {
        try {
            const wishlistRef = doc(db, 'wishlists', user.uid);
            const wishlistSnap = await getDoc(wishlistRef);
            if (wishlistSnap.exists()) {
                const data = wishlistSnap.data();
                useWishlistStore.setState({ items: data.items || [] });
            }
        } catch (error) {
            console.error('Failed to load wishlist from Firestore:', error);
        }
    }
});
