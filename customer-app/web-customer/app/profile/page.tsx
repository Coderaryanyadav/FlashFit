"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Package, Heart, MapPin, LogOut, User, Settings, HelpCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (!u) {
                router.push("/");
            } else {
                setUser(u);
            }
            setLoading(false);
        });
        return () => unsub();
    }, [router]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/");
    };

    if (loading) return null;

    if (!user) return null;

    const menuItems = [
        { icon: Package, label: "My Orders", href: "/orders", desc: "Track, return, or buy again" },
        { icon: Heart, label: "Wishlist", href: "/wishlist", desc: "Your favorite items" },
        { icon: MapPin, label: "Saved Addresses", href: "/profile/addresses", desc: "Manage delivery locations" },
        { icon: HelpCircle, label: "Help Center", href: "/help", desc: "FAQs and support" },
        { icon: Settings, label: "Settings", href: "/profile/settings", desc: "Notifications and password" },
    ];

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Header />

            <div className="container mx-auto px-4 pt-24 max-w-2xl">
                <h1 className="text-3xl font-black italic mb-8">MY ACCOUNT</h1>

                {/* Profile Card */}
                <div className="bg-zinc-900 rounded-2xl p-6 flex items-center gap-4 mb-8 border border-white/10">
                    <div className="h-20 w-20 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden border-2 border-white/10">
                        {user.photoURL ? (
                            <Image src={user.photoURL} alt={user.displayName} width={80} height={80} className="object-cover" />
                        ) : (
                            <User className="h-10 w-10 text-gray-500" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">{user.displayName || "FlashFit Member"}</h2>
                        <p className="text-gray-400">{user.email}</p>
                        <div className="mt-2 inline-flex items-center px-2 py-1 bg-yellow-500/10 text-yellow-500 text-xs font-bold rounded-full border border-yellow-500/20">
                            GOLD MEMBER
                        </div>
                    </div>
                </div>

                {/* Menu Grid */}
                <div className="grid gap-4">
                    {menuItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center justify-between p-4 bg-zinc-900/50 border border-white/5 rounded-xl hover:bg-zinc-900 hover:border-white/20 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center group-hover:bg-white group-hover:text-black transition-colors">
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">{item.label}</p>
                                    <p className="text-xs text-gray-500">{item.desc}</p>
                                </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
                        </Link>
                    ))}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="mt-8 w-full p-4 flex items-center justify-center gap-2 text-red-500 font-bold hover:bg-red-500/10 rounded-xl transition-colors"
                >
                    <LogOut className="h-5 w-5" />
                    Sign Out
                </button>

                <p className="text-center text-xs text-gray-600 mt-8">
                    Version 1.0.0 • FlashFit Inc.
                </p>
            </div>
        </div>
    );
}
