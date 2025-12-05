"use client";

import { useState, useEffect } from "react";
import { ProductService } from "@/features/products/services/productService";
import { Product } from "@flashfit/types";
import { CategoryService, Category } from "@/services/categoryService";
import { ProductCard } from "@/features/products/ui/ProductCard";
import { LoginModal } from "@/components/LoginModal";
import { Slider } from "@/shared/ui/slider";
import { ChevronRight, SlidersHorizontal, X, Filter, ArrowUpDown, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { ProductSkeleton } from "@/features/products/ui/ProductSkeleton";

// Force rebuild

const SERVICEABLE_PINCODE = "400059";

export default function CategoryPage({ params }: { params: { slug: string } }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [category, setCategory] = useState<Category | null>(null);
    const [loading, setLoading] = useState(true);
    const [priceRange, setPriceRange] = useState([0, 10000]);
    const [showFilters, setShowFilters] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [sortBy, setSortBy] = useState("newest");
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [minDiscount, setMinDiscount] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Category Details (except for 'all')
                if (params.slug !== 'all') {
                    const cat = await CategoryService.getCategoryBySlug(params.slug);
                    setCategory(cat);
                } else {
                    setCategory({ name: "All Products", slug: "all", image: "", id: "all" } as Category);
                }

                // Fetch Products
                const fetchedProducts = await ProductService.getProducts(params.slug);
                setProducts(fetchedProducts);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [params.slug]);

    const categoryName = category?.name || (params.slug === 'all' ? "All Products" : params.slug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '));

    const filteredProducts = products
        .filter(p => {
            if (p.price < priceRange[0] || p.price > priceRange[1]) return false;

            if (selectedSizes.length > 0) {
                const productSizes = p.sizes || ['S', 'M', 'L', 'XL', 'XXL'];
                const hasSize = selectedSizes.some(s => productSizes.includes(s));
                if (!hasSize) return false;
            }

            if (selectedRatings.length > 0) {
                const productRating = p.rating || 4.5;
                const matchesRating = selectedRatings.some(r => productRating >= r);
                if (!matchesRating) return false;
            }

            if (selectedColors.length > 0) {
                const productColors = p.colors || [];
                // If product has no colors defined, we might exclude it or include it.
                // Let's exclude if it doesn't match any selected color.
                if (!productColors.some(c => selectedColors.includes(c))) return false;
            }

            if (minDiscount > 0) {
                if ((p.discount || 0) < minDiscount) return false;
            }

            return true;
        })
        .sort((a, b) => {
            if (sortBy === "price_low") return a.price - b.price;
            if (sortBy === "price_high") return b.price - a.price;
            return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        });

    const toggleSize = (size: string) => {
        setSelectedSizes(prev =>
            prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
        );
    };

    const toggleRating = (rating: number) => {
        setSelectedRatings(prev =>
            prev.includes(rating) ? prev.filter(r => r !== rating) : [...prev, rating]
        );
    };

    const toggleColor = (color: string) => {
        setSelectedColors(prev =>
            prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
        );
    };

    return (
        <div className="min-h-screen bg-neutral-950 text-foreground">
            <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />

            <div className="container mx-auto px-4 pb-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-foreground font-medium capitalize">{categoryName}</span>
                </div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">{categoryName}</h1>
                        <p className="text-muted-foreground">
                            {loading ? "Loading products..." : `${filteredProducts.length} products available`}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            className="lg:hidden border-white/10 text-white hover:bg-white/5"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                            Filters
                        </Button>

                        <div className="relative group">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="h-10 pl-3 pr-8 bg-neutral-900 border border-white/10 rounded-md text-sm text-white focus:outline-none focus:border-primary appearance-none cursor-pointer"
                            >
                                <option value="newest">Newest First</option>
                                <option value="price_low">Price: Low to High</option>
                                <option value="price_high">Price: High to Low</option>
                            </select>
                            <ArrowUpDown className="absolute right-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="flex gap-12">
                    {/* Sidebar Filters */}
                    <aside className={`
                        fixed inset-y-0 left-0 z-50 w-80 bg-neutral-900 p-6 transform transition-transform duration-300 lg:relative lg:transform-none lg:w-72 lg:bg-transparent lg:p-0 lg:block lg:h-fit
                        ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        <div className="lg:sticky lg:top-24 space-y-8">
                            <div className="flex items-center justify-between lg:hidden mb-6">
                                <h3 className="font-bold text-lg text-white">Filters</h3>
                                <Button variant="ghost" size="icon" onClick={() => setShowFilters(false)}>
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="bg-neutral-900/50 rounded-2xl p-6 backdrop-blur-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-primary" />
                                        Filters
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setPriceRange([0, 10000]);
                                            setSortBy("newest");
                                            setSelectedSizes([]);
                                            setSelectedRatings([]);
                                        }}
                                        className="text-xs text-primary hover:underline font-medium"
                                    >
                                        Reset
                                    </button>
                                </div>

                                {/* Price Range */}
                                <div>
                                    <h4 className="font-bold text-sm text-neutral-400 mb-6 uppercase tracking-wider">Price Range</h4>
                                    <Slider
                                        value={priceRange}
                                        max={10000}
                                        step={100}
                                        onValueChange={setPriceRange}
                                        className="mb-6"
                                    />
                                    <div className="flex justify-between text-sm font-medium text-white">
                                        <span className="bg-zinc-800/50 px-3 py-1 rounded-lg">₹{priceRange[0]}</span>
                                        <span className="bg-zinc-800/50 px-3 py-1 rounded-lg">₹{priceRange[1]}</span>
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <h4 className="font-bold text-sm text-neutral-400 mb-4 uppercase tracking-wider">Size</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                                            <label key={size} className={`flex items-center justify-center p-2 rounded-lg cursor-pointer transition-all ${selectedSizes.includes(size) ? 'bg-white text-black' : 'bg-zinc-800/50 hover:bg-zinc-800'}`}>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={selectedSizes.includes(size)}
                                                    onChange={() => toggleSize(size)}
                                                />
                                                <span className="text-sm font-bold">{size}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <h4 className="font-bold text-sm text-neutral-400 mb-4 uppercase tracking-wider">Discount</h4>
                                    <div className="space-y-2">
                                        {[10, 20, 30, 50].map((discount) => (
                                            <label key={discount} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="radio"
                                                    name="discount"
                                                    className="w-4 h-4 rounded-full border-white/20 bg-transparent checked:bg-primary checked:border-primary"
                                                    checked={minDiscount === discount}
                                                    onChange={() => setMinDiscount(minDiscount === discount ? 0 : discount)}
                                                    onClick={() => { if (minDiscount === discount) setMinDiscount(0); }}
                                                />
                                                <span className="text-sm text-gray-400 group-hover:text-white">{discount}% or more</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <h4 className="font-bold text-sm text-neutral-400 mb-4 uppercase tracking-wider">Color</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {[
                                            { name: 'Black', hex: '#1a1a1a' },
                                            { name: 'White', hex: '#e5e5e5' },
                                            { name: 'Blue', hex: '#6b9bd1' },
                                            { name: 'Red', hex: '#d17b7b' },
                                            { name: 'Green', hex: '#7bba7b' },
                                            { name: 'Yellow', hex: '#e8d96f' },
                                            { name: 'Pink', hex: '#e8a5c4' },
                                            { name: 'Grey', hex: '#9ca3af' }
                                        ].map((color) => (
                                            <button
                                                key={color.name}
                                                onClick={() => toggleColor(color.name)}
                                                className={`w-8 h-8 rounded-full border-2 transition-all ${selectedColors.includes(color.name) ? 'border-primary scale-110' : 'border-zinc-700 hover:scale-110'}`}
                                                style={{ backgroundColor: color.hex }}
                                                title={color.name}
                                            />
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-8">
                                    <h4 className="font-bold text-sm text-neutral-400 mb-4 uppercase tracking-wider">Rating</h4>
                                    <div className="space-y-2">
                                        {[4, 3, 2, 1].map((rating) => (
                                            <label key={rating} className="flex items-center gap-3 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-white/20 bg-transparent checked:bg-primary checked:border-primary"
                                                    checked={selectedRatings.includes(rating)}
                                                    onChange={() => toggleRating(rating)}
                                                />
                                                <div className="flex items-center gap-1 text-sm text-gray-400 group-hover:text-white">
                                                    <span>{rating}+</span>
                                                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Overlay for mobile filters */}
                    {
                        showFilters && (
                            <div
                                className="fixed inset-0 bg-black/80 z-40 lg:hidden backdrop-blur-sm"
                                onClick={() => setShowFilters(false)}
                            />
                        )
                    }

                    {/* Products Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map((n) => (
                                    <ProductSkeleton key={n} />
                                ))}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                                {filteredProducts.map((product) => (
                                    <ProductCard key={product.id} {...product} image={product.images[0]} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-32 bg-neutral-900/30 rounded-3xl border border-dashed border-white/10">
                                <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <SearchX className="w-8 h-8 text-neutral-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
                                <p className="text-neutral-400 mb-6">Try adjusting your filters or check back later.</p>
                                <Button
                                    onClick={() => {
                                        setPriceRange([0, 10000]);
                                        setSelectedSizes([]);
                                        setSelectedRatings([]);
                                    }}
                                    variant="outline"
                                    className="border-primary text-primary hover:bg-primary hover:text-black"
                                >
                                    Clear Filters
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function SearchX({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
            <path d="m8 8 6 6" />
            <path d="m14 8-6 6" />
        </svg>
    )
}
