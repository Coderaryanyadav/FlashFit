"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingBag, Heart, User } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

export function MobileNav() {
    const pathname = usePathname();
    const cartCount = useCartStore((state) => state.items.length);

    const navItems = [
        { href: "/", icon: Home, label: "Home" },
        { href: "/search", icon: Search, label: "Search" },
        { href: "/cart", icon: ShoppingBag, label: "Cart", count: cartCount },
        { href: "/wishlist", icon: Heart, label: "Wishlist" },
        { href: "/profile", icon: User, label: "Profile" },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-50 md:hidden pb-safe">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? "text-white" : "text-gray-500 hover:text-gray-300"
                                }`}
                        >
                            <div className="relative">
                                <item.icon className={`h-6 w-6 ${isActive ? "fill-white" : ""}`} />
                                {item.count !== undefined && item.count > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-primary text-black text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                        {item.count}
                                    </span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
