"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, User, ShoppingCart, Heart, Menu, X, Package, HelpCircle } from "lucide-react";
import Link from "next/link";
import { Input } from "@/shared/ui/input";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { useWishlistStore } from "@/store/useWishlistStore";
import { auth } from "@/shared/infrastructure/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { cn } from "@/lib/utils";
import { SmartSearch } from "@/components/SmartSearch";
import { useUIStore } from "@/store/useUIStore";
import { CartSheet } from "@/components/CartSheet";

const SEARCH_SUGGESTIONS = [
  "Oversized Tees",
  "Cargo Pants",
  "Pump Covers",
  "Streetwear",
  "Gym Fits"
];

export function Header({
  onSearch = () => { },
  pincode: initialPincode,
  onPincodeClick = () => { },
  onLoginClick
}: {
  onSearch?: (query: string) => void;
  pincode?: string;
  onPincodeClick?: () => void;
  onLoginClick?: () => void;
}) {
  const [user, setUser] = useState<any>(null);
  const cartItems = useCartStore((state) => state.items);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const openLogin = useUIStore((state) => state.openLogin);

  // Pincode persistence
  const [pincode, setPincode] = useState<string>(initialPincode || "Select");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('flashfit_pincode');
    if (saved) {
      setPincode(saved);
    } else if (!initialPincode) {
      setPincode("400059");
    }
  }, [initialPincode]);

  useEffect(() => {
    if (mounted && pincode && pincode !== "Select") {
      localStorage.setItem('flashfit_pincode', pincode);
    }
  }, [pincode, mounted]);

  // Use provided onLoginClick or default to store
  const handleLoginClick = () => {
    if (onLoginClick) onLoginClick();
    else openLogin();
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-[60] bg-black border-b border-white/10">
      {/* Top Bar - Help & Track */}
      <div className="bg-zinc-950 border-b border-white/5 py-1 px-4 hidden md:block">
        <div className="container mx-auto flex justify-end gap-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <Link href="/track-order" className="hover:text-white flex items-center gap-1">
            <Package className="h-3 w-3" /> Track Order
          </Link>
          <Link href="/help" className="hover:text-white flex items-center gap-1">
            <HelpCircle className="h-3 w-3" /> Help Center
          </Link>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-8">
        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-white"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>

        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0">
          <span className="text-2xl font-black italic text-white tracking-tighter">
            FLASHFIT
          </span>
        </Link>

        {/* Search Bar (Desktop) - Centered */}
        <div className="hidden md:block flex-1 max-w-2xl">
          <SmartSearch />
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
          {/* Pincode */}
          <button onClick={onPincodeClick} className="hidden sm:flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium">{pincode}</span>
          </button>

          {/* User */}
          {user ? (
            <div className="relative group">
              <button className="flex items-center text-gray-300 hover:text-white transition-colors">
                <User className="h-5 w-5" />
              </button>
              <div className="absolute right-0 top-full mt-4 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right">
                <div className="px-4 py-2 border-b border-white/5">
                  <p className="text-sm text-white font-bold truncate">{user.displayName || 'User'}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
                <Link href="/orders" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">My Orders</Link>
                <Link href="/wishlist" className="block px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white">Wishlist</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5">Logout</button>
              </div>
            </div>
          ) : (
            <button onClick={handleLoginClick} className="text-gray-300 hover:text-white transition-colors">
              <User className="h-5 w-5" />
            </button>
          )}

          {/* Cart */}
          <CartSheet />
        </div>
      </div>

      {/* Bottom Row: Navigation Categories */}
      <div className="hidden lg:block border-t border-white/5 bg-zinc-950">
        <div className="container mx-auto px-4">
          <nav className="flex items-center justify-center gap-8 h-12">
            {[
              { name: "Women", slug: "women" },
              { name: "Men", slug: "men" },
              { name: "Kids", slug: "kids" },
              { name: "Urban Style", slug: "urban-style" },
              { name: "Accessories", slug: "accessories" },
              { name: "Everyday", slug: "everyday" },
              { name: "Last-Minute", slug: "last-minute", color: "text-red-500" }
            ].map((cat) => (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className={cn(
                  "text-xs font-bold uppercase tracking-widest hover:text-white transition-colors relative group",
                  cat.color || "text-gray-400"
                )}
              >
                {cat.name}
                <span className="absolute -bottom-4 left-0 w-full h-0.5 bg-white scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-black border-t border-white/10 p-4 h-[calc(100vh-64px)] overflow-y-auto">
          <div className="flex flex-col gap-6">
            <SmartSearch placeholder="Search products..." className="w-full" />
            <nav className="flex flex-col gap-2">
              {[
                { name: "Women", slug: "women" },
                { name: "Men", slug: "men" },
                { name: "Kids", slug: "kids" },
                { name: "Urban Style", slug: "urban-style" },
                { name: "Accessories", slug: "accessories" },
                { name: "Everyday", slug: "everyday" },
                { name: "Last-Minute", slug: "last-minute" }
              ].map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="text-lg font-bold text-gray-300 hover:text-white py-3 border-b border-white/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 flex flex-col gap-4">
                <Link href="/track-order" className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-2">
                  <Package className="h-4 w-4" /> Track Order
                </Link>
                <Link href="/help" className="text-sm font-bold text-gray-400 hover:text-white flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" /> Help Center
                </Link>
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
