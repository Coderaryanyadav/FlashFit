"use client";

import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Header } from "@/components/Header";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export default function CartPage() {
  const { user } = useAuth();
  const { items, removeItem, updateQuantity, getTotal, clearCart, addItem, validateCart } = useCartStore();
  const { items: wishlistItems, removeItem: removeFromWishlist } = useWishlistStore();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);

  // Validate cart on mount
  useEffect(() => {
    validateCart();
  }, [validateCart]);

  const subtotal = getTotal();
  const tax = subtotal * 0.18; // 18% GST
  const finalTotal = subtotal + tax - discount;

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "FLASH100") {
      if (subtotal >= 500) {
        setDiscount(100);
        toast.success("Coupon Applied!", { description: "₹100 saved on your order." });
      } else {
        toast.error("Invalid Coupon", { description: "Minimum order value is ₹500." });
      }
    } else {
      toast.error("Invalid Coupon", { description: "This code does not exist." });
    }
  };

  const moveFromWishlistToCart = (item: any) => {
    addItem({ ...item, quantity: 1 });
    removeFromWishlist(item.id);
    toast.success("Moved to Cart", { description: `${item.title} added to your cart.` });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-neutral-950 text-foreground">
        <Header />
        <div className="container mx-auto px-4 max-w-4xl py-20">
          <div className="bg-neutral-900/50 rounded-3xl border border-dashed border-white/10 p-16 text-center backdrop-blur-sm">
            <div className="w-24 h-24 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
              <ShoppingBag className="h-10 w-10 text-neutral-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 text-lg">Looks like you haven&apos;t added any streetwear yet.</p>
            <Link href="/">
              <Button className="h-12 px-8 text-lg font-bold bg-primary hover:bg-primary/90 text-black shadow-[0_0_20px_rgba(250,204,21,0.2)]">
                Start Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground">
      <Header />
      <div className="container mx-auto px-4 max-w-7xl py-12">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-sm text-muted-foreground hover:text-red-500 transition-colors font-medium"
          >
            Clear All
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={`${item.id}-${item.size || ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-neutral-900/50 rounded-2xl border border-white/5 p-4 hover:border-white/10 transition-all group"
                >
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative h-32 w-32 flex-shrink-0 rounded-xl overflow-hidden bg-neutral-800">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-xl text-white mb-1">{item.title}</h3>
                          <button
                            onClick={() => removeItem(item.id, item.size || '')}
                            className="text-neutral-500 hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                        {item.size && (
                          <p className="text-sm text-muted-foreground font-medium">Size: <span className="text-white">{item.size}</span></p>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <p className="text-2xl font-bold text-primary">₹{item.price}</p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3 bg-neutral-800 rounded-xl p-1 border border-white/5">
                          <button
                            onClick={() => updateQuantity(item.id, item.size || '', Math.max(1, item.quantity - 1))}
                            className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <span className="w-8 text-center font-bold text-white">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.size || '', item.quantity + 1)}
                            className="h-8 w-8 flex items-center justify-center hover:bg-white/10 rounded-lg transition-colors text-white"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Wishlist Section */}
            {wishlistItems.length > 0 && (
              <div className="mt-12 pt-12 border-t border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6">From Your Wishlist</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistItems.map((item) => (
                    <div key={item.id} className="bg-neutral-900/30 rounded-xl border border-white/5 p-3 flex gap-3 group hover:border-white/20 transition-all">
                      <div className="relative w-20 h-20 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500 text-[10px]">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-between py-1 flex-1">
                        <div>
                          <h4 className="font-bold text-sm text-white line-clamp-1">{item.title}</h4>
                          <p className="text-xs text-gray-400">₹{item.price}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-white/10 hover:bg-white hover:text-black w-full"
                          onClick={() => moveFromWishlistToCart(item)}
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-neutral-900/80 rounded-3xl border border-white/10 p-8 sticky top-24 backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span className="text-white font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax (18% GST)</span>
                  <span className="text-white font-medium">₹{tax.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span className="font-medium">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-white/10 pt-4 flex justify-between text-xl font-bold text-white">
                  <span>Total</span>
                  <span className="text-primary">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon Input */}
              <div className="flex gap-2 mb-6">
                <Input
                  placeholder="Coupon Code"
                  className="bg-black border-white/10 text-white placeholder:text-gray-600"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button variant="outline" className="border-white/10 text-white hover:bg-white hover:text-black" onClick={handleApplyCoupon}>
                  Apply
                </Button>
              </div>

              <Button
                onClick={() => {
                  if (!user) {
                    toast.error("Please login to checkout");
                    window.location.href = "/login";
                    return;
                  }
                  window.location.href = "/checkout";
                }}
                className="w-full h-14 text-lg font-bold bg-primary hover:bg-primary/90 text-black shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-all hover:scale-[1.02] active:scale-[0.98] mb-4"
              >
                Proceed to Checkout
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>

              <Link href="/">
                <Button variant="outline" className="w-full border-white/10 text-white hover:bg-white/5 h-12 font-medium">
                  Continue Shopping
                </Button>
              </Link>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-white/10 space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span>Secure checkout with SSL encryption</span>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-green-500" />
                  <span>Free delivery on first order</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
