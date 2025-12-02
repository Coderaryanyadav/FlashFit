"use client";

import { useState, useEffect } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/utils/firebase";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get("redirect") || "/";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (!isLogin && !name) {
            toast.error("Please enter your name");
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
                toast.success("Welcome back!");
                router.push(redirect);
            } else {
                const cred = await createUserWithEmailAndPassword(auth, email, password);
                await updateProfile(cred.user, { displayName: name });

                await setDoc(doc(db, "users", cred.user.uid), {
                    uid: cred.user.uid,
                    email: email,
                    displayName: name,
                    createdAt: serverTimestamp(),
                    role: "customer",
                    totalOrders: 0,
                });

                toast.success("Account created successfully!");
                router.push(redirect);
            }
        } catch (err: any) {
            const errorMessage = err.code === "auth/user-not-found" ? "No account found with this email" :
                err.code === "auth/wrong-password" ? "Incorrect password" :
                    err.code === "auth/email-already-in-use" ? "Email already in use" :
                        err.code === "auth/invalid-email" ? "Invalid email address" :
                            "Authentication failed. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_50%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem]" />

            {/* Back Button */}
            <Link
                href="/"
                className="absolute top-6 left-6 z-50 p-3 rounded-full bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 transition-all group"
            >
                <ArrowLeft className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            </Link>

            {/* Main Content */}
            <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <h1 className="text-5xl font-black italic tracking-tighter text-white mb-2">
                            FLASHFIT
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {isLogin ? "Welcome back to the future of fashion" : "Join the streetwear revolution"}
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-neutral-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-white mb-1">
                                {isLogin ? "Sign In" : "Create Account"}
                            </h2>
                            <p className="text-gray-500 text-sm">
                                {isLogin ? "Enter your credentials to continue" : "Fill in your details to get started"}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {!isLogin && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">Full Name</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                        className="bg-neutral-800 border-white/10 text-white placeholder:text-gray-600 h-12 focus:border-primary focus:ring-1 focus:ring-primary"
                                    />
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Email Address</label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="bg-neutral-800 border-white/10 text-white placeholder:text-gray-600 h-12 focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Password</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="bg-neutral-800 border-white/10 text-white placeholder:text-gray-600 h-12 focus:border-primary focus:ring-1 focus:ring-primary"
                                />
                                {!isLogin && (
                                    <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 text-base rounded-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin h-5 w-5" />
                                ) : (
                                    isLogin ? "Sign In" : "Create Account"
                                )}
                            </Button>
                        </form>

                        {/* Toggle */}
                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-400">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-primary font-bold hover:underline"
                                >
                                    {isLogin ? "Sign Up" : "Sign In"}
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center text-xs text-gray-600 mt-6">
                        By continuing, you agree to FlashFit's{" "}
                        <Link href="/terms" className="text-gray-400 hover:text-white underline">
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-gray-400 hover:text-white underline">
                            Privacy Policy
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
