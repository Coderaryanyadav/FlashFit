import { collection, getDocs, query, where, doc, getDoc, limit, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebase";

export interface Product {
    id: string;
    title: string;
    description?: string;
    price: number;
    category: string;
    image: string;
    images?: string[];
    sizes?: string[];
    rating?: number;
    pincodes?: string[];
    stock?: number | Record<string, number>;
    createdAt?: any;
    discount?: number;
    colors?: string[];
    storeId?: string;
}

// Simple in-memory cache for products
const productCache: Record<string, { data: Product[], timestamp: number }> = {};
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Retry utility
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
    try {
        return await fn();
    } catch (error) {
        if (retries <= 0) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
        return retry(fn, retries - 1, delay * 2);
    }
}

export const ProductService = {
    async getProducts(categorySlug?: string): Promise<Product[]> {
        const cacheKey = categorySlug || 'all';
        const now = Date.now();

        if (productCache[cacheKey] && (now - productCache[cacheKey].timestamp < CACHE_DURATION)) {
            return productCache[cacheKey].data;
        }

        try {
            return await retry(async () => {
                let q;
                if (categorySlug && categorySlug !== 'all') {
                    q = query(collection(db, "products"), where("category", "==", categorySlug));
                } else {
                    q = query(collection(db, "products"));
                }

                const snapshot = await getDocs(q);
                const products = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Product));

                productCache[cacheKey] = { data: products, timestamp: now };
                return products;
            });
        } catch (error) {
            console.error("Error fetching products:", error);
            return [];
        }
    },

    async getProductById(id: string): Promise<Product | null> {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        } else {
            return null;
        }
    },

    async getTrendingProducts(pincode: string, limitCount: number = 10): Promise<Product[]> {
        try {
            // Fetch all products and filter/sort in memory to avoid index requirement
            const q = query(collection(db, "products"), limit(50));
            const snapshot = await getDocs(q);

            const products = snapshot.docs
                .map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Product))
                .filter(p => p.pincodes?.some((pin: any) => String(pin) === pincode))
                .sort((a, b) => {
                    const stockA = typeof a.stock === 'number' ? a.stock : (a.stock ? Object.values(a.stock).reduce((sum, val) => sum + val, 0) : 0);
                    const stockB = typeof b.stock === 'number' ? b.stock : (b.stock ? Object.values(b.stock).reduce((sum, val) => sum + val, 0) : 0);
                    return stockA - stockB;
                })
                .slice(0, limitCount);

            return products;
        } catch (error) {
            console.error("Error fetching trending products:", error);
            return [];
        }
    },

    subscribeToProducts(pincode: string, callback: (products: Product[]) => void): () => void {
        const q = query(
            collection(db, "products"),
            where("pincodes", "array-contains", pincode)
        );

        return onSnapshot(q, (snapshot) => {
            const products = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Product));
            callback(products);
        }, (error) => {
            console.error("Error subscribing to products:", error);
            callback([]); // Return empty array on error to stop loading state
        });
    },

    async getRelatedProducts(category: string, currentProductId: string, pincode: string, limitCount: number = 4): Promise<Product[]> {
        const q = query(
            collection(db, "products"),
            where("category", "==", category),
            where("pincodes", "array-contains", pincode),
            limit(limitCount + 1) // Fetch one extra to account for filtering current product
        );

        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as Product))
            .filter(p => p.id !== currentProductId)
            .slice(0, limitCount);
    },

    async getSellerProfile(storeId: string): Promise<any> {
        if (!storeId) return null;
        try {
            const docRef = doc(db, "users", storeId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return docSnap.data();
            }
            return null;
        } catch (error) {
            console.error("Error fetching seller profile:", error);
            return null;
        }
    },

    async getProductsByPincode(pincode: string): Promise<Product[]> {
        try {
            // 1. Try specific query
            const q = query(
                collection(db, "products"),
                where("pincodes", "array-contains", pincode)
            );
            const snapshot = await getDocs(q);

            if (!snapshot.empty) {
                return snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Product));
            }

            // 2. Fallback: Fetch all (limit 100) and filter in memory
            // This handles cases where pincode might be a number in DB but string in query
            console.warn("Direct pincode query returned 0. Trying fallback...");
            const fallbackQ = query(collection(db, "products"), limit(100));
            const fallbackSnap = await getDocs(fallbackQ);

            return fallbackSnap.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Product))
                .filter(p => {
                    if (!p.pincodes) return false;
                    // Check for string OR number match
                    return p.pincodes.some((pin: any) => String(pin) === pincode);
                });

        } catch (error) {
            console.error("Error fetching products by pincode:", error);
            return [];
        }
    }
};
