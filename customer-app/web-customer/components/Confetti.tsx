"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Confetti = ({ duration = 3000 }: { duration?: number }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(false), duration);
        return () => clearTimeout(timer);
    }, [duration]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {[...Array(50)].map((_, i) => (
                <motion.div
                    key={i}
                    initial={{ y: -20, x: Math.random() * window.innerWidth, rotate: 0 }}
                    animate={{ y: window.innerHeight + 20, rotate: 360 }}
                    transition={{ duration: Math.random() * 2 + 2, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
                    className="absolute w-3 h-3 rounded-sm"
                    style={{
                        backgroundColor: ['#22c55e', '#3b82f6', '#eab308', '#ef4444'][Math.floor(Math.random() * 4)],
                        left: 0
                    }}
                />
            ))}
        </div>
    );
};
