"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart, Trash2, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function CartSheet() {
    const { items, removeItem, updateQuantity, total } = useCartStore();
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    const handleCheckout = () => {
        setIsOpen(false);
        router.push("/checkout");
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <button className="relative text-gray-300 hover:text-white transition-colors">
                    <ShoppingCart className="h-5 w-5" />
                    {items.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                            {items.length}
                        </span>
                    )}
                </button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md bg-zinc-950 border-l border-white/10 text-white flex flex-col !top-16 !h-[calc(100vh-4rem)]">
                <SheetHeader className="border-b border-white/10 pb-4">
                    <SheetTitle className="text-white text-xl font-bold flex items-center gap-2">
                        <ShoppingCart className="h-5 w-5" />
                        Your Cart ({items.length})
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-50">
                            <ShoppingCart className="h-16 w-16" />
                            <p className="text-lg font-medium">Your cart is empty</p>
                            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-white/20 text-white hover:bg-white/10">
                                Continue Shopping
                            </Button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={`${item.id}-${item.size}`} className="flex gap-3 items-start bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                                <div className="relative h-20 w-20 bg-zinc-800 rounded-lg overflow-hidden flex-shrink-0 border border-white/5">
                                    {item.image && (
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            sizes="80px"
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-sm line-clamp-2">{item.title}</h4>
                                            <button
                                                onClick={() => removeItem(item.id, item.size || "")}
                                                className="text-gray-500 hover:text-red-500 transition-colors"
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1">Size: {item.size}</p>
                                        <p className="text-sm font-bold mt-1">₹{item.price}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center border border-white/10 rounded-md">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.size || "", item.quantity - 1)}
                                                className="p-1 hover:bg-white/10 transition-colors"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="h-3 w-3" />
                                            </button>
                                            <span className="text-xs w-8 text-center font-medium">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.size || "", item.quantity + 1)}
                                                className="p-1 hover:bg-white/10 transition-colors"
                                            >
                                                <Plus className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="border-t border-white/10 pt-4 space-y-4 mt-auto">
                        <div className="flex justify-between items-center text-lg font-bold">
                            <span>Subtotal</span>
                            <span>₹{total()}</span>
                        </div>
                        <p className="text-xs text-gray-500 text-center">Shipping and taxes calculated at checkout.</p>
                        <Button
                            onClick={handleCheckout}
                            className="w-full bg-white text-black hover:bg-gray-200 font-bold py-6 text-lg"
                        >
                            Checkout
                        </Button>
                    </div>
                )}
            </SheetContent>
        </Sheet>
    );
}
