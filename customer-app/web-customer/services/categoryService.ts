import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db } from "@/utils/firebase";

export interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
    description?: string;
}

export const CategoryService = {
    async getCategories(): Promise<Category[]> {
        try {
            const q = query(collection(db, "categories"), orderBy("name"));
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Category));
        } catch (error) {
            console.error("Error fetching categories:", error);
            return [];
        }
    },

    async getCategoryBySlug(slug: string): Promise<Category | null> {
        const q = query(collection(db, "categories"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return null;
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Category;
    }
};
