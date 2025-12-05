"use client";

import { Header } from "@/components/Header";
import { Button } from "@/shared/ui/button";
import { ArrowRight, RefreshCw, AlertTriangle } from "lucide-react";

export default function ReturnsPage() {
    return (
        <div className="min-h-screen bg-black text-white">
            <Header />
            <div className="container mx-auto px-4 pt-32 pb-20">
                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h1 className="text-4xl font-black mb-4">Returns & Exchanges</h1>
                    <p className="text-gray-400">Hassle-free returns at your doorstep.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mb-6">
                            <RefreshCw className="h-6 w-6 text-purple-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Instant Exchange</h3>
                        <p className="text-gray-400 mb-6">
                            Size didn&apos;t fit? No worries. Request an exchange, and our delivery partner will bring the new size and pick up the old one instantly.
                        </p>
                        <Button className="w-full bg-purple-600 hover:bg-purple-700">Request Exchange</Button>
                    </div>

                    <div className="bg-zinc-900 p-8 rounded-2xl border border-zinc-800">
                        <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="h-6 w-6 text-red-400" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4">Report Issue</h3>
                        <p className="text-gray-400 mb-6">
                            Received a damaged or wrong item? Report it within 2 hours of delivery for a full refund or replacement.
                        </p>
                        <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800 text-white">Report Problem</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
