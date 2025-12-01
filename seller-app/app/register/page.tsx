"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/utils/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Store } from "lucide-react";
import Link from "next/link";
import { SellerProfile } from "@flashfit/types";

export default function SellerRegisterPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        fullName: "",
        storeName: "",
        phone: ""
    });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Create Auth User
            const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            const user = userCredential.user;

            // 2. Create Seller Profile
            const sellerProfile: SellerProfile = {
                uid: user.uid,
                email: user.email!,
                displayName: formData.fullName,
                phoneNumber: formData.phone,
                role: 'admin', // Using 'admin' role for now as sellers are admins of their store
                storeName: formData.storeName,
                isVerified: false, // Requires admin approval in real app
                createdAt: new Date(),
                totalSales: 0,
                rating: 0
            };

            // Save to 'sellers' collection (or 'users' with role)
            // For MVP, we'll use 'users' collection to keep it simple with existing auth rules if any
            // But logically it should be in 'sellers' or 'users' with custom claims.
            // Let's put it in 'users' for now to match other apps, but also 'sellers' for store info?
            // Let's stick to 'users' for auth profile and maybe 'sellers' for public store info.
            // For simplicity in this refactor, I'll put everything in 'users' doc for now.

            await setDoc(doc(db, "users", user.uid), {
                ...sellerProfile,
                createdAt: serverTimestamp()
            });

            router.push("/");
        } catch (error: any) {
            console.error("Registration error:", error);
            alert(error.message || "Failed to register");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-black px-4">
            <div className="max-w-md w-full bg-neutral-900 p-8 rounded-2xl shadow-2xl border border-white/10">
                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-6">
                        <Store className="h-8 w-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">Join as Seller</h1>
                    <p className="text-gray-400 mt-2">Start your business on FlashFit</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4" autoComplete="off">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Full Name</label>
                        <Input
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            required
                            placeholder="John Doe"
                            className="bg-neutral-800 border-white/10 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Store Name</label>
                        <Input
                            value={formData.storeName}
                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                            required
                            placeholder="My Awesome Store"
                            className="bg-neutral-800 border-white/10 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Email</label>
                        <Input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            placeholder="store@example.com"
                            className="bg-neutral-800 border-white/10 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Password</label>
                        <Input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            placeholder="******"
                            className="bg-neutral-800 border-white/10 text-white"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1 text-gray-300">Phone</label>
                        <Input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            required
                            placeholder="9876543210"
                            className="bg-neutral-800 border-white/10 text-white"
                        />
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 text-lg mt-4" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin h-5 w-5" /> : "Create Seller Account"}
                    </Button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-400 text-sm">
                        Already have an account?{" "}
                        <Link href="/login" className="text-primary hover:underline font-bold">
                            Login here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
