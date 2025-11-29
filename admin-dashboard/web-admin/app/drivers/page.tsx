"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Phone, Mail, Clock, UserPlus, X, Edit } from "lucide-react";
import { CreateDriverForm } from "@/components/CreateDriverForm";
import { EditDriverModal } from "@/components/EditDriverModal";
import { LiveDriverMap } from "@/components/LiveDriverMap";

interface Driver {
    uid: string;
    name: string;
    email: string;
    phone: string;
    isOnline: boolean;
    currentLocation?: { lat: number; lng: number };
    activeOrderId?: string;
    totalDeliveries?: number;
    rating?: number;
}

// Helper to get random gradient based on string
const getGradient = (str: string) => {
    const gradients = [
        "bg-gradient-to-br from-pink-500 to-rose-500",
        "bg-gradient-to-br from-blue-500 to-cyan-500",
        "bg-gradient-to-br from-green-500 to-emerald-500",
        "bg-gradient-to-br from-purple-500 to-violet-500",
        "bg-gradient-to-br from-yellow-500 to-orange-500",
        "bg-gradient-to-br from-indigo-500 to-blue-600",
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
};

export default function DriversPage() {
    const [drivers, setDrivers] = useState<Driver[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchDrivers = () => {
        const q = query(collection(db, "drivers"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const driversData = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            })) as Driver[];
            setDrivers(driversData);
            setLoading(false);
        });
        return unsubscribe;
    };

    useEffect(() => {
        const unsubscribe = fetchDrivers();
        return () => unsubscribe();
    }, []);

    const handleEdit = (driver: Driver) => {
        setSelectedDriver(driver);
        setIsEditModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Drivers</h2>
                    <p className="text-muted-foreground mt-1">Manage and monitor your delivery fleet</p>
                </div>
                <Button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className="bg-white text-black hover:bg-gray-200 font-bold transition-all"
                >
                    {showCreateForm ? (
                        <>
                            <X className="h-4 w-4 mr-2" />
                            Cancel
                        </>
                    ) : (
                        <>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Create Driver
                        </>
                    )}
                </Button>
            </div>

            {/* Stats Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Drivers</CardTitle>
                        <Truck className="h-4 w-4 text-white" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{drivers.length}</div>
                    </CardContent>
                </Card>
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Online Now</CardTitle>
                        <div className={`h-2 w-2 rounded-full ${drivers.some(d => d.isOnline) ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-white">{drivers.filter(d => d.isOnline).length}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Live Map Section */}
            <div className="rounded-xl overflow-hidden border border-zinc-800 min-h-[400px] h-auto">
                <LiveDriverMap />
            </div>

            {/* Create Driver Form */}
            {showCreateForm && (
                <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 animate-in slide-in-from-top-4 duration-300">
                    <h3 className="text-xl font-bold text-white mb-4">Create New Driver Account</h3>
                    <CreateDriverForm onSuccess={() => setShowCreateForm(false)} />
                </div>
            )}

            {/* Drivers Grid */}
            {drivers.length === 0 ? (
                <Card className="border-dashed border-zinc-800 bg-transparent">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="h-16 w-16 rounded-full bg-zinc-900 flex items-center justify-center mb-4">
                            <Truck className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <p className="text-lg font-semibold text-white mb-2">No drivers registered</p>
                        <p className="text-sm text-muted-foreground">Drivers will appear here once they sign up</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {drivers.map((driver) => (
                        <Card key={driver.uid} className="bg-zinc-900 border-zinc-800 overflow-hidden hover:border-zinc-700 transition-all group">
                            <CardHeader className="pb-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform ${getGradient(driver.name || "D")}`}>
                                            {driver.name?.charAt(0).toUpperCase() || "D"}
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg text-white">{driver.name || "Unknown Driver"}</CardTitle>
                                            <div className="flex items-center gap-2 mt-1">
                                                {driver.isOnline ? (
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-500/10 border border-green-500/20">
                                                        <span className="relative flex h-1.5 w-1.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500"></span>
                                                        </span>
                                                        <span className="text-[10px] text-green-500 font-bold uppercase tracking-wide">Online</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-500"></span>
                                                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wide">Offline</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4 py-2 border-y border-zinc-800">
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">Total Deliveries</p>
                                        <p className="text-lg font-bold text-white">{driver.totalDeliveries || 0}</p>
                                    </div>
                                    <div className="space-y-1 border-l border-zinc-800 pl-4">
                                        <p className="text-xs text-muted-foreground">Rating</p>
                                        <p className="text-lg font-bold text-white">{driver.rating?.toFixed(1) || "0.0"}</p>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3 text-sm text-zinc-400">
                                        <Mail className="h-4 w-4" />
                                        <span className="truncate">{driver.email || "No email"}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-zinc-400">
                                        <Phone className="h-4 w-4" />
                                        <span>{driver.phone || "No phone"}</span>
                                    </div>
                                </div>
                                {driver.activeOrderId && (
                                    <div className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10 flex items-center gap-3 text-sm text-white font-medium animate-pulse">
                                        <Clock className="h-4 w-4 text-white" />
                                        <span>Currently on delivery</span>
                                    </div>
                                )}
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    <Button
                                        onClick={() => handleEdit(driver)}
                                        variant="outline"
                                        size="sm"
                                        className="border-white/10 hover:bg-white/10"
                                    >
                                        <Edit className="h-4 w-4 mr-2" />
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20"
                                        onClick={async () => {
                                            if (confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
                                                try {
                                                    await deleteDoc(doc(db, "drivers", driver.uid));
                                                    // Also delete their location data if it exists
                                                    await deleteDoc(doc(db, "driverLocations", driver.uid));
                                                } catch (error) {
                                                    console.error("Error deleting driver:", error);
                                                    alert("Failed to delete driver");
                                                }
                                            }
                                        }}
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Delete
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <EditDriverModal
                driver={selectedDriver}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchDrivers}
            />
        </div>
    );
}
