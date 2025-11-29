// Product recommendation engine

import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "./firebase";

interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
    category: string;
    rating?: number;
}

export class RecommendationEngine {
    // Get products from the same category
    static async getSimilarProducts(productId: string, category: string, limitCount: number = 4): Promise<Product[]> {
        try {
            const q = query(
                collection(db, "products"),
                where("category", "==", category),
                limit(limitCount + 1) // +1 to exclude current product
            );

            const snapshot = await getDocs(q);
            const products = snapshot.docs
                .map(doc => ({ id: doc.id, ...doc.data() } as Product))
                .filter(p => p.id !== productId)
                .slice(0, limitCount);

            return products;
        } catch (error) {
            console.error("Error fetching similar products:", error);
            return [];
        }
    }

    // Get trending products based on views/orders (mock for now)
    static async getTrendingProducts(limitCount: number = 8): Promise<Product[]> {
        try {
            const q = query(
                collection(db, "products"),
                orderBy("createdAt", "desc"),
                limit(limitCount)
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        } catch (error) {
            console.error("Error fetching trending products:", error);
            return [];
        }
    }

    // Get personalized recommendations based on user's browsing history
    static async getPersonalizedRecommendations(userId: string, limitCount: number = 6): Promise<Product[]> {
        // For now, return trending products
        // In production, this would analyze user's order history, wishlist, and browsing patterns
        return this.getTrendingProducts(limitCount);
    }

    // Get "Customers also bought" recommendations
    static async getFrequentlyBoughtTogether(productId: string, limitCount: number = 3): Promise<Product[]> {
        // For now, return similar products
        // In production, this would analyze order patterns
        try {
            const productDoc = await getDocs(query(collection(db, "products"), where("id", "==", productId), limit(1)));
            if (productDoc.empty) return [];

            const category = productDoc.docs[0].data().category;
            return this.getSimilarProducts(productId, category, limitCount);
        } catch (error) {
            console.error("Error fetching frequently bought together:", error);
            return [];
        }
    }
}
