"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db, auth } from "@/utils/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { User, LogOut, Star, TrendingUp, Package } from "lucide-react";
import Image from "next/image";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState<any>({});
    const router = useRouter();

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            if (u) {
                setUser(u);
            } else {
                router.push("/login");
            }
        });
        return () => unsub();
    }, [router]);

    useEffect(() => {
        if (!user) return;
        const unsub = onSnapshot(doc(db, "drivers", user.uid), async (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                setStats(data);

                // Check for daily/monthly reset
                const lastUpdate = data.lastEarningsUpdate?.toDate() || new Date(0);
                const now = new Date();

                const isSameDay = lastUpdate.getDate() === now.getDate() &&
                    lastUpdate.getMonth() === now.getMonth() &&
                    lastUpdate.getFullYear() === now.getFullYear();

                const isSameMonth = lastUpdate.getMonth() === now.getMonth() &&
                    lastUpdate.getFullYear() === now.getFullYear();

                if (!isSameDay || !isSameMonth) {
                    const updates: any = {
                        lastEarningsUpdate: now
                    };

                    if (!isSameDay) updates.dailyEarnings = 0;
                    if (!isSameMonth) updates.monthlyEarnings = 0;

                    try {
                        await updateDoc(doc(db, "drivers", user.uid), updates);
                        console.log("Reset earnings stats:", updates);
                    } catch (e) {
                        console.error("Error resetting earnings:", e);
                    }
                }
            }
        });
        return () => unsub();
    }, [user]);

    const handleLogout = async () => {
        await signOut(auth);
        router.push("/login");
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-black text-white pb-24 px-4 pt-8">
            <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                    <div className="h-24 w-24 bg-zinc-800 rounded-full flex items-center justify-center border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)] overflow-hidden">
                        {stats.photoURL ? (
                            <Image src={stats.photoURL} alt="Profile" fill className="object-cover" />
                        ) : (
                            <User className="h-12 w-12 text-gray-400" />
                        )}
                    </div>
                    <button
                        onClick={() => {
                            const input = document.createElement('input');
                            input.type = 'file';
                            input.accept = 'image/*';
                            input.onchange = async (e: any) => {
                                const file = e.target.files[0];
                                if (file) {
                                    if (file.size > 500 * 1024) { // 500KB limit
                                        alert("File size too large. Please choose an image under 500KB.");
                                        return;
                                    }
                                    const reader = new FileReader();
                                    reader.onloadend = async () => {
                                        const base64String = reader.result as string;
                                        try {
                                            await updateDoc(doc(db, "drivers", user.uid), {
                                                photoURL: base64String
                                            });
                                        } catch (error) {
                                            console.error("Error updating profile picture:", error);
                                            alert("Failed to update profile picture");
                                        }
                                    };
                                    reader.readAsDataURL(file);
                                }
                            };
                            input.click();
                        }}
                        className="absolute bottom-0 right-0 h-8 w-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <User className="h-4 w-4 text-black" />
                    </button>
                </div>
                <h1 className="text-2xl font-bold mt-4">{user.displayName || "Driver"}</h1>
                <p className="text-gray-500">{user.email}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-8">
                <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Today</span>
                    <p className="text-xl font-bold text-green-400">₹{stats.dailyEarnings || 0}</p>
                </div>
                <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Month</span>
                    <p className="text-xl font-bold text-green-400">₹{stats.monthlyEarnings || 0}</p>
                </div>
                <div className="bg-zinc-900 p-3 rounded-2xl border border-zinc-800 flex flex-col items-center text-center">
                    <span className="text-[10px] uppercase font-bold text-gray-500">Total</span>
                    <p className="text-xl font-bold text-white">₹{stats.totalEarnings || 0}</p>
                </div>
            </div>

            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-4">
                <div className="flex items-center gap-2 mb-2 text-gray-400">
                    <Package className="h-4 w-4" />
                    <span className="text-xs uppercase font-bold">Total Deliveries</span>
                </div>
                <p className="text-2xl font-bold text-white">{stats.totalDeliveries || 0}</p>
            </div>

            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 mb-8">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                            <Star className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div>
                            <p className="font-bold">Rating</p>
                            <p className="text-xs text-gray-500">Based on customer feedback</p>
                        </div>
                    </div>
                    <p className="text-2xl font-bold text-white">{stats.rating?.toFixed(1) || "0.0"}</p>
                </div>
                <div className="flex gap-1 justify-center mt-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                            key={star}
                            className={`h-6 w-6 ${(stats.rating || 0) >= star
                                ? "fill-yellow-500 text-yellow-500"
                                : (stats.rating || 0) >= star - 0.5
                                    ? "fill-yellow-500/50 text-yellow-500"
                                    : "text-zinc-700"
                                }`}
                        />
                    ))}
                </div>
            </div>

            <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full h-14 text-lg font-bold rounded-xl"
            >
                <LogOut className="mr-2 h-5 w-5" /> Logout
            </Button>
        </div>
    );
}
