"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Check, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";

// Import ReviewService from customer app
import { db } from "@/utils/firebase";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc } from "firebase/firestore";

interface Review {
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

export default function ReviewsPage() {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('pending');

    useEffect(() => {
        const q = query(collection(db, "reviews"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reviewsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Review[];

            // Sort by createdAt desc
            reviewsData.sort((a, b) => {
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                return dateB.getTime() - dateA.getTime();
            });

            setReviews(reviewsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleApprove = async (reviewId: string) => {
        try {
            await updateDoc(doc(db, "reviews", reviewId), {
                approved: true
            });
            toast.success("Review approved!");
        } catch (error) {
            console.error("Error approving review:", error);
            toast.error("Failed to approve review");
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;

        try {
            await deleteDoc(doc(db, "reviews", reviewId));
            toast.success("Review deleted!");
        } catch (error) {
            console.error("Error deleting review:", error);
            toast.error("Failed to delete review");
        }
    };

    const filteredReviews = reviews.filter(review => {
        if (filter === 'pending') return !review.approved;
        if (filter === 'approved') return review.approved;
        return true;
    });

    const pendingCount = reviews.filter(r => !r.approved).length;
    const approvedCount = reviews.filter(r => r.approved).length;

    return (
        <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Reviews</h1>
                    <p className="text-gray-400">Moderate customer reviews</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Total Reviews</p>
                                <p className="text-3xl font-bold text-white">{reviews.length}</p>
                            </div>
                            <MessageSquare className="h-8 w-8 text-blue-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Pending</p>
                                <p className="text-3xl font-bold text-yellow-500">{pendingCount}</p>
                            </div>
                            <Star className="h-8 w-8 text-yellow-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-400 mb-1">Approved</p>
                                <p className="text-3xl font-bold text-green-500">{approvedCount}</p>
                            </div>
                            <Check className="h-8 w-8 text-green-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                <Button
                    onClick={() => setFilter('all')}
                    variant={filter === 'all' ? 'default' : 'outline'}
                    className={filter === 'all' ? 'bg-white text-black' : 'border-zinc-700 text-white'}
                >
                    All ({reviews.length})
                </Button>
                <Button
                    onClick={() => setFilter('pending')}
                    variant={filter === 'pending' ? 'default' : 'outline'}
                    className={filter === 'pending' ? 'bg-yellow-500 text-black' : 'border-zinc-700 text-white'}
                >
                    Pending ({pendingCount})
                </Button>
                <Button
                    onClick={() => setFilter('approved')}
                    variant={filter === 'approved' ? 'default' : 'outline'}
                    className={filter === 'approved' ? 'bg-green-500 text-black' : 'border-zinc-700 text-white'}
                >
                    Approved ({approvedCount})
                </Button>
            </div>

            {/* Reviews List */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
            ) : filteredReviews.length === 0 ? (
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardContent className="p-12 text-center">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400">No reviews found</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredReviews.map((review) => (
                        <Card key={review.id} className="bg-zinc-900 border-zinc-800">
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="font-bold text-white">{review.userName}</span>
                                            <div className="flex gap-0.5">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`h-4 w-4 ${star <= review.rating
                                                            ? "fill-yellow-500 text-yellow-500"
                                                            : "text-gray-600"
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            {!review.approved && (
                                                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs font-bold rounded-full">
                                                    PENDING
                                                </span>
                                            )}
                                            {review.approved && (
                                                <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs font-bold rounded-full">
                                                    APPROVED
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mb-3">
                                            {review.userEmail} • Product ID: {review.productId}
                                        </p>
                                        <p className="text-gray-300 leading-relaxed">{review.comment}</p>
                                        <p className="text-xs text-gray-500 mt-3">
                                            {review.createdAt?.toDate
                                                ? new Date(review.createdAt.toDate()).toLocaleString()
                                                : 'Recently'}
                                        </p>
                                    </div>
                                    <div className="flex gap-2 ml-4">
                                        {!review.approved && (
                                            <Button
                                                onClick={() => handleApprove(review.id)}
                                                size="sm"
                                                className="bg-green-500 hover:bg-green-600 text-white"
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Approve
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => handleDelete(review.id)}
                                            size="sm"
                                            variant="destructive"
                                            className="bg-red-500 hover:bg-red-600"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" />
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
