// components/ui/Rating.tsx
"use client";
import { Star, StarHalf } from "lucide-react";
import { useState } from "react";

interface RatingProps {
    rating: number; // 0 to 5, can be half increments
    onRate?: (value: number) => void; // optional click handler
}

export function Rating({ rating, onRate }: RatingProps) {
    const [hover, setHover] = useState<number>(0);
    const display = onRate ? hover || rating : rating;

    const stars = Array.from({ length: 5 }, (_, i) => {
        const value = i + 1;
        const isHalf = display >= value - 0.5 && display < value;
        const isFull = display >= value;
        return (
            <button
                key={i}
                type="button"
                onMouseEnter={() => onRate && setHover(value)}
                onMouseLeave={() => onRate && setHover(0)}
                onClick={() => onRate && onRate(value)}
                className="p-0 focus:outline-none"
            >
                {isFull ? (
                    <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ) : isHalf ? (
                    <StarHalf className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ) : (
                    <Star className="h-5 w-5 text-neutral-600" />
                )}
            </button>
        );
    });

    return <div className="flex items-center space-x-0.5">{stars}</div>;
}
