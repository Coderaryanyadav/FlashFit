"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { Header } from "@/components/Header";
import { ProductCard } from "@/components/ProductCard";
import { Heart } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WishlistPage() {
    const { items } = useWishlistStore();

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Header />
            <div className="container mx-auto px-4 pt-24">
                <h1 className="text-3xl font-black italic mb-8">MY WISHLIST ({items.length})</h1>

                {items.length === 0 ? (
                    <div className="text-center py-32 bg-zinc-900/30 rounded-3xl border border-dashed border-white/10">
                        <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Heart className="h-10 w-10 text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Your wishlist is empty</h3>
                        <p className="text-gray-400 mb-8">Save items you love to buy later.</p>
                        <Link href="/">
                            <Button className="bg-white text-black font-bold hover:bg-gray-200">Start Shopping</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {items.map((item) => (
                            <ProductCard key={item.id} {...item} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
