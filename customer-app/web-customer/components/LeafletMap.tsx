"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { renderToStaticMarkup } from "react-dom/server";
import { Truck, MapPin } from "lucide-react";

// Fix for default markers in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LeafletMapProps {
    driverLocation: { latitude: number; longitude: number } | null;
    customerLocation: { latitude: number; longitude: number };
    driverName?: string;
    customerAddress?: string;
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function LeafletMap({ driverLocation, customerLocation, driverName, customerAddress }: LeafletMapProps) {
    const driverPos: [number, number] = driverLocation
        ? [driverLocation.latitude, driverLocation.longitude]
        : [customerLocation.latitude, customerLocation.longitude];

    const customerPos: [number, number] = [customerLocation.latitude, customerLocation.longitude];

    const center = driverLocation ? driverPos : customerPos;

    // Custom Icons
    const driverIconMarkup = renderToStaticMarkup(
        <div className="relative flex items-center justify-center w-10 h-10 bg-white rounded-full border-2 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Truck className="w-5 h-5 text-blue-600" />
            <div className="absolute -bottom-1 w-3 h-3 bg-white border-r-2 border-b-2 border-blue-500 rotate-45" />
        </div>
    );

    const customerIconMarkup = renderToStaticMarkup(
        <div className="relative flex items-center justify-center w-10 h-10 bg-white rounded-full border-2 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]">
            <MapPin className="w-5 h-5 text-red-600" />
            <div className="absolute -bottom-1 w-3 h-3 bg-white border-r-2 border-b-2 border-red-500 rotate-45" />
        </div>
    );

    const driverIcon = L.divIcon({
        html: driverIconMarkup,
        className: "bg-transparent",
        iconSize: [40, 40],
        iconAnchor: [20, 44], // Bottom center
        popupAnchor: [0, -44],
    });

    const customerIcon = L.divIcon({
        html: customerIconMarkup,
        className: "bg-transparent",
        iconSize: [40, 40],
        iconAnchor: [20, 44],
        popupAnchor: [0, -44],
    });

    return (
        <MapContainer
            center={center}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
            className="z-0 bg-neutral-900"
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <MapUpdater center={center} />

            {driverLocation && (
                <Marker position={driverPos} icon={driverIcon}>
                    <Popup className="custom-popup">
                        <div className="text-center p-1">
                            <p className="font-bold text-sm text-black">{driverName || "Driver"}</p>
                            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">On the way</p>
                        </div>
                    </Popup>
                </Marker>
            )}

            <Marker position={customerPos} icon={customerIcon}>
                <Popup className="custom-popup">
                    <div className="text-center p-1">
                        <p className="font-bold text-sm text-black">Delivery Location</p>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold truncate max-w-[150px]">{customerAddress || "Your Address"}</p>
                    </div>
                </Popup>
            </Marker>
        </MapContainer>
    );
}
