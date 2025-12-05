// Order tracking map component with real-time driver location

"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation, Package, Clock } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";

interface Location {
    lat: number;
    lng: number;
}

interface OrderTrackingMapProps {
    orderId: string;
    customerLocation: Location;
    driverLocation?: Location;
    status: string;
}

export function OrderTrackingMap({ orderId, customerLocation, driverLocation, status }: OrderTrackingMapProps) {
    const [estimatedTime, setEstimatedTime] = useState(15);
    const [driverPos, setDriverPos] = useState(driverLocation || { lat: 0, lng: 0 });

    // Simulate driver movement (in production, this would come from real-time Firestore updates)
    useEffect(() => {
        if (status === "assigned" || status === "picked_up") {
            const interval = setInterval(() => {
                setDriverPos(prev => ({
                    lat: prev.lat + (customerLocation.lat - prev.lat) * 0.1,
                    lng: prev.lng + (customerLocation.lng - prev.lng) * 0.1
                }));
                setEstimatedTime(prev => Math.max(1, prev - 1));
            }, 3000);

            return () => clearInterval(interval);
        }
    }, [status, customerLocation]);

    return (
        <div className="space-y-4">
            {/* Map Placeholder */}
            <Card className="bg-neutral-900 border-white/10 overflow-hidden">
                <div className="relative h-96 bg-gradient-to-br from-neutral-800 to-neutral-900">
                    {/* SVG Map Visualization */}
                    <svg className="w-full h-full" viewBox="0 0 400 300">
                        {/* Route line */}
                        {driverLocation && (
                            <line
                                x1={driverPos.lng * 100}
                                y1={driverPos.lat * 100}
                                x2={customerLocation.lng * 100}
                                y2={customerLocation.lat * 100}
                                stroke="#FACC15"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                                className="animate-pulse"
                            />
                        )}

                        {/* Customer location marker */}
                        <g transform={`translate(${customerLocation.lng * 100}, ${customerLocation.lat * 100})`}>
                            <circle r="8" fill="#10B981" opacity="0.3" className="animate-ping" />
                            <circle r="6" fill="#10B981" />
                            <circle r="3" fill="white" />
                        </g>

                        {/* Driver location marker */}
                        {driverLocation && (
                            <g transform={`translate(${driverPos.lng * 100}, ${driverPos.lat * 100})`}>
                                <circle r="10" fill="#FACC15" opacity="0.3" className="animate-pulse" />
                                <circle r="8" fill="#FACC15" />
                                <path d="M -3,-3 L 3,0 L -3,3 Z" fill="black" />
                            </g>
                        )}
                    </svg>

                    {/* Status overlay */}
                    <div className="absolute top-4 left-4 right-4">
                        <Card className="bg-black/80 backdrop-blur-md border-white/10">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                                            <Navigation className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">Driver on the way</p>
                                            <p className="text-sm text-gray-400">Order #{orderId.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-center gap-1 text-primary font-bold">
                                            <Clock className="h-4 w-4" />
                                            {estimatedTime} min
                                        </div>
                                        <p className="text-xs text-gray-400">Estimated</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </Card>

            {/* Delivery Timeline */}
            <Card className="bg-neutral-900 border-white/10">
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {[
                            { label: "Order Placed", time: "10:30 AM", completed: true },
                            { label: "Order Confirmed", time: "10:32 AM", completed: true },
                            { label: "Driver Assigned", time: "10:35 AM", completed: true },
                            { label: "Out for Delivery", time: "10:40 AM", completed: status !== "placed" },
                            { label: "Delivered", time: "ETA 11:00 AM", completed: status === "delivered" }
                        ].map((step, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step.completed ? "bg-green-500" : "bg-neutral-700"
                                    }`}>
                                    {step.completed ? (
                                        <Package className="h-4 w-4 text-white" />
                                    ) : (
                                        <div className="h-2 w-2 rounded-full bg-neutral-500" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className={`font-medium ${step.completed ? "text-white" : "text-gray-500"}`}>
                                        {step.label}
                                    </p>
                                    <p className="text-sm text-gray-500">{step.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
