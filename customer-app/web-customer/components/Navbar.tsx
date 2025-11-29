"use client";

import Link from "next/link";
import { ShoppingBag, Search, MapPin, Menu } from "lucide-react";
import { CartDrawer } from "./CartDrawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

export function Navbar() {
    return (
        <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center gap-4 px-4 md:px-6">
                {/* Logo & Location */}
                <div className="flex items-center gap-2 md:gap-4">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-lg">F</span>
                        </div>
                        <span className="hidden font-bold text-xl md:inline-block">FlashFit</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors bg-secondary/50 px-3 py-1.5 rounded-full">
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-medium truncate max-w-[150px]">New Delhi, India</span>
                        <span className="text-xs opacity-70">▼</span>
                    </div>
                </div>

                {/* Search Bar (Zepto Style - Centered & Wide) */}
                <div className="flex-1 flex justify-center max-w-2xl mx-auto">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search for 'Oversized T-shirt'..."
                            className="w-full pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary transition-all rounded-xl h-10"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 md:gap-4">
                    <Button variant="ghost" size="icon" className="hidden md:flex">
                        <span className="sr-only">Menu</span>
                        <Menu className="h-5 w-5" />
                    </Button>

                    <CartDrawer />

                    <Button size="sm" className="hidden md:flex rounded-full px-6 font-semibold">
                        Login
                    </Button>
                </div>
            </div>

            {/* Mobile Location Bar */}
            <div className="md:hidden border-t px-4 py-2 bg-secondary/30 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-primary" />
                    <span className="font-medium">Delivering to: <span className="text-foreground font-bold">New Delhi</span></span>
                </div>
                <span className="text-primary font-bold">10 Mins</span>
            </div>
        </nav>
    );
}
