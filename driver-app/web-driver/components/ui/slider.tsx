// components/ui/slider.tsx
"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
    value: number[];
    onValueChange: (value: number[]) => void;
    max?: number;
    step?: number;
}

export function Slider({ className, value, onValueChange, max = 100, step = 1, ...props }: SliderProps) {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onValueChange([parseInt(e.target.value, 10)]);
    };

    return (
        <div className={cn("relative flex w-full touch-none select-none items-center", className)}>
            <input
                type="range"
                min={0}
                max={max}
                step={step}
                value={value[0]}
                onChange={handleChange}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                {...props}
            />
        </div>
    );
}
