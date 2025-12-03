"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function BackToTop() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout | null = null;

        const toggleVisibility = () => {
            if (timeoutId) return;

            timeoutId = setTimeout(() => {
                if (window.scrollY > 300) {
                    setIsVisible(true);
                } else {
                    setIsVisible(false);
                }
                timeoutId = null;
            }, 100);
        };

        window.addEventListener("scroll", toggleVisibility);
        return () => {
            window.removeEventListener("scroll", toggleVisibility);
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 p-3 bg-white text-black rounded-full shadow-lg hover:bg-gray-200 transition-colors"
                    aria-label="Back to top"
                >
                    <ArrowUp className="h-6 w-6" />
                </motion.button>
            )}
        </AnimatePresence>
    );
}
