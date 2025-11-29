"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
    {
        id: 1,
        title: "READY TO PLAY?",
        subtitle: "Discover our new collection of high-performance gear designed for every athlete.",
        cta: "SHOP NOW",
        image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2070&auto=format&fit=crop",
        gradient: "from-black/60 to-transparent"
    },
    {
        id: 2,
        title: "BAGGY PANTS COLLECTION",
        subtitle: "Street-ready fashion meets ultimate comfort. New drops every week.",
        cta: "EXPLORE",
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?q=80&w=2070&auto=format&fit=crop",
        gradient: "from-purple-900/60 to-transparent"
    },
    {
        id: 3,
        title: "RUNNING ESSENTIALS",
        subtitle: "Premium running shoes and gear. Built for speed, designed for comfort.",
        cta: "SHOP RUNNING",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
        gradient: "from-blue-900/60 to-transparent"
    },
    {
        id: 4,
        title: "YOGA & WELLNESS",
        subtitle: "Find your zen with our premium yoga mats, blocks, and activewear.",
        cta: "DISCOVER",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2070&auto=format&fit=crop",
        gradient: "from-green-900/60 to-transparent"
    }
];

export function HeroCarousel() {
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000); // Auto-rotate every 5 seconds

        return () => clearInterval(timer);
    }, []);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    return (
        <div className="relative h-[500px] w-full overflow-hidden bg-gray-900">
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    {/* Background Image */}
                    <div
                        className="absolute inset-0 bg-cover bg-center"
                        style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
                    />

                    {/* Gradient Overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].gradient}`} />

                    {/* Content */}
                    <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center text-white">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4"
                        >
                            {slides[currentSlide].title}
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-xl md:text-2xl font-medium mb-8 max-w-xl"
                        >
                            {slides[currentSlide].subtitle}
                        </motion.p>
                        <motion.button
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="w-fit h-12 px-8 bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-lg rounded-sm transition-colors"
                        >
                            {slides[currentSlide].cta}
                        </motion.button>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-colors"
                aria-label="Previous slide"
            >
                <ChevronLeft className="h-6 w-6 text-white" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-white/20 hover:bg-white/30 backdrop-blur-sm p-3 rounded-full transition-colors"
                aria-label="Next slide"
            >
                <ChevronRight className="h-6 w-6 text-white" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-2">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`h-2 rounded-full transition-all ${index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/50"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
