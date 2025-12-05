import { collection, getDocs, query, where, doc, getDoc, limit, onSnapshot, DocumentData, Query } from "firebase/firestore";
import { db } from "@/shared/infrastructure/firebase";
import { Product } from "@flashfit/types";

export interface IProductRepository {
    getAll(): Promise<Product[]>;
    getById(id: string): Promise<Product | null>;
    getByCategory(categorySlug: string): Promise<Product[]>;
    getByPincode(pincode: string): Promise<Product[]>;
    getTrending(limitCount: number): Promise<Product[]>;
    getRelated(category: string, currentId: string, pincode: string, limitCount: number): Promise<Product[]>;
    subscribeToPincode(pincode: string, callback: (products: Product[]) => void): () => void;
}

export class FirestoreProductRepository implements IProductRepository {
    private collectionRef = collection(db, "products");

    private mapDocToProduct(doc: DocumentData): Product {
        return { id: doc.id, ...doc.data() } as Product;
    }

    async getAll(): Promise<Product[]> {
        const snapshot = await getDocs(this.collectionRef);
        return snapshot.docs.map(this.mapDocToProduct);
    }

    async getById(id: string): Promise<Product | null> {
        const docRef = doc(this.collectionRef, id);
        const docSnap = await getDoc(docRef);
        return docSnap.exists() ? this.mapDocToProduct(docSnap) : null;
    }

    async getByCategory(categorySlug: string): Promise<Product[]> {
        const q = query(this.collectionRef, where("category", "==", categorySlug));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(this.mapDocToProduct);
    }

    async getByPincode(pincode: string): Promise<Product[]> {
        // Try exact match first
        const q = query(this.collectionRef, where("pincodes", "array-contains", pincode));
        const snapshot = await getDocs(q);

        if (!snapshot.empty) {
            return snapshot.docs.map(this.mapDocToProduct);
        }

        // Fallback: Client-side filtering for type mismatches (string vs number)
        const fallbackQ = query(this.collectionRef, limit(100));
        const fallbackSnap = await getDocs(fallbackQ);

        return fallbackSnap.docs
            .map(this.mapDocToProduct)
            .filter(p => p.pincodes?.some((pin: any) => String(pin) === pincode));
    }

    async getTrending(limitCount: number): Promise<Product[]> {
        const q = query(this.collectionRef, limit(50)); // Fetch pool
        const snapshot = await getDocs(q);
        return snapshot.docs.map(this.mapDocToProduct);
    }

    async getRelated(category: string, currentId: string, pincode: string, limitCount: number): Promise<Product[]> {
        const q = query(
            this.collectionRef,
            where("category", "==", category),
            where("pincodes", "array-contains", pincode),
            limit(limitCount + 1)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs
            .map(this.mapDocToProduct)
            .filter(p => p.id !== currentId)
            .slice(0, limitCount);
    }

    subscribeToPincode(pincode: string, callback: (products: Product[]) => void): () => void {
        const q = query(this.collectionRef, where("pincodes", "array-contains", pincode));
        return onSnapshot(q,
            (snapshot) => callback(snapshot.docs.map(this.mapDocToProduct)),
            (error) => {
                console.error("Product subscription error:", error);
                callback([]);
            }
        );
    }
}

export const productRepository = new FirestoreProductRepository();
