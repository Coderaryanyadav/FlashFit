import { db } from "@/shared/infrastructure/firebase";
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    orderBy,
    serverTimestamp,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot
} from "firebase/firestore";

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    userEmail: string;
    rating: number;
    comment: string;
    createdAt: any;
    approved: boolean;
}

export const ReviewService = {
    // Add a new review
    async addReview(
        productId: string,
        userId: string,
        userName: string,
        userEmail: string,
        rating: number,
        comment: string
    ): Promise<string> {
        try {
            const reviewData = {
                productId,
                userId,
                userName,
                userEmail,
                rating,
                comment,
                createdAt: serverTimestamp(),
                approved: true // Auto-approve for now to ensure visibility
            };

            const docRef = await addDoc(collection(db, "reviews"), reviewData);
            return docRef.id;
        } catch (error) {
            console.error("Error adding review:", error);
            throw error;
        }
    },

    // Get all reviews for a product (approved only)
    async getProductReviews(productId: string): Promise<Review[]> {
        try {
            const q = query(
                collection(db, "reviews"),
                where("productId", "==", productId),
                where("approved", "==", true),
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Review[];
        } catch (error) {
            console.error("Error getting reviews:", error);
            return [];
        }
    },

    // Subscribe to product reviews (Real-time)
    subscribeToProductReviews: (productId: string, callback: (reviews: Review[]) => void, onError?: (error: any) => void) => {
        const q = query(
            collection(db, "reviews"),
            where("productId", "==", productId),
            where("approved", "==", true)
            // Removed orderBy to avoid index requirement. Sorting client-side.
        );

        return onSnapshot(q, (snapshot) => {
            const reviews = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Review[];

            // Sort by createdAt desc
            reviews.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                return dateB.getTime() - dateA.getTime();
            });

            callback(reviews);
        }, (error) => {
            console.error("Error subscribing to reviews:", error);
            if (onError) onError(error);
        });
    },

    // Get all reviews (for admin)
    async getAllReviews(): Promise<Review[]> {
        try {
            const q = query(
                collection(db, "reviews"),
                orderBy("createdAt", "desc")
            );

            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Review[];
        } catch (error) {
            console.error("Error getting all reviews:", error);
            return [];
        }
    },

    // Approve review (admin only)
    async approveReview(reviewId: string): Promise<void> {
        try {
            await updateDoc(doc(db, "reviews", reviewId), {
                approved: true
            });
        } catch (error) {
            console.error("Error approving review:", error);
            throw error;
        }
    },

    // Delete review (admin only)
    async deleteReview(reviewId: string): Promise<void> {
        try {
            await deleteDoc(doc(db, "reviews", reviewId));
        } catch (error) {
            console.error("Error deleting review:", error);
            throw error;
        }
    },

    // Calculate average rating for a product
    async getAverageRating(productId: string): Promise<{ average: number; count: number }> {
        try {
            const reviews = await this.getProductReviews(productId);

            if (reviews.length === 0) {
                return { average: 0, count: 0 };
            }

            const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
            const average = sum / reviews.length;

            return {
                average: Math.round(average * 10) / 10, // Round to 1 decimal
                count: reviews.length
            };
        } catch (error) {
            console.error("Error calculating average rating:", error);
            return { average: 0, count: 0 };
        }
    }
};
