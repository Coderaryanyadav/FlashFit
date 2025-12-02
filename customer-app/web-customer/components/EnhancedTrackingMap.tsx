"use client";

import { useEffect, useState } from "react";
import { Order } from "@/services/orderService";
import { DriverService, DriverLocation } from "@/services/driverService";
import { MapPin, Phone, User, Clock, Navigation, Truck } from "lucide-react";
import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
    ssr: false,
    loading: () => (
        <div className="h-full w-full bg-neutral-800 flex items-center justify-center">
            <p className="text-gray-400 animate-pulse">Loading map...</p>
        </div>
    ),
});

interface EnhancedTrackingMapProps {
    order: Order;
}
const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180);
};

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
};

export function EnhancedTrackingMap({ order }: EnhancedTrackingMapProps) {
    const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
    const [eta, setEta] = useState<number>(0);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (order.driverId) {
            const unsub = DriverService.subscribeToDriverLocation(order.driverId, (loc) => {
                setDriverLocation(loc);
                // Calculate ETA based on distance (simplified)
                if (loc && order.shippingAddress?.location) {
                    const distance = calculateDistance(
                        loc.latitude,
                        loc.longitude,
                        order.shippingAddress.location.lat,
                        order.shippingAddress.location.lng
                    );
                    // Assume average speed of 30 km/h in city
                    const timeInMinutes = Math.ceil((distance / 30) * 60);
                    setEta(timeInMinutes);
                }
            });
            return () => unsub();
        }
    }, [order.driverId, order.shippingAddress]);

    const getStatusProgress = () => {
        const statusMap: Record<string, number> = {
            pending: 10,
            placed: 20,
            confirmed: 40,
            assigned: 60,
            picked_up: 80,
            delivered: 100,
            returning: 100,
            warehouse_reached: 100,
        };
        return statusMap[order.status] || 0;
    };

    const getStatusMessage = () => {
        const messages: Record<string, string> = {
            pending: "Order received, waiting for confirmation",
            placed: "Order placed successfully",
            confirmed: "Order confirmed by restaurant",
            assigned: `Driver ${order.driverName || "assigned"} accepted your order`,
            picked_up: `${order.driverName || "Driver"} picked up your order`,
            delivered: "Order delivered successfully!",
            returning: "Driver returning to warehouse",
            warehouse_reached: "Order completed",
        };
        return messages[order.status] || "Processing...";
    };

    const defaultCenter: [number, number] = [19.1663, 72.8526]; // Goregaon West
    const driverPos: [number, number] = driverLocation
        ? [driverLocation.latitude, driverLocation.longitude]
        : defaultCenter;
    const customerPos: [number, number] = order.shippingAddress?.location
        ? [order.shippingAddress.location.lat, order.shippingAddress.location.lng]
        : defaultCenter;

    return (
        <div className="space-y-6">
            {/* Driver Info Card */}
            {order.driverName && order.driverId && (
                <div className="bg-gradient-to-br from-primary/10 to-yellow-400/10 border border-primary/20 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <User className="h-8 w-8 text-primary" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-white text-lg mb-1">{order.driverName}</h4>
                            <p className="text-sm text-gray-400 mb-3">Your Delivery Partner</p>
                            <div className="flex flex-wrap gap-3">
                                <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-lg">
                                    <Phone className="h-4 w-4 text-primary" />
                                    <span className="text-sm text-white font-medium">
                                        {order.driverPhone || "Contact via app"}
                                    </span>
                                </div>
                                {eta > 0 && (
                                    <div className="flex items-center gap-2 bg-black/30 px-3 py-2 rounded-lg">
                                        <Clock className="h-4 w-4 text-primary" />
                                        <span className="text-sm text-white font-medium">ETA: {eta} min</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Live Map */}
            <div className="bg-neutral-900/50 border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-white/5 flex items-center justify-center relative">
                    <div className="flex items-center gap-2">
                        <Navigation className="h-5 w-5 text-primary" />
                        <h3 className="font-bold text-white">Live Tracking</h3>
                    </div>
                    {driverLocation && (
                        <div className="absolute right-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-gray-400">Live</span>
                        </div>
                    )}
                </div>
                <div className="h-[400px] relative bg-neutral-900">
                    <LeafletMap
                        driverLocation={driverLocation}
                        customerLocation={
                            order.shippingAddress?.location
                                ? {
                                    latitude: order.shippingAddress.location.lat,
                                    longitude: order.shippingAddress.location.lng,
                                }
                                : { latitude: 19.1663, longitude: 72.8526 }
                        }
                        driverName={order.driverName}
                        customerAddress={order.shippingAddress?.street}
                    />
                </div>
            </div>
        </div>
    );
}
