"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import Image from "next/image";

export function NewsletterPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        // Check if already subscribed or dismissed
        const hasSeenPopup = localStorage.getItem("flashfit_newsletter_seen");
        if (hasSeenPopup) return;

        // Show after 5 seconds
        const timer = setTimeout(() => {
            setIsOpen(true);
        }, 5000);

        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem("flashfit_newsletter_seen", "true");
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Here you would call your API
        setSubmitted(true);
        setTimeout(() => {
            handleClose();
        }, 2000);
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[800px] p-0 bg-black border-zinc-800 text-white overflow-hidden gap-0">
                <div className="grid md:grid-cols-2">
                    <div className="relative h-64 md:h-auto bg-zinc-900">
                        <Image
                            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80"
                            alt="Newsletter"
                            fill
                            className="object-cover opacity-80"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:bg-gradient-to-r" />
                    </div>

                    <div className="p-8 flex flex-col justify-center relative">
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {!submitted ? (
                            <>
                                <h2 className="text-3xl font-black italic mb-2">JOIN THE CLUB</h2>
                                <p className="text-gray-400 mb-6">
                                    Get <span className="text-primary font-bold">10% OFF</span> your first order and early access to new drops.
                                </p>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="bg-zinc-900 border-zinc-700 text-white placeholder:text-gray-500"
                                    />
                                    <Button
                                        type="submit"
                                        className="w-full font-bold bg-white text-black hover:bg-gray-200"
                                    >
                                        UNLOCK 10% OFF
                                    </Button>
                                </form>
                                <p className="text-xs text-gray-500 mt-4 text-center">
                                    No spam, just drops. Unsubscribe anytime.
                                </p>
                            </>
                        ) : (
                            <div className="text-center py-10">
                                <h3 className="text-2xl font-bold text-green-500 mb-2">You&apos;re on the list!</h3>
                                <p className="text-gray-400">Check your email for your discount code.</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
