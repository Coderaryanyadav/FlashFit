"use client";

import { useState } from "react";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/utils/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Input validation
        if (!email || !password) {
            toast.error("Please fill in all fields");
            return;
        }

        if (password.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!isLogin && !strongPasswordRegex.test(password)) {
            toast.error("Password must contain uppercase, lowercase, number and special character");
            return;
        }

        if (!isLogin && !name) {
            toast.error("Please enter your name");
            return;
        }

        setLoading(true);

        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                toast.success("Welcome back!");

                // Sync cart
                const { useCartStore } = await import("@/store/useCartStore");
                useCartStore.getState().syncCart(userCredential.user.uid);
            } else {
                const cred = await createUserWithEmailAndPassword(auth, email, password);

                try {
                    await updateProfile(cred.user, { displayName: name });
                    await sendEmailVerification(cred.user);

                    // Create user document in Firestore
                    await setDoc(doc(db, "users", cred.user.uid), {
                        uid: cred.user.uid,
                        email: email,
                        displayName: name,
                        createdAt: serverTimestamp(),
                        role: "customer",
                        totalOrders: 0,
                        emailVerified: false
                    });

                    toast.success("Account created! Please check your email to verify.");
                } catch (firestoreError) {
                    console.error("Firestore Error:", firestoreError);
                    // Optional: Delete auth user if firestore fails to maintain consistency
                    // await deleteUser(cred.user); 
                    toast.error("Account created but profile setup failed. Please contact support.");
                }
            }
            onClose();
            // Reset form
            setEmail("");
            setPassword("");
            setName("");
        } catch (err: any) {
            console.error("Auth error:", err);
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
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-black border-white/10 text-white">
                <div className="relative h-full w-full">
                    {/* Background Image */}
                    <div className="absolute inset-0 z-0 opacity-40">
                        <Image
                            src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80"
                            alt="Fashion Background"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                    </div>

                    <div className="relative z-10 p-6">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-center text-3xl font-black italic tracking-tighter text-white">
                                {isLogin ? "WELCOME BACK" : "JOIN FLASHFIT"}
                            </DialogTitle>
                            <p className="text-center text-gray-400 text-sm">
                                {isLogin ? "Your style awaits" : "Unlock exclusive streetwear drops"}
                            </p>
                        </DialogHeader>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Name</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="John Doe"
                                        required
                                        className="bg-white/10 border-white/10 text-white placeholder:text-gray-600 focus:border-white/30 focus:ring-0"
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Address</label>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="bg-white/10 border-white/10 text-white placeholder:text-gray-600 focus:border-white/30 focus:ring-0"
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="bg-white/10 border-white/10 text-white placeholder:text-gray-600 focus:border-white/30 focus:ring-0"
                                />
                            </div>

                            <Button type="submit" className="w-full bg-white text-black hover:bg-gray-200 font-black h-12 text-lg uppercase tracking-wide transition-transform hover:scale-[1.02]" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : (isLogin ? "Sign In" : "Create Account")}
                            </Button>

                            <div className="text-center text-sm text-gray-400 mt-4">
                                {isLogin ? "New to FlashFit? " : "Already have an account? "}
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-white font-bold hover:underline"
                                >
                                    {isLogin ? "Create Account" : "Sign In"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
