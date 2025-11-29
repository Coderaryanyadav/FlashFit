import { collection, query, where, getDocs, doc, getDoc, limit, orderBy, onSnapshot } from "firebase/firestore";
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
    stock?: number;
    createdAt?: any;
    discount?: number;
    colors?: string[];
}

export const ProductService = {
    async getProducts(categorySlug?: string): Promise<Product[]> {
        try {
            let q;
            if (categorySlug && categorySlug !== 'all') {
                q = query(collection(db, "products"), where("category", "==", categorySlug));
            } else {
                q = query(collection(db, "products"));
            }

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Product));
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
                .filter(p => p.pincodes?.includes(pincode))
                .sort((a, b) => (a.stock || 0) - (b.stock || 0))
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
    }
};
