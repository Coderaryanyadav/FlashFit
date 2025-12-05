import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/shared/infrastructure/firebase";

export interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
    description?: string;
}

// Simple in-memory cache
const categoryCache: { data: Category[] | null, timestamp: number } = {
    data: null,
    timestamp: 0
};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const CategoryService = {
    async getCategories(): Promise<Category[]> {
        const now = Date.now();
        if (categoryCache.data && (now - categoryCache.timestamp < CACHE_DURATION)) {
            return categoryCache.data;
        }

        try {
            const q = query(collection(db, "categories"), orderBy("name"));
            const snapshot = await getDocs(q);
            const categories = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Category));

            categoryCache.data = categories;
            categoryCache.timestamp = now;
            return categories;
        } catch (error) {
            console.error("Error fetching categories:", error);
            return [];
        }
    },

    async getCategoryBySlug(slug: string): Promise<Category | null> {
        // Check cache first if available
        if (categoryCache.data) {
            const cached = categoryCache.data.find(c => c.slug === slug);
            if (cached) return cached;
        }

        const q = query(collection(db, "categories"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Category;
    }
};
