"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { ReviewService } from "@/services/reviewService";
import { auth } from "@/utils/firebase";
import { toast } from "sonner";

interface AddReviewModalProps {
    productId: string;
    productTitle: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function AddReviewModal({ productId, productTitle, isOpen, onClose, onSuccess }: AddReviewModalProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!auth.currentUser) {
            toast.error("Please login to add a review");
            return;
        }

        if (rating === 0) {
            toast.error("Please select a rating");
            return;
        }

        if (comment.trim().length < 10) {
            toast.error("Review must be at least 10 characters");
            return;
        }

        setLoading(true);
        try {
            await ReviewService.addReview(
                productId,
                auth.currentUser.uid,
                auth.currentUser.displayName || "Anonymous",
                auth.currentUser.email || "",
                rating,
                comment
            );

            toast.success("Review submitted successfully!");
            setRating(0);
            setComment("");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error submitting review:", error);
            toast.error("Failed to submit review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-neutral-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Write a Review</DialogTitle>
                    <p className="text-gray-400 text-sm">{productTitle}</p>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">Your Rating</label>
                        <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110"
                                >
                                    <Star
                                        className={`h-8 w-8 ${star <= (hoveredRating || rating)
                                            ? "fill-yellow-500 text-yellow-500"
                                            : "text-gray-600"
                                            }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-sm text-gray-400">
                                {rating === 1 && "Poor"}
                                {rating === 2 && "Fair"}
                                {rating === 3 && "Good"}
                                {rating === 4 && "Very Good"}
                                {rating === 5 && "Excellent"}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-300">Your Review</label>
                        <Textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your experience with this product..."
                            className="bg-neutral-800 border-white/10 text-white min-h-[120px] resize-none"
                            maxLength={500}
                        />
                        <p className="text-xs text-gray-500 text-right">{comment.length}/500</p>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || rating === 0 || comment.trim().length < 10}
                        className="w-full bg-white text-black hover:bg-gray-200"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : null}
                        Submit Review
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
