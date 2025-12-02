"use client";

import { motion } from "framer-motion";

export function Marquee({ text }: { text: string }) {
    return (
        <div className="bg-primary text-black py-2 overflow-hidden whitespace-nowrap border-y border-black">
            <motion.div
                className="inline-block"
                animate={{ x: [0, -1000] }}
                transition={{
                    repeat: Infinity,
                    ease: "linear",
                    duration: 20,
                }}
            >
                {[...Array(10)].map((_, i) => (
                    <span key={i} className="text-sm font-black uppercase tracking-widest mx-8">
                        {text}
                    </span>
                ))}
            </motion.div>
        </div>
    );
}
