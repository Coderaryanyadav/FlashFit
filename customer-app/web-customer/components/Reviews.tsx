"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/shared/infrastructure/firebase";
import { Star, User } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { formatDistanceToNow } from "date-fns";

interface Review {
    id: string;
    user: string;
    rating: number;
    comment: string;
    createdAt: any;
}

export function Reviews({ productId }: { productId: string }) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newRating, setNewRating] = useState(5);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [user, setUser] = useState(auth.currentUser);

    useEffect(() => {
        const unsubscribeAuth = auth.onAuthStateChanged((u) => setUser(u));
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        const q = query(
            collection(db, "products", productId, "reviews"),
            orderBy("createdAt", "desc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Review[];
            setReviews(reviewsData);
        });

        return () => unsubscribe();
    }, [productId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newComment.trim()) return;

        setSubmitting(true);
        try {
            await addDoc(collection(db, "products", productId, "reviews"), {
                user: user.displayName || "Anonymous",
                rating: newRating,
                comment: newComment,
                createdAt: serverTimestamp(),
                userId: user.uid
            });
            setNewComment("");
            setNewRating(5);
        } catch (error) {
            console.error("Error adding review:", error);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-bold text-white">Customer Reviews ({reviews.length})</h3>

            {/* Add Review Form */}
            {user ? (
                <form onSubmit={handleSubmit} className="bg-neutral-900/50 p-6 rounded-2xl border border-white/10 space-y-4">
                    <h4 className="font-bold text-white">Write a Review</h4>
                    <div className="flex gap-2 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setNewRating(star)}
                                className={`transition-colors ${star <= newRating ? "text-yellow-500" : "text-neutral-600"}`}
                            >
                                <Star className="w-6 h-6 fill-current" />
                            </button>
                        ))}
                    </div>
                    <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts..."
                        className="bg-black/50 border-white/10 text-white min-h-[100px]"
                    />
                    <Button disabled={submitting || !newComment.trim()} className="bg-primary text-black font-bold">
                        {submitting ? "Posting..." : "Post Review"}
                    </Button>
                </form>
            ) : (
                <div className="bg-neutral-900/30 p-6 rounded-2xl border border-white/5 text-center">
                    <p className="text-neutral-400 mb-4">Please login to write a review.</p>
                </div>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
                {reviews.map((review) => (
                    <div key={review.id} className="border-b border-white/5 pb-6 last:border-0 animate-fade-in">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center">
                                    <User className="w-4 h-4 text-neutral-400" />
                                </div>
                                <span className="font-bold text-white">{review.user}</span>
                            </div>
                            <span className="text-xs text-neutral-500">
                                {review.createdAt?.toDate ? formatDistanceToNow(review.createdAt.toDate(), { addSuffix: true }) : "Just now"}
                            </span>
                        </div>
                        <div className="flex gap-1 mb-2 text-yellow-500">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "text-neutral-800 fill-neutral-800"}`} />
                            ))}
                        </div>
                        <p className="text-neutral-300 leading-relaxed">{review.comment}</p>
                    </div>
                ))}
                {reviews.length === 0 && (
                    <p className="text-neutral-500 text-center py-8">No reviews yet. Be the first to review!</p>
                )}
            </div>
        </div>
    );
}
