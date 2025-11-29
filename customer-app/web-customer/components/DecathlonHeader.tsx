"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, User, ShoppingCart, Heart, ChevronDown } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { auth } from "@/utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const SEARCH_SUGGESTIONS = [
    "Running Shoes",
    "Baggy Pants",
    "Yoga Mats",
    "Gym Bags",
    "Sports Watches"
];

export function DecathlonHeader({
    onSearch,
    pincode,
    onPincodeClick,
    onLoginClick
}: {
    onSearch: (query: string) => void;
    pincode: string;
    onPincodeClick: () => void;
    onLoginClick: () => void;
}) {
    const [user, setUser] = useState<any>(null);
    const cartItems = useCartStore((state) => state.items);
    const wishlistItems = useWishlistStore((state) => state.items);
    const [searchQuery, setSearchQuery] = useState("");
    const [currentSuggestion, setCurrentSuggestion] = useState(0);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsub();
    }, []);

    // Rotate search placeholder every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSuggestion((prev) => (prev + 1) % SEARCH_SUGGESTIONS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        onSearch(e.target.value);
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    return (
        <header className="bg-white shadow-sm sticky top-0 z-50 font-sans">
            {/* Top Bar */}
            <div className="bg-blue-900 text-white text-xs py-1 text-center font-bold tracking-wide">
                FREE DELIVERY ON FIRST ORDER • EASY RETURNS
            </div>

            <div className="container mx-auto px-4 h-20 flex items-center gap-6">
                {/* Logo */}
                <Link href="/" className="flex items-center flex-shrink-0">
                    <span className="text-2xl font-black text-blue-700 tracking-tighter italic">FLASHFIT</span>
                </Link>

                {/* Search Bar */}
                <div className="flex-1 max-w-2xl relative">
                    <div className="relative">
                        <Input
                            className="w-full h-12 pl-4 pr-12 bg-gray-100 border-none rounded-sm focus:ring-2 focus:ring-blue-500 placeholder:text-gray-500 font-medium"
                            placeholder={`Search for "${SEARCH_SUGGESTIONS[currentSuggestion]}"`}
                            value={searchQuery}
                            onChange={handleSearch}
                        />
                        <button className="absolute right-0 top-0 h-12 w-12 bg-blue-600 flex items-center justify-center rounded-r-sm hover:bg-blue-700 transition-colors">
                            <Search className="h-5 w-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-6 ml-auto">
                    {/* Delivery Location */}
                    <button onClick={onPincodeClick} className="hidden lg:flex flex-col items-start text-sm group">
                        <span className="text-xs text-gray-500 group-hover:text-blue-600">Delivery Location</span>
                        <div className="flex items-center gap-1 font-bold text-gray-800">
                            <MapPin className="h-3 w-3 text-blue-600" />
                            <span className="text-blue-600">{pincode || "Select"}</span>
                            <span className="text-[10px] text-blue-600 underline">CHANGE</span>
                        </div>
                    </button>

                    {/* User Menu */}
                    {user ? (
                        <div className="relative group">
                            <button className="flex flex-col items-center cursor-pointer">
                                <User className="h-5 w-5 text-gray-700 group-hover:text-blue-600" />
                                <span className="text-[10px] font-bold text-gray-700 group-hover:text-blue-600">
                                    {user.displayName?.split(' ')[0] || 'Account'}
                                </span>
                            </button>

                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                                <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                                    My Orders
                                </Link>
                                <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600">
                                    Profile
                                </Link>
                                <div className="border-t border-gray-100 mt-2 pt-2">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                    >
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <button onClick={onLoginClick} className="flex flex-col items-center cursor-pointer group">
                            <User className="h-5 w-5 text-gray-700 group-hover:text-blue-600" />
                            <span className="text-[10px] font-bold text-gray-700 group-hover:text-blue-600">Sign In</span>
                        </button>
                    )}

                    {/* Wishlist with Badge */}
                    <Link href="/wishlist" className="flex flex-col items-center cursor-pointer group relative">
                        <div className="relative">
                            <Heart className="h-5 w-5 text-gray-700 group-hover:text-blue-600" />
                            {wishlistItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                    {wishlistItems.length}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 group-hover:text-blue-600">Wishlist</span>
                    </Link>

                    {/* Cart with Badge */}
                    <Link href="/cart" className="flex flex-col items-center cursor-pointer group relative">
                        <div className="relative">
                            <ShoppingCart className="h-5 w-5 text-gray-700 group-hover:text-blue-600" />
                            {cartItems.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                                    {cartItems.length}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-bold text-gray-700 group-hover:text-blue-600">Cart</span>
                    </Link>
                </div>
            </div>

            {/* Category Nav */}
            <div className="border-t border-gray-200">
                <div className="container mx-auto px-4 h-10 flex items-center gap-8 text-sm font-medium text-gray-600 overflow-x-auto">
                    <Link href="/category/men" className="hover:text-blue-600 whitespace-nowrap">Men's</Link>
                    <Link href="/category/women" className="hover:text-blue-600 whitespace-nowrap">Women's</Link>
                    <Link href="/category/running" className="hover:text-blue-600 whitespace-nowrap">Running</Link>
                    <Link href="/category/training" className="hover:text-blue-600 whitespace-nowrap">Training</Link>
                    <Link href="/category/yoga" className="hover:text-blue-600 whitespace-nowrap">Yoga</Link>
                    <Link href="/category/accessories" className="hover:text-blue-600 whitespace-nowrap">Accessories</Link>
                    <Link href="/category/fashion" className="hover:text-blue-600 whitespace-nowrap text-purple-600 font-bold">Fashion</Link>
                    <Link href="/category/clearance" className="hover:text-blue-600 whitespace-nowrap text-red-600 font-bold">Clearance</Link>
                </div>
            </div>
        </header>
    );
}
