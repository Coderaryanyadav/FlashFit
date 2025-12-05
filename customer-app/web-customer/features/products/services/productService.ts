import { Product } from "@flashfit/types";
import { productRepository } from "@/features/products/infrastructure/ProductRepository";

// In-memory cache
const cache: Record<string, { data: Product[], timestamp: number }> = {};
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

export const ProductService = {
    async getProducts(categorySlug?: string): Promise<Product[]> {
        const cacheKey = categorySlug || 'all';
        const now = Date.now();

        if (cache[cacheKey] && (now - cache[cacheKey].timestamp < CACHE_DURATION)) {
            return cache[cacheKey].data;
        }

        try {
            let products: Product[];
            if (categorySlug && categorySlug !== 'all') {
                products = await productRepository.getByCategory(categorySlug);
            } else {
                products = await productRepository.getAll();
            }

            cache[cacheKey] = { data: products, timestamp: now };
            return products;
        } catch (error) {
            console.error("Error in ProductService.getProducts:", error);
            return [];
        }
    },

    async getProductById(id: string): Promise<Product | null> {
        return await productRepository.getById(id);
    },

    async getTrendingProducts(pincode: string, limitCount: number = 10): Promise<Product[]> {
        try {
            const allProducts = await productRepository.getTrending(50);

            return allProducts
                .filter(p => p.pincodes?.some((pin: any) => String(pin) === pincode))
                .sort((a, b) => {
                    const stockA = this.calculateTotalStock(a);
                    const stockB = this.calculateTotalStock(b);
                    return stockA - stockB; // Low stock first
                })
                .slice(0, limitCount);
        } catch (error) {
            console.error("Error in ProductService.getTrendingProducts:", error);
            return [];
        }
    },

    async getProductsByPincode(pincode: string): Promise<Product[]> {
        return await productRepository.getByPincode(pincode);
    },

    subscribeToProducts(pincode: string, callback: (products: Product[]) => void): () => void {
        return productRepository.subscribeToPincode(pincode, callback);
    },

    async getRelatedProducts(category: string, currentProductId: string, pincode: string, limitCount: number = 4): Promise<Product[]> {
        return await productRepository.getRelated(category, currentProductId, pincode, limitCount);
    },

    async getSellerProfile(storeId: string): Promise<any> {
        if (!storeId) return null;
        try {
            const { doc, getDoc } = await import("firebase/firestore");
            const { db } = await import("@/shared/infrastructure/firebase");
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

    // Helper to calculate total stock regardless of structure
    calculateTotalStock(product: Product): number {
        if (typeof product.stock === 'number') return product.stock;
        if (product.stock && typeof product.stock === 'object') {
            return Object.values(product.stock).reduce((sum, val) => sum + val, 0);
        }
        return 0;
    }
};

