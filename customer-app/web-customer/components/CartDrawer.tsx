"use client";

import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

export function CartDrawer() {
    const { user } = useAuth();
    const { items, removeItem, updateQuantity, total } = useCartStore();
    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <ShoppingBag className="h-5 w-5" />
                    {itemCount > 0 && (
                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center animate-in zoom-in">
                            {itemCount}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-secondary/30 backdrop-blur-xl">
                <SheetHeader className="px-6 py-4 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <SheetTitle className="text-lg font-bold flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-primary" />
                            My Cart <span className="text-muted-foreground text-sm font-normal">({itemCount} items)</span>
                        </SheetTitle>
                        {/* Close button is auto-added by SheetContent, but we can customize if needed */}
                    </div>
                </SheetHeader>

                {items.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                        <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-4">
                            <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-xl font-bold">Your cart is empty</h3>
                        <p className="text-muted-foreground max-w-xs">
                            Looks like you haven&apos;t added anything yet. Start shopping to fill it up!
                        </p>
                        <SheetClose asChild>
                            <Button className="mt-4 rounded-full px-8">Start Shopping</Button>
                        </SheetClose>
                    </div>
                ) : (
                    <>
                        <ScrollArea className="flex-1 px-6 py-4">
                            <div className="space-y-6">
                                {items.map((item) => (
                                    <div key={item.id} className="flex gap-4 group">
                                        <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-white border shadow-sm shrink-0">
                                            <Image
                                                src={item.image}
                                                alt={item.title}
                                                fill
                                                sizes="80px"
                                                className="object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 flex flex-col justify-between py-1">
                                            <div className="space-y-1">
                                                <h4 className="font-semibold text-sm leading-tight line-clamp-2">
                                                    {item.title}
                                                </h4>
                                                <p className="text-xs text-muted-foreground">Size: M</p>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="font-bold text-sm">₹{item.price * item.quantity}</div>

                                                <div className="flex items-center gap-3 bg-background border rounded-lg p-1 shadow-sm">
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size || '', Math.max(0, item.quantity - 1))}
                                                        className="h-6 w-6 flex items-center justify-center hover:bg-muted rounded-md transition-colors"
                                                    >
                                                        {item.quantity === 1 ? (
                                                            <Trash2 className="h-3 w-3 text-red-500" />
                                                        ) : (
                                                            <Minus className="h-3 w-3" />
                                                        )}
                                                    </button>
                                                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.id, item.size || '', item.quantity + 1)}
                                                        className="h-6 w-6 flex items-center justify-center hover:bg-muted rounded-md transition-colors"
                                                    >
                                                        <Plus className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Bill Details */}
                            <div className="mt-8 space-y-3 bg-background/50 p-4 rounded-xl border">
                                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-2">Bill Details</h4>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Item Total</span>
                                    <span>₹{total()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Delivery Fee</span>
                                    <span className="text-primary font-bold">FREE</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Platform Fee</span>
                                    <span>₹10</span>
                                </div>
                                <Separator />
                                <div className="flex justify-between font-bold text-base">
                                    <span>To Pay</span>
                                    <span>₹{total() + 10}</span>
                                </div>
                            </div>
                        </ScrollArea>

                        <SheetFooter className="p-6 border-t bg-background/80 backdrop-blur-md">
                            <SheetClose asChild>
                                <Button
                                    onClick={() => {
                                        if (!user) {
                                            // Close sheet first if possible, or just redirect
                                            window.location.href = "/login";
                                            return;
                                        }
                                        window.location.href = "/checkout";
                                    }}
                                    className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 flex items-center justify-between px-6"
                                >
                                    <span>₹{total() + 10}</span>
                                    <span className="flex items-center gap-2">
                                        Proceed to Pay <ArrowRight className="h-4 w-4" />
                                    </span>
                                </Button>
                            </SheetClose>
                        </SheetFooter>
                    </>
                )}
            </SheetContent>
        </Sheet>
    );
}
