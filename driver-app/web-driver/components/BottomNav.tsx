"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Clock, User } from "lucide-react";

export function BottomNav() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    if (pathname === '/login') return null;

    return (

        <div className="fixed bottom-0 inset-x-0 z-50 pb-safe">
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/10" />

            <div className="relative grid grid-cols-3 items-center max-w-md mx-auto h-20 px-6">
                <Link href="/" className="relative flex flex-col items-center gap-1 group">
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive('/') ? 'bg-green-500/20 text-green-500' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                        <Home className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive('/') ? 'text-green-500' : 'text-zinc-600'}`}>
                        Home
                    </span>
                    {isActive('/') && (
                        <div className="absolute -top-1 h-1 w-8 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                    )}
                </Link>

                <Link href="/history" className="relative flex flex-col items-center gap-1 group">
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive('/history') ? 'bg-green-500/20 text-green-500' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                        <Clock className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive('/history') ? 'text-green-500' : 'text-zinc-600'}`}>
                        History
                    </span>
                    {isActive('/history') && (
                        <div className="absolute -top-1 h-1 w-8 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                    )}
                </Link>

                <Link href="/profile" className="relative flex flex-col items-center gap-1 group">
                    <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive('/profile') ? 'bg-green-500/20 text-green-500' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                        <User className="h-6 w-6" />
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive('/profile') ? 'text-green-500' : 'text-zinc-600'}`}>
                        Profile
                    </span>
                    {isActive('/profile') && (
                        <div className="absolute -top-1 h-1 w-8 bg-green-500 rounded-full shadow-[0_0_10px_#22c55e]" />
                    )}
                </Link>
            </div>
        </div>
    );

}
