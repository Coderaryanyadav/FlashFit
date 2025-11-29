"use client";

import { useWishlistStore } from "@/store/useWishlistStore";
import { useCartStore } from "@/store/useCartStore";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Header } from "@/components/Header";

export default function WishlistPage() {
    const { items, removeItem } = useWishlistStore();
    const addToCart = useCartStore((state) => state.addItem);

    const handleMoveToCart = (item: any) => {
        addToCart({
            id: item.id,
            title: item.title,
            price: item.price,
            image: item.image,
            description: item.description,
            category: item.category || "Uncategorized",
            stock: item.stock || 0
        }, undefined, 1);
        removeItem(item.id);
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-black text-white">
                <Header />
                <div className="container mx-auto px-4 max-w-4xl pt-24">
                    <div className="flex items-center gap-4 mb-8">
                        <Heart className="h-8 w-8 text-red-500 fill-current" />
                        <h1 className="text-3xl font-bold">My Wishlist</h1>
                    </div>

                    <div className="bg-neutral-900/30 rounded-3xl border border-dashed border-white/10 p-12 text-center">
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="h-8 w-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
                        <p className="text-gray-400 mb-6">Save items you love to buy later</p>
                        <Link href="/">
                            <Button className="bg-primary text-black hover:bg-primary/90 font-bold">Start Shopping</Button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <div className="container mx-auto px-4 max-w-6xl pt-24 pb-12">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Heart className="h-8 w-8 text-red-500 fill-current" />
                        <h1 className="text-3xl font-bold">My Wishlist</h1>
                        <span className="text-lg text-gray-500">({items.length} items)</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-neutral-900/50 rounded-2xl border border-white/5 hover:border-primary/50 hover:bg-neutral-900 transition-all group">
                            <div className="relative h-64 bg-neutral-800 rounded-t-2xl overflow-hidden">
                                <Image
                                    src={item.image}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm p-2 rounded-full hover:bg-black transition-colors shadow-lg"
                                >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                </button>
                            </div>

                            <div className="p-4">
                                <h3 className="font-bold text-white mb-2 line-clamp-2">{item.title}</h3>
                                <p className="text-2xl font-bold text-primary mb-4">₹{item.price}</p>

                                <Button
                                    onClick={() => handleMoveToCart(item)}
                                    className="w-full bg-primary hover:bg-primary/90 text-black font-bold flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    Move to Cart
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
