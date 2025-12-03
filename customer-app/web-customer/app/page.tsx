"use client";

import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { ProductCard } from "@/components/ProductCard";
import { MapPin, ArrowRight, Zap, Clock, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import Image from "next/image";
import { CategoryService, Category } from "@/services/categoryService";
import { ProductService } from "@/services/productService";
import { ProductSkeleton } from "@/components/ProductSkeleton";
import dynamic from "next/dynamic";

const LoginModal = dynamic(() => import("@/components/LoginModal").then(mod => mod.LoginModal), { ssr: false });
const Marquee = dynamic(() => import("@/components/Marquee").then(mod => mod.Marquee), { ssr: false });

const SERVICEABLE_PINCODE = "400059";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pincodeInput, setPincodeInput] = useState("");
  const [isPincodeVerified, setIsPincodeVerified] = useState(false);
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [pincodeError, setPincodeError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Fetch Categories and Trending Products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, trends] = await Promise.all([
          CategoryService.getCategories(),
          ProductService.getTrendingProducts(SERVICEABLE_PINCODE)
        ]);
        setCategories(cats);
        setTrendingProducts(trends);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    try {
      const savedPincode = localStorage.getItem("userPincode");
      if (savedPincode === SERVICEABLE_PINCODE) {
        setIsPincodeVerified(true);
        setPincodeInput(savedPincode);
      } else {
        setShowPincodeModal(true);
      }
    } catch (e) {
      console.error("Error accessing localStorage:", e);
      setShowPincodeModal(true);
    }
  }, []);

  useEffect(() => {
    if (!isPincodeVerified) {
      return;
    }

    // ⚠️ CHANGED: Use one-time fetch instead of subscription to prevent "Page Unresponsive" / Freezing
    // Real-time listeners can sometimes cause infinite loops if not handled perfectly.
    // For the homepage, a one-time fetch is safer and sufficient.
    const fetchProducts = async () => {
      try {
        const { getDocs, query, collection, where } = await import("firebase/firestore");
        const q = query(
          collection(db, "products"),
          where("pincodes", "array-contains", SERVICEABLE_PINCODE)
        );
        const snapshot = await getDocs(q);
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [isPincodeVerified]);

  // Safety timeout for loading
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const handlePincodeVerify = () => {
    const cleanPincode = pincodeInput.trim().replace(/\s/g, "");

    if (cleanPincode === SERVICEABLE_PINCODE) {
      setIsPincodeVerified(true);
      setPincodeError("");
      try {
        localStorage.setItem("userPincode", cleanPincode);
      } catch (e) {
        console.error("Failed to save pincode:", e);
      }
      setShowPincodeModal(false);
    } else {
      setPincodeError(`Sorry, we don't deliver to ${cleanPincode || "this location"} yet.`);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black">
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      {/* Pincode Modal */}
      <Dialog open={showPincodeModal} onOpenChange={setShowPincodeModal}>
        <DialogContent className="sm:max-w-md bg-zinc-900 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <MapPin className="h-5 w-5 text-white" />
              Location Check
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-gray-400">
              Enter your pincode to unlock exclusive drops in your area.
            </p>
            <div className="relative">
              <Input
                placeholder="Enter pincode (e.g., 400059)"
                className="h-12 text-lg pr-24 bg-black border-zinc-700 focus:border-white text-white placeholder:text-zinc-600"
                value={pincodeInput}
                onChange={(e) => {
                  setPincodeInput(e.target.value);
                  setPincodeError("");
                }}
                onKeyPress={(e) => e.key === 'Enter' && handlePincodeVerify()}
                maxLength={6}
              />
              <Button
                className="absolute right-1 top-1 h-10 bg-white hover:bg-gray-200 text-black font-bold"
                onClick={handlePincodeVerify}
                disabled={pincodeInput.length !== 6}
              >
                Check
              </Button>
            </div>

            {pincodeError && (
              <div className="p-3 bg-red-900/20 border border-red-900/50 rounded-lg">
                <p className="text-sm text-red-400">{pincodeError}</p>
              </div>
            )}

            <div className="p-3 bg-zinc-800/50 border border-zinc-700 rounded-lg">
              <p className="text-xs text-gray-400 font-medium mb-1">Live in:</p>
              <p className="text-sm font-bold text-white">{SERVICEABLE_PINCODE} - Goregaon, Mumbai</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div>
        <Marquee text="FLASH SALE • 60 MIN DELIVERY • FREE RETURNS • NEW DROPS DAILY •" />

        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black z-10" />
            <Image
              src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=1600&q=80"
              alt="Hero"
              fill
              priority
              className="object-cover object-center scale-105 animate-pulse-slow"
            />
          </div>

          <div className="relative z-20 text-center px-4 max-w-5xl mx-auto space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold mb-4">
              <Zap className="h-4 w-4 fill-white" />
              <span>60 MINUTE DELIVERY</span>
            </div>
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.9]">
              WEAR THE <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-400 to-gray-600">MOMENT.</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-2xl mx-auto font-light tracking-wide">
              Curated fashion delivered before you&apos;re ready to go out.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
              <Link href="/category/urban-style">
                <Button size="lg" className="h-16 px-12 text-xl bg-white text-black hover:bg-gray-200 font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Stack Categories */}
        <section className="py-12 bg-black">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-4xl font-black tracking-tight mb-2">THE COLLECTION</h2>
                <p className="text-gray-400 text-lg">Essentials for every vibe.</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories.map((category) => (
                <Link
                  href={`/category/${category.slug}`}
                  key={category.slug}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 h-[280px] hover:border-white/30 transition-all"
                  onClick={() => localStorage.setItem("userAffinity", category.slug)}
                >
                  <div className="absolute inset-0 bg-zinc-900 transition-colors duration-500 group-hover:bg-zinc-800">
                    <Image
                      src={category.image}
                      alt={category.name}
                      fill
                      className="object-cover opacity-70 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
                      onError={(e) => {
                        // Note: onError on next/image works differently, usually requires handling state or fallback src
                        // For now, we'll rely on valid images or handle at data level
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 className="text-2xl font-black tracking-tight text-white mb-1 group-hover:translate-y-[-4px] transition-transform">
                      {category.name.toUpperCase()}
                    </h3>
                    <p className="text-gray-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      {category.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Selling Fast (Low Stock) */}
        <main className="container mx-auto px-4 py-12 border-t border-white/10">
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-white text-black rounded-full flex items-center justify-center animate-pulse">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight">SELLING FAST</h2>
                <p className="text-red-500 font-bold uppercase tracking-widest text-sm mt-1">Low Stock Alert</p>
              </div>
            </div>
            <Link href="/category/all" className="hidden md:flex items-center gap-2 text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-sm group">
              View All <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* ... */}

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12">
              {[1, 2, 3, 4, 5].map((n) => (
                <ProductSkeleton key={n} />
              ))}
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-12">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-zinc-900/30 border border-white/5 border-dashed">
              <p className="text-gray-400 text-xl">All caught up. Check back soon for new drops.</p>
            </div>
          )}

          <div className="mt-12 md:hidden flex justify-center">
            <Link href="/category/all">
              <Button variant="outline" className="w-full border-white/20 text-white">View All</Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}