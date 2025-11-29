"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db, functions } from "@/utils/firebase";
import { doc, updateDoc, serverTimestamp, setDoc, onSnapshot, collection, query, where, increment, runTransaction } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { Button } from "@/components/ui/button";
import { Power, Navigation, MapPin, Phone, IndianRupee, Package, Clock, CheckCircle, Loader2, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { useDriverWorkflow } from "@/hooks/useDriverWorkflow";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";

export default function DriverHomePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(false);
    const [availableOrders, setAvailableOrders] = useState<any[]>([]);
    const [stats, setStats] = useState<{
        earnings: number;
        deliveries: number;
        onlineSince: Date | null;
        todayOnlineMinutes: number;
    }>({ earnings: 0, deliveries: 0, onlineSince: null, todayOnlineMinutes: 0 });
    const [currentOnlineMinutes, setCurrentOnlineMinutes] = useState(0);

    // Delivery Confirmation State
    const [showDeliveryModal, setShowDeliveryModal] = useState(false);
    const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
    const [isSubmittingDelivery, setIsSubmittingDelivery] = useState(false);
    const [showItems, setShowItems] = useState(false);
    const [otp, setOtp] = useState("");

    const router = useRouter();

    const { activeOrder, updateStatus } = useDriverWorkflow(user);

    // Haptic Feedback
    const vibrate = (pattern: number | number[] = 10) => {
        if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(pattern);
        }
    };

    // Auth Check
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                router.push('/login');
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [router]);

    // Sync driver status and stats from Firestore
    useEffect(() => {
        if (!user) return;

        const driverRef = doc(db, "drivers", user.uid);
        const unsubDriver = onSnapshot(driverRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                console.log("Driver data from Firestore:", data); // Debug log
                setIsOnline(data.isOnline === true); // Explicit boolean check
                setStats({
                    earnings: data.totalEarnings || 0,
                    deliveries: data.totalDeliveries || 0,
                    onlineSince: data.onlineSince?.toDate() || null,
                    todayOnlineMinutes: data.todayOnlineMinutes || 0
                });
            } else {
                console.log("Driver document does not exist"); // Debug log
            }
        }, (error) => {
            console.error("Error syncing driver status:", error);
        });

        return () => unsubDriver();
    }, [user]);

    // Timer to update current session minutes
    useEffect(() => {
        if (!isOnline || !stats.onlineSince) {
            setCurrentOnlineMinutes(0);
            return;
        }

        const updateTimer = () => {
            const diff = (new Date().getTime() - stats.onlineSince!.getTime()) / 1000 / 60;
            setCurrentOnlineMinutes(diff);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 60000); // Update every minute
        return () => clearInterval(interval);
    }, [isOnline, stats.onlineSince]);

    // Online/Offline Toggle
    const toggleOnlineStatus = async () => {
        if (!user) return;
        vibrate(50);
        const newStatus = !isOnline;
        console.log("Toggling online status from", isOnline, "to", newStatus); // Debug log

        try {
            const updates: any = {
                isOnline: newStatus,
                status: newStatus ? 'online' : 'offline',
                lastSeen: serverTimestamp()
            };

            if (newStatus) {
                updates.onlineSince = serverTimestamp();
            } else {
                // Going offline: calculate and add session time
                if (stats.onlineSince) {
                    const diff = (new Date().getTime() - stats.onlineSince.getTime()) / 1000 / 60;
                    updates.todayOnlineMinutes = increment(diff);
                    updates.onlineSince = null;
                }
            }

            console.log("Updating driver document with:", updates); // Debug log
            await updateDoc(doc(db, "drivers", user.uid), updates);
            console.log("Driver document updated successfully"); // Debug log

            // Get and update location when going online
            if (newStatus && navigator.geolocation) {
                // ... (keep existing location logic)
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        await setDoc(doc(db, "driverLocations", user.uid), {
                            driverId: user.uid,
                            driverName: user.displayName || user.email || 'Driver',
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude,
                            status: 'online',
                            lastUpdated: serverTimestamp()
                        }, { merge: true });
                    },
                    (error) => {
                        console.error("Location error:", error);
                        alert("Please enable location access to go online");
                    }
                );
            } else if (!newStatus) {
                // Update to offline
                await setDoc(doc(db, "driverLocations", user.uid), {
                    status: 'offline',
                    lastUpdated: serverTimestamp()
                }, { merge: true });
            }

        } catch (error) {
            console.error("Error toggling status:", error);
            alert("Failed to update status. Please try again.");
        }
    };

    // Update location every 10 seconds when online
    useEffect(() => {
        if (!isOnline || !user) return;

        const updateLocation = () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            await setDoc(doc(db, "driverLocations", user.uid), {
                                driverId: user.uid,
                                driverName: user.displayName || user.email || 'Driver',
                                latitude: position.coords.latitude,
                                longitude: position.coords.longitude,
                                status: 'online',
                                lastUpdated: serverTimestamp()
                            }, { merge: true });
                        } catch (error) {
                            console.error("Error updating location:", error);
                        }
                    },
                    (error) => console.error("Location error:", error)
                );
            }
        };

        // Update immediately
        updateLocation();

        // Then update every 10 seconds
        const interval = setInterval(updateLocation, 10000);

        return () => clearInterval(interval);
    }, [isOnline, user]);

    // Fetch Orders when Online
    useEffect(() => {
        if (!isOnline || !user) {
            setAvailableOrders([]);
            return;
        }

        const q = query(
            collection(db, "orders"),
            where("status", "in", ["placed", "pending", "confirmed"])
        );

        const unsub = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            // Simple distance filter mock (accept all for now to ensure visibility)
            setAvailableOrders(orders);
            if (orders.length > availableOrders.length) vibrate([50, 50, 50]);
        });

        return () => unsub();
    }, [isOnline, user]);

    const handleAcceptOrder = async (order: any) => {
        if (!user) return;
        vibrate(20);
        try {
            // Local implementation to avoid dependency mismatch
            const orderRef = doc(db, "orders", order.id);
            await runTransaction(db, async (transaction) => {
                const orderDoc = await transaction.get(orderRef);
                if (!orderDoc.exists()) throw "Order does not exist!";

                const data = orderDoc.data();
                if (data.status !== "placed" && data.status !== "pending" && data.status !== "confirmed") {
                    throw "Order is no longer available.";
                }

                // Get driver profile to save phone number
                const driverProfileRef = doc(db, "drivers", user.uid);
                const driverProfileDoc = await transaction.get(driverProfileRef);
                const driverData = driverProfileDoc.exists() ? driverProfileDoc.data() : {};

                transaction.update(orderRef, {
                    status: "assigned",
                    driverId: user.uid,
                    driverName: user.displayName || "Driver",
                    driverPhone: driverData.phone || user.phoneNumber || "",
                    updatedAt: serverTimestamp()
                });
            });

            // setActiveOrder handled by listener
            setAvailableOrders(prev => prev.filter(o => o.id !== order.id));
            vibrate([50, 100, 50]);
        } catch (error: any) {
            console.error("Error accepting order:", error);
            alert("Failed: " + (error.message || error));
        }
    };

    const handleStatusUpdate = async (newStatus: string) => {
        if (!activeOrder || !user) return;
        vibrate(20);
        try {
            await updateStatus(newStatus);
            vibrate(50);
        } catch (error) {
            console.error(`Error updating status to ${newStatus}:`, error);
            alert("Failed to update status.");
        }
    };

    const handleDeliveryComplete = () => {
        if (!activeOrder?.items) {
            // Fallback if no items
            handleStatusUpdate('delivered');
            return;
        }
        // Initialize selected items with all items
        setSelectedItemIds(activeOrder.items.map((item: any) => item.id || item.productId));
        setShowDeliveryModal(true);
    };

    const confirmDelivery = async () => {
        if (!activeOrder || !user) return;

        setIsSubmittingDelivery(true);
        vibrate(20);

        try {
            const completeOrderFn = httpsCallable(functions, 'completeOrder');
            await completeOrderFn({
                orderId: activeOrder.id,
                // otp: otp, // Removed
                deliveredItemIds: selectedItemIds
            });

            setShowDeliveryModal(false);
            // setOtp(""); // Removed
            vibrate([100, 50, 100]);
        } catch (error: any) {
            console.error("Error confirming delivery:", error);
            alert(`Failed to confirm delivery: ${error.message}`);
        } finally {
            setIsSubmittingDelivery(false);
        }
    };

    const getActionButton = () => {
        if (!activeOrder) return null;
        switch (activeOrder.status) {
            case 'assigned':
                return { label: 'Pick Up Order', action: () => handleStatusUpdate('picked_up'), disabled: false, style: 'bg-white text-black hover:bg-gray-200' };
            case 'picked_up':
                return { label: 'Complete Delivery', action: () => handleDeliveryComplete(), disabled: false, style: 'bg-green-500 text-white hover:bg-green-600' };
            case 'delivered':
                return { label: 'Return to Warehouse', action: () => handleStatusUpdate('returning'), disabled: false, style: 'bg-yellow-500 text-black hover:bg-yellow-600' };
            case 'returning':
                return { label: 'Check In at Warehouse', action: () => handleStatusUpdate('warehouse_reached'), disabled: false, style: 'bg-blue-500 text-white hover:bg-blue-600' };
            case 'warehouse_reached':
                return { label: 'Waiting for Approval', action: () => { }, disabled: true, style: 'bg-zinc-700 text-zinc-400 cursor-not-allowed' };
            default:
                return { label: 'Unknown Status', action: () => { }, disabled: true, style: 'bg-gray-500' };
        }
    };

    const actionBtn = getActionButton();

    const openMap = (lat: number, lng: number) => {
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-black text-white flex-col gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-green-500" />
            <p className="text-gray-400 animate-pulse font-medium">Loading Driver App...</p>
        </div>
    );
    if (!user) return null;

    return (
        <div className="min-h-screen bg-black text-white pb-24 font-sans selection:bg-green-500 selection:text-black">
            {/* Header */}
            <header className="fixed top-0 inset-x-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 p-4">
                <div className="flex items-center justify-between max-w-md mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-zinc-900 border border-zinc-700 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            <span className="text-white font-black text-lg">D</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-none">FlashFit Driver</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <div className={`h-2 w-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" : "bg-red-500"}`} />
                                <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{isOnline ? "Online" : "Offline"}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-900 rounded-full px-4 py-2 border border-zinc-800">
                        <IndianRupee className="h-4 w-4 text-green-400" />
                        <span className="text-sm font-bold">{stats.earnings}</span>
                    </div>
                </div>
            </header>

            <main className="pt-32 px-4 max-w-md mx-auto">
                {!isOnline ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 space-y-8"
                    >
                        <div className="relative group cursor-pointer" onClick={toggleOnlineStatus}>
                            <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full group-hover:bg-green-500/30 transition-all duration-500 animate-pulse" />
                            <div className="relative h-44 w-44 rounded-full bg-white text-black flex flex-col items-center justify-center gap-2 shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-105 transition-transform duration-300 border-4 border-green-500/10">
                                <Power className="h-14 w-14 text-green-600" />
                                <span className="font-black text-2xl tracking-tight">GO ONLINE</span>
                            </div>
                        </div>
                        <p className="text-gray-400 text-center max-w-xs text-lg">Tap to start receiving delivery requests in your area.</p>
                    </motion.div>
                ) : (
                    <div className="space-y-6">
                        {/* Stats Cards */}
                        {!activeOrder && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl hover:bg-zinc-900 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center mb-3">
                                        <Package className="h-5 w-5 text-blue-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Deliveries</p>
                                    <p className="text-3xl font-bold mt-1 text-white">{stats.deliveries}</p>
                                </div>
                                <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-3xl hover:bg-zinc-900 transition-colors">
                                    <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center mb-3">
                                        <Clock className="h-5 w-5 text-purple-400" />
                                    </div>
                                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Online Hours</p>
                                    <p className="text-3xl font-bold mt-1 text-white">
                                        {((stats.todayOnlineMinutes + currentOnlineMinutes) / 60).toFixed(1)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* GO OFFLINE Button (when online but no active order) */}
                        {!activeOrder && (
                            <button
                                onClick={toggleOnlineStatus}
                                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Power className="h-5 w-5" />
                                GO OFFLINE
                            </button>
                        )}

                        {/* Active Order */}
                        <AnimatePresence mode="wait">
                            {activeOrder ? (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="bg-zinc-900 border-2 border-green-500/50 rounded-[2rem] overflow-hidden shadow-[0_0_60px_rgba(34,197,94,0.3)] relative"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-b from-green-500/10 to-transparent pointer-events-none" />
                                    {/* ... Active Order Content (Keep as is) ... */}
                                    <div className="bg-green-600 px-6 py-4 flex items-center justify-between">
                                        <span className="font-bold text-white flex items-center gap-2">
                                            <Navigation className="h-5 w-5" /> Current Delivery
                                        </span>
                                        <span className="text-xs font-bold bg-black/20 px-3 py-1 rounded-full text-white backdrop-blur-sm">
                                            EST. 15 MIN
                                        </span>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="flex items-start gap-4">
                                            <div className="h-14 w-14 rounded-2xl bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-700">
                                                <MapPin className="h-7 w-7 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-1">{activeOrder.shippingAddress?.name || "Customer"}</h3>
                                                <p className="text-gray-400 leading-tight text-sm">
                                                    {activeOrder.shippingAddress?.street}, {activeOrder.shippingAddress?.city}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 bg-black/40 rounded-2xl p-2 pr-4 border border-white/5">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-12 w-12 rounded-xl text-white hover:bg-zinc-800"
                                                onClick={() => window.open(`tel:${activeOrder.shippingAddress?.phone || activeOrder.customerPhone}`, '_self')}
                                            >
                                                <Phone className="h-5 w-5" />
                                            </Button>
                                            <div className="flex-1">
                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Contact</p>
                                                <p className="font-bold text-sm">{activeOrder.shippingAddress?.phone}</p>
                                            </div>
                                            <Button
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 h-10 font-bold shadow-lg shadow-blue-900/20"
                                                onClick={() => activeOrder.shippingAddress?.location && openMap(activeOrder.shippingAddress.location.lat, activeOrder.shippingAddress.location.lng)}
                                            >
                                                <Navigation className="h-4 w-4 mr-2" /> Navigate
                                            </Button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 py-2">
                                            <div className="bg-zinc-800/50 rounded-xl p-3">
                                                <p className="text-xs text-gray-500 mb-1">Amount</p>
                                                <p className="text-lg font-bold">₹{activeOrder.totalAmount}</p>
                                            </div>
                                            <div className="bg-zinc-800/50 rounded-xl p-3">
                                                <p className="text-xs text-gray-500 mb-1">Items</p>
                                                <p className="text-lg font-bold">{activeOrder.items?.length || 1} items</p>
                                            </div>
                                        </div>

                                        {/* Items List - Collapsible */}
                                        <div className="bg-zinc-800/30 rounded-2xl border border-white/5 overflow-hidden">
                                            <button
                                                onClick={() => setShowItems(!showItems)}
                                                className="w-full flex items-center justify-between p-4 text-sm font-bold text-gray-300 hover:bg-white/5 transition-colors"
                                            >
                                                <span>Order Items</span>
                                                {showItems ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                            </button>
                                            {showItems && (
                                                <div className="p-4 pt-0 space-y-3">
                                                    {activeOrder.items?.map((item: any, idx: number) => (
                                                        <div key={idx} className="flex gap-3 items-center bg-black/20 p-2 rounded-lg">
                                                            <div className="h-10 w-10 bg-zinc-800 rounded-md flex items-center justify-center shrink-0">
                                                                {item.image ? (
                                                                    <img src={item.image} alt={item.title} className="h-full w-full object-cover rounded-md" />
                                                                ) : (
                                                                    <Package className="h-5 w-5 text-gray-500" />
                                                                )}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-medium text-white truncate">{item.title}</p>
                                                                <p className="text-xs text-gray-500">Qty: {item.quantity} • ₹{item.price}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {actionBtn && (
                                            <Button
                                                onClick={actionBtn.action}
                                                disabled={actionBtn.disabled}
                                                className={`w-full font-bold h-16 text-lg rounded-2xl shadow-xl transition-transform active:scale-95 ${actionBtn.style}`}
                                            >
                                                {actionBtn.label}
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <h2 className="font-bold text-xl text-white">Available Orders</h2>
                                        <span className="text-xs font-bold bg-zinc-800 text-gray-400 px-2 py-1 rounded-md border border-zinc-700">{availableOrders.length} NEARBY</span>
                                    </div>

                                    {availableOrders.length === 0 ? (
                                        <div className="py-24 flex flex-col items-center justify-center text-center space-y-6 opacity-50">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full animate-pulse" />
                                                <div className="h-24 w-24 bg-zinc-900 rounded-full flex items-center justify-center relative z-10 border border-zinc-800 shadow-xl">
                                                    <Navigation className="h-10 w-10 text-blue-400 animate-spin-slow" />
                                                </div>
                                            </div>
                                            <div>
                                                <p className="font-bold text-lg text-white">Scanning Area...</p>
                                                <p className="text-sm text-gray-500">Finding orders near your location</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 pb-24">
                                            {availableOrders.map((order: any) => (
                                                <motion.div
                                                    key={order.id}
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl active:scale-[0.98] transition-transform touch-manipulation shadow-lg relative overflow-hidden group"
                                                >
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                                        <div className="flex items-center gap-2">
                                                            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider animate-pulse">
                                                                New Request
                                                            </span>
                                                            <span className="text-xs text-gray-500">Just now</span>
                                                        </div>
                                                        <span className="text-xl font-black text-green-400">₹{order.totalAmount}</span>
                                                    </div>

                                                    <div className="flex gap-4 mb-6 relative z-10">
                                                        <div className="absolute left-[11px] top-3 bottom-3 w-0.5 bg-zinc-800" />
                                                        <div className="flex flex-col gap-8 z-10">
                                                            <div className="h-6 w-6 rounded-full bg-zinc-800 border-4 border-black flex items-center justify-center">
                                                                <div className="h-2 w-2 rounded-full bg-gray-500" />
                                                            </div>
                                                            <div className="h-6 w-6 rounded-full bg-white border-4 border-black flex items-center justify-center">
                                                                <div className="h-2 w-2 rounded-full bg-black" />
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 flex flex-col gap-6">
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Pickup</p>
                                                                <p className="font-medium text-sm text-gray-300">FlashFit Store, Goregaon</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Dropoff</p>
                                                                <p className="font-bold text-white text-lg leading-tight">{order.shippingAddress?.city || "Customer Location"}</p>
                                                                <p className="text-xs text-gray-400 truncate mt-1">{order.shippingAddress?.pincode || "Area details hidden"}</p>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <Button
                                                        onClick={() => handleAcceptOrder(order)}
                                                        className="w-full bg-white text-black hover:bg-gray-200 font-bold h-14 rounded-2xl text-lg shadow-lg transition-transform active:scale-95 relative z-10"
                                                    >
                                                        Accept Order
                                                    </Button>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Delivery Confirmation Modal */}
            <Dialog open={showDeliveryModal} onOpenChange={setShowDeliveryModal}>
                <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold">Confirm Delivery</DialogTitle>
                        <DialogDescription className="text-gray-400">
                            Select items delivered. Unselected items will be marked as returned.
                        </DialogDescription>
                    </DialogHeader>



                    <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto overscroll-contain touch-pan-y">
                        {activeOrder?.items?.map((item: any, idx: number) => {
                            const itemId = item.id || item.productId;
                            const isSelected = selectedItemIds.includes(itemId);
                            return (
                                <div
                                    key={idx}
                                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${isSelected ? 'bg-green-500/10 border-green-500/50' : 'bg-zinc-800 border-zinc-700'}`}
                                    onClick={() => {
                                        if (isSelected) {
                                            setSelectedItemIds(prev => prev.filter(id => id !== itemId));
                                        } else {
                                            setSelectedItemIds(prev => [...prev, itemId]);
                                        }
                                    }}
                                >
                                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-green-500 border-green-500' : 'border-gray-500'}`}>
                                        {isSelected && <CheckCircle className="h-4 w-4 text-black" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-sm">{item.title}</p>
                                        <p className="text-xs text-gray-400">Qty: {item.quantity} • ₹{item.price}</p>
                                    </div>
                                    {!isSelected && (
                                        <span className="text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded">RETURN</span>
                                    )}
                                </div>
                            );
                        })}

                        {selectedItemIds.length !== activeOrder?.items?.length && (
                            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-500 text-sm">
                                <AlertTriangle className="h-4 w-4" />
                                <span>{activeOrder?.items?.length - selectedItemIds.length} items will be marked as returned.</span>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setShowDeliveryModal(false)} className="text-gray-400 hover:text-white hover:bg-zinc-800">
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmDelivery}
                            disabled={isSubmittingDelivery}
                            className="bg-green-500 text-black hover:bg-green-600 font-bold"
                        >
                            {isSubmittingDelivery ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                                </>
                            ) : (
                                "Confirm & Complete"
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
