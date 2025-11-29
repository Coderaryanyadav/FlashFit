"use client";

import { useEffect, useState } from "react";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Calendar, Clock } from "lucide-react";

export default function HistoryPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            if (!u) setLoading(false);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        if (!user) return;

        const q = query(
            collection(db, "orders"),
            where("driverId", "==", user.uid)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
            // Client-side filtering to avoid composite index requirement
            const filteredOrders = allOrders.filter(order =>
                ["delivered", "returning", "warehouse_reached", "completed"].includes(order.status)
            ).sort((a, b) => {
                // Sort by updatedAt desc
                const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(0);
                const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(0);
                return dateB.getTime() - dateA.getTime();
            });

            setOrders(filteredOrders as any);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching history:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [user]);

    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white pb-24 px-4 pt-8">
            <h1 className="text-2xl font-bold mb-6">Delivery History</h1>
            {orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-50">
                    <p className="text-lg font-bold">No deliveries yet</p>
                    <p className="text-sm text-gray-500">Completed orders will appear here</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map((order: any) => (
                        <div key={order.id} className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <p className="font-bold text-white">{order.shippingAddress?.name || "Customer"}</p>
                                    <p className="text-xs text-gray-400 line-clamp-1">{order.shippingAddress?.street || "Address hidden"}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-green-400 font-bold block">₹{order.deliveryFee || 40}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">Earning</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-500 border-t border-white/5 pt-3">
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {order.updatedAt?.toDate ? order.updatedAt.toDate().toLocaleDateString() : "Unknown Date"}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {order.updatedAt?.toDate ? order.updatedAt.toDate().toLocaleTimeString() : "Unknown Time"}
                                </div>
                                <div className="ml-auto px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 uppercase text-[10px] font-bold">
                                    {order.status.replace('_', ' ')}
                                </div>
                            </div>

                            {order.items && order.items.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
                                    {order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-xs">
                                            <span className="text-gray-300">{item.title} <span className="text-gray-500">x{item.quantity}</span></span>
                                            <span className={`font-medium ${item.status === 'returned' ? 'text-yellow-500' : 'text-green-500'}`}>
                                                {item.status === 'returned' ? 'Returned' : 'Delivered'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
