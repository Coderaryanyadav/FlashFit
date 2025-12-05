"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, CheckCircle, User, Send } from "lucide-react";
import { Progress } from "@/shared/ui/progress";
import { Button } from "@/shared/ui/button";
import { Textarea } from "@/shared/ui/textarea";
import { db, auth } from "@/shared/infrastructure/firebase";
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";

interface Review {
    id: string;
    author: string;
    rating: number;
    date: string;
    content: string;
    verified: boolean;
    helpful: number;
    createdAt?: any;
}

interface ReviewsSectionProps {
    productId: string;
    initialReviews?: Review[];
    averageRating?: number;
    totalReviews?: number;
}

export function ReviewsSection({
    productId,
    initialReviews = [],
    averageRating = 4.5,
    totalReviews = 128
}: ReviewsSectionProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [newReview, setNewReview] = useState("");
    const [newRating, setNewRating] = useState(5);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, "reviews"), where("productId", "==", productId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                date: doc.data().createdAt ? new Date(doc.data().createdAt.toDate()).toLocaleDateString() : "Just now"
            })) as Review[];
            setReviews(reviewsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [productId]);

    const handleSubmitReview = async () => {
        if (!newReview.trim()) {
            toast.error("Please write a review");
            return;
        }

        if (!auth.currentUser) {
            toast.error("Please login to post a review");
            return;
        }

        setIsSubmitting(true);
        try {
            await addDoc(collection(db, "reviews"), {
                productId,
                author: auth.currentUser.displayName || auth.currentUser.email || "Anonymous",
                rating: newRating,
                content: newReview,
                verified: true,
                helpful: 0,
                createdAt: serverTimestamp(),
                userId: auth.currentUser.uid
            });
            setNewReview("");
            setNewRating(5);
            toast.success("Review posted successfully!");
        } catch (error) {
            console.error("Failed to post review:", error);
            toast.error("Failed to post review");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="py-16 border-t border-white/10">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-black mb-12">RATINGS & REVIEWS</h2>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Summary Column */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5">
                            <div className="flex items-end gap-4 mb-6">
                                <span className="text-6xl font-black text-white">{averageRating}</span>
                                <div className="mb-2">
                                    <div className="flex text-yellow-400 mb-1">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={`h-5 w-5 ${star <= Math.round(averageRating) ? "fill-current" : "text-gray-600"}`} />
                                        ))}
                                    </div>
                                    <p className="text-gray-400 text-sm">{totalReviews} Verified Reviews</p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {[5, 4, 3, 2, 1].map((rating) => (
                                    <div key={rating} className="flex items-center gap-3 text-sm">
                                        <span className="w-3 font-bold text-gray-400">{rating}</span>
                                        <Star className="h-3 w-3 text-gray-600" />
                                        <Progress value={rating === 5 ? 75 : rating === 4 ? 15 : 5} className="h-2 bg-zinc-800" indicatorClassName="bg-white" />
                                        <span className="w-8 text-right text-gray-500">{rating === 5 ? "75%" : rating === 4 ? "15%" : "5%"}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Write Review Box */}
                        <div className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5">
                            <h3 className="font-bold text-lg mb-4">Write a Review</h3>
                            <div className="flex gap-2 mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} onClick={() => setNewRating(star)} className="focus:outline-none transition-transform hover:scale-110">
                                        <Star className={`h-6 w-6 ${star <= newRating ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`} />
                                    </button>
                                ))}
                            </div>
                            <Textarea
                                placeholder="Share your thoughts on the product..."
                                className="bg-black border-zinc-700 text-white mb-4 min-h-[100px]"
                                value={newReview}
                                onChange={(e) => setNewReview(e.target.value)}
                            />
                            <Button
                                onClick={handleSubmitReview}
                                disabled={!newReview.trim() || isSubmitting}
                                className="w-full bg-white text-black hover:bg-gray-200 font-bold"
                            >
                                {isSubmitting ? "Posting..." : "Post Review"}
                            </Button>
                        </div>
                    </div>

                    {/* Reviews List */}
                    <div className="lg:col-span-8 space-y-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="bg-zinc-900/30 p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                            <User className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white flex items-center gap-2">
                                                {review.author}
                                                {review.verified && (
                                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-500/20">
                                                        <CheckCircle className="h-3 w-3" /> Verified Buyer
                                                    </span>
                                                )}
                                            </h4>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                                                <div className="flex text-yellow-400">
                                                    {[1, 2, 3, 4, 5].map((star) => (
                                                        <Star key={star} className={`h-3 w-3 ${star <= review.rating ? "fill-current" : "text-gray-600"}`} />
                                                    ))}
                                                </div>
                                                <span>•</span>
                                                <span>{review.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-gray-300 leading-relaxed mb-4">
                                    {review.content}
                                </p>

                                <div className="flex items-center gap-4">
                                    <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors group">
                                        <ThumbsUp className="h-4 w-4 group-hover:text-purple-400" />
                                        Helpful ({review.helpful})
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
