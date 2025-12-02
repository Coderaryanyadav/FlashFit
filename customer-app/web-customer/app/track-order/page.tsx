"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Package } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TrackOrderPage() {
    const [orderId, setOrderId] = useState("");
    const router = useRouter();

    const handleTrack = (e: React.FormEvent) => {
        e.preventDefault();
        if (orderId.trim()) {
            router.push(`/order/${orderId.trim()}`);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Header />
            <div className="container mx-auto px-4 pt-32 max-w-xl text-center">
                <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/10">
                    <Package className="h-10 w-10 text-white" />
                </div>
                <h1 className="text-4xl font-black italic mb-4">TRACK YOUR ORDER</h1>
                <p className="text-gray-400 mb-8">Enter your Order ID to see the current status.</p>

                <form onSubmit={handleTrack} className="flex gap-2">
                    <Input
                        placeholder="Order ID (e.g. ORD-12345)"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="bg-zinc-900 border-zinc-800 text-white h-12"
                    />
                    <Button type="submit" className="h-12 px-8 bg-white text-black font-bold hover:bg-gray-200">
                        Track
                    </Button>
                </form>
            </div>
        </div>
    );
}
