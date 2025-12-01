"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Order } from "@flashfit/types";
import { Package, MapPin, CreditCard, User, Clock, Activity } from "lucide-react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";

interface OrderDetailsModalProps {
    order: any;
    isOpen: boolean;
    onClose: () => void;
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && order?.id) {
            const fetchLogs = async () => {
                try {
                    const q = query(collection(db, "orders", order.id, "logs"), orderBy("timestamp", "desc"));
                    const snapshot = await getDocs(q);
                    setLogs(snapshot.docs.map(doc => doc.data()));
                } catch (error) {
                    console.error("Error fetching logs:", error);
                }
            };
            fetchLogs();
        }
    }, [isOpen, order]);

    if (!order) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-neutral-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center justify-between">
                        <span>Order Details</span>
                        <Badge variant="outline" className="text-sm font-mono border-white/20">
                            #{order.id.slice(0, 8)}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Status & Date */}
                    <div className="flex items-center justify-between bg-zinc-800/50 p-4 rounded-xl border border-white/5">
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-300">
                                {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : 'Date unavailable'}
                            </span>
                        </div>
                        <Badge className={`capitalize ${order.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500'}`}>
                            {order.status.replace("_", " ")}
                        </Badge>
                    </div>

                    {/* Customer & Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <User className="h-4 w-4" /> Customer
                            </h3>
                            <div className="bg-zinc-800/30 p-3 rounded-lg border border-white/5">
                                <p className="font-bold">{order.shippingAddress?.name || "Guest"}</p>
                                <p className="text-sm text-gray-400">{order.shippingAddress?.phone}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                <MapPin className="h-4 w-4" /> Shipping Address
                            </h3>
                            <div className="bg-zinc-800/30 p-3 rounded-lg border border-white/5">
                                <p className="text-sm">{order.shippingAddress?.street}</p>
                                <p className="text-sm text-gray-400">
                                    {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Package className="h-4 w-4" /> Order Items
                        </h3>
                        <div className="space-y-2">
                            {order.items?.map((item: any, index: number) => (
                                <div key={index} className="flex items-center gap-4 bg-zinc-800/30 p-3 rounded-lg border border-white/5">
                                    <div className="h-12 w-12 bg-zinc-700 rounded-md overflow-hidden relative">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={item.image} alt={item.title} className="object-cover h-full w-full" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-sm line-clamp-1">{item.title}</p>
                                        <p className="text-xs text-gray-400">Qty: {item.quantity} • Size: {item.size || 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">₹{item.price * item.quantity}</p>
                                        {item.status === 'returned' && (
                                            <Badge variant="destructive" className="text-[10px] h-5 px-1.5 mt-1">Returned</Badge>
                                        )}
                                        {item.status === 'delivered' && (
                                            <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 text-[10px] h-5 px-1.5 mt-1">Delivered</Badge>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Activity Logs */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="h-4 w-4" /> Activity Logs
                        </h3>
                        <div className="bg-zinc-800/30 rounded-lg border border-white/5 p-4 max-h-40 overflow-y-auto space-y-3">
                            {logs.length > 0 ? (
                                logs.map((log, i) => (
                                    <div key={i} className="flex gap-3 text-sm">
                                        <div className="min-w-[120px] text-gray-500 text-xs">
                                            {log.timestamp?.toDate ? log.timestamp.toDate().toLocaleString() : 'Just now'}
                                        </div>
                                        <div>
                                            <p className="text-gray-300 font-medium capitalize">{log.status.replace("_", " ")}</p>
                                            {log.description && <p className="text-gray-500 text-xs">{log.description}</p>}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm text-center">No logs available</p>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-white/10" />

                    {/* Payment & Total */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <CreditCard className="h-4 w-4 text-gray-400" />
                                <span className="text-sm text-gray-300 capitalize">
                                    {order.paymentMethod || "Cash on Delivery"}
                                </span>
                                <Badge variant="outline" className={`ml-2 text-xs ${order.paymentStatus === 'paid' ? 'text-green-400 border-green-400/30' : 'text-yellow-400 border-yellow-400/30'}`}>
                                    {order.paymentStatus}
                                </Badge>
                            </div>
                            {order.paymentVerifiedBy && (
                                <p className="text-xs text-gray-500">
                                    Verified by {order.paymentVerifiedBy} on {order.paymentVerifiedAt?.toDate().toLocaleDateString()}
                                </p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-gray-400">Total Amount</p>
                            <p className="text-2xl font-bold text-primary">₹{order.totalAmount}</p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
