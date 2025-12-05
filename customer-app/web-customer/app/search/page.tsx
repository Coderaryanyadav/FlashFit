"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "@/shared/infrastructure/firebase";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Search, Loader2, ShoppingBag } from "lucide-react";
import { ProductCard } from "@/features/products/ui/ProductCard";
import { Header } from "@/components/Header";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("relevance");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // In a real app with Algolia/Typesense, we'd do a proper search.
        // For Firestore, we'll fetch all and filter client-side (not efficient but works for MVP).
        const q = query(collection(db, "products"));
        const snapshot = await getDocs(q);
        const allProducts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (initialQuery) {
          const filtered = allProducts.filter((p: any) =>
            p.title.toLowerCase().includes(initialQuery.toLowerCase()) ||
            p.category?.toLowerCase().includes(initialQuery.toLowerCase()) ||
            p.description?.toLowerCase().includes(initialQuery.toLowerCase())
          );
          setProducts(filtered);
        } else {
          setProducts([]);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [initialQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    return 0;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground">
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl font-bold text-white mb-6 text-center">Search Results</h1>
          <form onSubmit={handleSearch} className="relative mb-6">
            <Input
              placeholder="Search for products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 rounded-full focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
            />
            <Search className="absolute left-4 top-4 h-6 w-6 text-neutral-500" />
            <Button
              type="submit"
              className="absolute right-2 top-2 h-10 px-6 rounded-full bg-primary text-black font-bold hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </form>

          {/* Sort Control */}
          {products.length > 0 && (
            <div className="flex justify-end">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-neutral-900 text-white border border-neutral-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="relevance">Relevance</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : sortedProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-10 w-10 text-neutral-700" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
            <p className="text-neutral-400">Try searching for &quot;Streetwear&quot;, &quot;Oversized&quot;, or &quot;Gym Fits&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
