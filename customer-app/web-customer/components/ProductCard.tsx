"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Heart, HeartOff } from "lucide-react";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Button } from "./ui/button";
import { useCartStore } from "@/store/useCartStore";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Confetti } from "./Confetti";

interface ProductCardProps {
  id: string;
  title: string;
  price: number;
  image: string;
  weight?: string;
  discount?: number;
  category?: string;
  stock?: number;
}

export function ProductCard({ id, title, price, image, weight, discount, category, stock }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { items: wishlistItems, toggleItem: toggleWishlist } = useWishlistStore();
  const isWishlisted = wishlistItems.some((i) => i.id === id);

  const [imgSrc, setImgSrc] = useState(image);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setImgSrc(image);
  }, [image]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id,
      title,
      price,
      image,
      category: category || "Uncategorized",
      stock: stock || 0
    });

    // Show confetti
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 3000);

    toast.success("Added to cart", {
      description: `${title} is now in your cart.`,
      duration: 2000,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({ id, title, price, image });
  };

  return (
    <Link href={`/product/${id}`} className="group block h-full relative">
      {showConfetti && <Confetti duration={3000} />}
      <motion.div
        // ... rest of the component
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative flex flex-col h-full"
      >
        {/* Image Container */}
        <div className="relative aspect-[3/4] w-full bg-zinc-900 overflow-hidden rounded-2xl mb-4 shadow-lg group-hover:shadow-2xl transition-all duration-500">
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
            onError={() => setImgSrc("https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=80")}
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-20">
            {discount && (
              <div className="bg-yellow-400 text-black text-[10px] font-black px-2 py-1 rounded-full shadow-lg uppercase tracking-wider">
                -{discount}% OFF
              </div>
            )}
            {stock && stock < 5 && (
              <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                LOW STOCK
              </div>
            )}
          </div>

          {/* Wishlist Heart */}
          <button
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 p-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-red-500 transition-all z-20 hover:scale-110 active:scale-95"
          >
            {isWishlisted ? <Heart className="h-4 w-4 fill-red-500 text-red-500" /> : <Heart className="h-4 w-4" />}
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1 px-1">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-bold text-base text-white leading-tight line-clamp-2 group-hover:text-gray-300 transition-colors">
              {title}
            </h3>
            <div className="flex flex-col items-end">
              <span className="font-black text-lg text-white">₹{price}</span>
              {discount && (
                <span className="text-xs text-gray-500 line-through font-medium">₹{Math.round(price * (100 / (100 - discount)))}</span>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{category || "Collection"}</p>

          <Button
            className="w-full mt-3 bg-white text-black hover:bg-gray-200 font-bold h-10 rounded-xl shadow-none border-0 transition-transform active:scale-95"
            onClick={handleAddToCart}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </motion.div>
    </Link>
  );
}
