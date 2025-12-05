// Search autocomplete with debouncing

import { useState, useEffect, useCallback } from "react";
import { collection, query, where, getDocs, limit } from "firebase/firestore";
import { db } from "@/shared/infrastructure/firebase";

interface SearchResult {
    id: string;
    title: string;
    category: string;
    price: number;
    image: string;
}

export function useSearchAutocomplete(searchTerm: string, debounceMs: number = 300) {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("recentSearches");
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Debounced search function
    const searchProducts = useCallback(
        async (term: string) => {
            if (!term || term.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                // Search by title (case-insensitive)
                const q = query(
                    collection(db, "products"),
                    where("title", ">=", term),
                    where("title", "<=", term + '\uf8ff'),
                    limit(5)
                );

                const snapshot = await getDocs(q);
                const products = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as SearchResult));

                setResults(products);
            } catch (error) {
                console.error("Search error:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        },
        []
    );

    // Debounce effect
    useEffect(() => {
        const timer = setTimeout(() => {
            searchProducts(searchTerm);
        }, debounceMs);

        return () => clearTimeout(timer);
    }, [searchTerm, debounceMs, searchProducts]);

    // Save search to recent searches
    const saveSearch = (term: string) => {
        const updated = [term, ...recentSearches.filter(s => s !== term)].slice(0, 5);
        setRecentSearches(updated);
        localStorage.setItem("recentSearches", JSON.stringify(updated));
    };

    return { results, loading, recentSearches, saveSearch };
}
