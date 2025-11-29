"use client";

import { useEffect, useState } from "react";
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import { DriverService, DriverLocation } from "@/services/driverService";
import { Order } from "@/services/orderService";
import { Truck } from "lucide-react";

const mapContainerStyle = {
    width: "100%",
    height: "100%",
};

const defaultCenter = {
    lat: 19.1663, // Goregaon West
    lng: 72.8526,
};

export function LiveTrackingMap({ order }: { order: Order }) {
    const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    });

    useEffect(() => {
        if (order.driverId) {
            const unsub = DriverService.subscribeToDriverLocation(order.driverId, (loc) => {
                setDriverLocation(loc);
            });
            return () => unsub();
        }
    }, [order.driverId]);

    if (!isLoaded) return <div className="h-full w-full bg-neutral-900 animate-pulse flex items-center justify-center text-gray-500">Loading Map...</div>;

    const center = driverLocation
        ? { lat: driverLocation.latitude, lng: driverLocation.longitude }
        : defaultCenter;

    return (
        <div className="lg:col-span-2 bg-neutral-900/50 rounded-3xl border border-white/5 overflow-hidden relative h-[500px]">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                zoom={15}
                center={center}
                options={{
                    disableDefaultUI: true,
                    styles: [
                        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
                        {
                            featureType: "administrative.locality",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "geometry",
                            stylers: [{ color: "#263c3f" }],
                        },
                        {
                            featureType: "poi.park",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#6b9a76" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry",
                            stylers: [{ color: "#38414e" }],
                        },
                        {
                            featureType: "road",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#212a37" }],
                        },
                        {
                            featureType: "road",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#9ca5b3" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry",
                            stylers: [{ color: "#746855" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "geometry.stroke",
                            stylers: [{ color: "#1f2835" }],
                        },
                        {
                            featureType: "road.highway",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#f3d19c" }],
                        },
                        {
                            featureType: "transit",
                            elementType: "geometry",
                            stylers: [{ color: "#2f3948" }],
                        },
                        {
                            featureType: "transit.station",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#d59563" }],
                        },
                        {
                            featureType: "water",
                            elementType: "geometry",
                            stylers: [{ color: "#17263c" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.fill",
                            stylers: [{ color: "#515c6d" }],
                        },
                        {
                            featureType: "water",
                            elementType: "labels.text.stroke",
                            stylers: [{ color: "#17263c" }],
                        },
                    ],
                }}
            >
                {/* Driver Marker */}
                {driverLocation && (
                    <Marker
                        position={{ lat: driverLocation.latitude, lng: driverLocation.longitude }}
                        icon={{
                            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                            scale: 6,
                            fillColor: "#FACC15",
                            fillOpacity: 1,
                            strokeWeight: 2,
                            strokeColor: "#FFFFFF",
                            rotation: 0, // Could calculate heading if we had prev location
                        }}
                    />
                )}

                {/* Destination Marker (Simulated for now) */}
                <Marker position={defaultCenter} />
            </GoogleMap>

            {/* Driver Info Overlay */}
            {order.driverName && (
                <div className="absolute bottom-6 left-6 right-6 bg-black/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <Truck className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-bold text-white">{order.driverName}</h4>
                        <p className="text-xs text-gray-400">Your delivery partner</p>
                    </div>
                    <div className="ml-auto text-right">
                        <p className="text-xs text-gray-400">Status</p>
                        <p className="font-bold text-primary capitalize">{order.status}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
