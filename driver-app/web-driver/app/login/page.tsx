"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Truck } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        // Force clear fields to prevent autofill confusion
        setEmail("");
        setPassword("");
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/");
        } catch (err: any) {
            setError(err.message || "Failed to login");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="max-w-md w-full bg-neutral-900 p-8 rounded-2xl shadow-2xl border border-white/10">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
                        <Truck className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">FlashFit Driver</h1>
                    <p className="text-gray-400 mt-2">Sign in to start delivering</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-neutral-800 border-white/10 text-white h-12"
                            placeholder="Enter the email"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Password</label>
                        <Input
                            type="password"
                            autoComplete="new-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter the password"
                            className="bg-neutral-800 border-white/10 text-white h-12"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-white hover:bg-gray-200 text-black font-bold h-12 text-lg transition-all hover:scale-[1.02]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </Button>
                </form>

                <p className="text-center text-gray-500 text-sm mt-6">
                    Don&apos;t have an account? Contact admin
                </p>
            </div>

            {loading && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center animate-in fade-in duration-200">
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 text-white animate-spin" />
                        <p className="text-white font-bold text-lg">Signing in...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
