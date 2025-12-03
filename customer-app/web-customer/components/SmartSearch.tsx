"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Sparkles, TrendingUp, Clock, ArrowRight, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

// Mock AI Suggestions
const AI_SUGGESTIONS = {
    "winter": ["Hoodies", "Jackets", "Sweatshirts", "Beanies"],
    "summer": ["Oversized Tees", "Shorts", "Tank Tops", "Caps"],
    "gym": ["Compression Tees", "Joggers", "Gym Bags", "Water Bottles"],
    "party": ["Urban Style", "Accessories", "Printed Shirts"],
    "wedding": ["Shaadi Closet", "Sherwanis", "Kurtas"],
    "traditional": ["Shaadi Closet", "Ethnic Wear"],
};

const TRENDING_SEARCHES = [
    "Oversized T-Shirts",
    "Cargo Pants",
    "Black Friday Sale",
    "Gym Essentials",
    "Winter Collection"
];

export function SmartSearch({
    placeholder = "Search for products...",
    className
}: {
    placeholder?: string;
    className?: string;
}) {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Debounce Filtering Logic
    useEffect(() => {
        const timer = setTimeout(() => {
            if (!query) {
                setSuggestions([]);
                return;
            }

            const lowerQuery = query.toLowerCase();
            let newSuggestions: string[] = [];

            // 1. Direct matches from trending
            const directMatches = TRENDING_SEARCHES.filter(s => s.toLowerCase().includes(lowerQuery));
            newSuggestions = [...newSuggestions, ...directMatches];

            // 2. AI Context Mapping (Simplified)
            Object.entries(AI_SUGGESTIONS).forEach(([key, values]) => {
                if (lowerQuery.includes(key) || key.includes(lowerQuery)) {
                    newSuggestions = [...newSuggestions, ...values];
                }
            });

            // 3. Fallback
            if (newSuggestions.length === 0) {
                newSuggestions = [`Search for "${query}"`];
            }

            setSuggestions(Array.from(new Set(newSuggestions)).slice(0, 5));
        }, 300); // 300ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleSearch = (q: string) => {
        if (!q) return;
        setIsOpen(false);
        router.push(`/search?q=${encodeURIComponent(q)}`);
    };

    return (
        <div ref={wrapperRef} className={cn("relative group w-full", className)}>
            <div className={cn(
                "relative flex items-center overflow-hidden rounded-full transition-all duration-300 bg-zinc-800/80 hover:bg-zinc-800 border border-transparent focus-within:border-zinc-700"
            )}>
                <Search className="absolute left-4 h-4 w-4 text-gray-400" />

                <Input
                    className="w-full h-10 pl-10 pr-10 bg-transparent border-none text-white placeholder:text-gray-400 focus:ring-0 text-sm"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleSearch(query);
                    }}
                />

                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setSuggestions([]);
                        }}
                        className="absolute right-4 text-gray-400 hover:text-white"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50">
                    <div className="py-2">
                        {!query ? (
                            // Default View: Trending
                            <div>
                                <div className="px-4 py-2 text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                                    <Sparkles className="h-3 w-3" /> Recommended for You
                                </div>
                                {["Gym Fits", "Black Hoodies"].map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => handleSearch(term)}
                                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-zinc-800 transition-colors flex items-center justify-between group"
                                    >
                                        {term}
                                    </button>
                                ))}
                                <div className="my-2 border-t border-zinc-800" />
                                <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <TrendingUp className="h-3 w-3" /> Trending Now
                                </div>
                                {TRENDING_SEARCHES.map((term) => (
                                    <button
                                        key={term}
                                        onClick={() => handleSearch(term)}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center justify-between group"
                                    >
                                        {term}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // Suggestions View
                            <div>
                                {suggestions.length > 0 && (
                                    <>
                                        {suggestions.map((term) => (
                                            <button
                                                key={term}
                                                onClick={() => handleSearch(term)}
                                                className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-zinc-800 hover:text-white transition-colors flex items-center gap-3"
                                            >
                                                <Search className="h-3 w-3 text-gray-500" />
                                                <span dangerouslySetInnerHTML={{
                                                    __html: term.replace(new RegExp(`(${query})`, 'gi'), '<span class="text-white font-bold">$1</span>')
                                                }} />
                                            </button>
                                        ))}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
