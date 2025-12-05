"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { Review, ReviewService } from "@/services/reviewService";
import { auth } from "@/shared/infrastructure/firebase";

interface ProductReviewsProps {
    productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [avgRating, setAvgRating] = useState({ average: 0, count: 0 });

    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        // Check auth status and fetch role
        const unsubscribe = auth.onAuthStateChanged(async (u) => {
            setUser(u);
            if (u) {
                try {
                    const { doc, getDoc } = await import("firebase/firestore");
                    const { db } = await import("@/shared/infrastructure/firebase");
                    const userDoc = await getDoc(doc(db, "users", u.uid));
                    if (userDoc.exists() && userDoc.data().role === "admin") {
                        setIsAdmin(true);
                    } else {
                        setIsAdmin(false);
                    }
                } catch (error) {
                    console.error("Error fetching user role:", error);
                    setIsAdmin(false);
                }
            } else {
                setIsAdmin(false);
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = ReviewService.subscribeToProductReviews(
            productId,
            (reviewsData) => {
                setReviews(reviewsData);

                // Calculate average rating locally or fetch it
                if (reviewsData.length > 0) {
                    const sum = reviewsData.reduce((acc, r) => acc + r.rating, 0);
                    const avg = Math.round((sum / reviewsData.length) * 10) / 10;
                    setAvgRating({ average: avg, count: reviewsData.length });
                } else {
                    setAvgRating({ average: 0, count: 0 });
                }
                setLoading(false);
            },
            (error) => {
                console.error("Failed to subscribe to reviews:", error);
                setLoading(false); // Ensure loading stops even on error
            }
        );

        return () => unsubscribe();
    }, [productId]);

    if (loading) {
        return (
            <div className="animate-pulse space-y-4">
                <div className="h-6 bg-neutral-800 rounded w-32"></div>
                <div className="h-20 bg-neutral-800 rounded"></div>
            </div>
        );
    }

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (rating === 0) {
            alert("Please select a rating");
            return;
        }

        setSubmitting(true);
        try {
            await ReviewService.addReview(
                productId,
                user.uid,
                user.displayName || "Anonymous",
                user.email || "",
                rating,
                comment
            );
            setComment("");
            setRating(0);
            setShowForm(false);
            alert("Review submitted successfully!");
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteReview = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;
        try {
            await ReviewService.deleteReview(reviewId);
            // No need to update state manually, subscription will handle it
        } catch (error) {
            console.error("Error deleting review:", error);
            alert("Failed to delete review.");
        }
    };

    return (
        <div className="space-y-8">
            {/* Rating Summary */}
            {avgRating.count > 0 && (
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-5 h-5 fill-current" />
                        <span className="font-bold text-white text-lg">{avgRating.average}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                        {avgRating.count} {avgRating.count === 1 ? 'review' : 'reviews'}
                    </span>
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-zinc-800 rounded-2xl">
                    <p className="text-gray-400">No reviews yet. Be the first to share your experience!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="border-b border-white/5 pb-6 last:border-0 group relative">
                            <div className="flex items-start justify-between mb-3">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center font-bold text-xs text-gray-400">
                                            {review.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-bold text-white">{review.userName}</span>
                                        <div className="flex gap-0.5 ml-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-3 w-3 ${star <= review.rating
                                                        ? "fill-yellow-500 text-yellow-500"
                                                        : "text-zinc-800"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 ml-10">
                                        {review.createdAt?.toDate
                                            ? new Date(review.createdAt.toDate()).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })
                                            : 'Recently'}
                                    </p>
                                </div>
                                {isAdmin && (
                                    <button
                                        onClick={() => handleDeleteReview(review.id)}
                                        className="text-red-500 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-300 text-sm leading-relaxed pl-10">{review.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
