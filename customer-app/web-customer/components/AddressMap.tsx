"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

import { Loader2, MapPin, Search } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";

// Fix for default marker icon
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface AddressMapProps {
    onAddressSelect: (address: any) => void;
}

function LocationMarker({ position, setPosition, onAddressSelect }: any) {
    const map = useMap();

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            setPosition({ lat, lng });
            // Reverse geocode
            fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
                .then(res => res.json())
                .then(data => {
                    const address = data.address || {};
                    onAddressSelect({
                        address: data.display_name,
                        city: address.city || address.town || address.village || address.county || "",
                        pincode: address.postcode || "",
                        lat,
                        lng
                    });
                })
                .catch(err => console.error("Reverse geocode failed:", err));
        },
    });

    useEffect(() => {
        map.flyTo(position, map.getZoom());
    }, [position, map]);

    return position === null ? null : (
        <Marker position={position} icon={icon} />
    );
}

export function AddressMap({ onAddressSelect }: AddressMapProps) {
    const [position, setPosition] = useState({ lat: 19.0760, lng: 72.8777 }); // Mumbai
    const [searchQuery, setSearchQuery] = useState("");
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const handleSearch = async () => {
        if (!searchQuery) return;
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon, display_name, address } = data[0];
                const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
                setPosition(newPos);

                // For search results, we might need another reverse geocode to get structured city/pincode if not present
                // But typically we can just use what we have or trigger the reverse geocode logic
                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`)
                    .then(res => res.json())
                    .then(data => {
                        const addr = data.address || {};
                        onAddressSelect({
                            address: data.display_name,
                            city: addr.city || addr.town || addr.village || addr.county || "",
                            pincode: addr.postcode || "",
                            lat: parseFloat(lat),
                            lng: parseFloat(lon)
                        });
                    });
            }
        } catch (error) {
            console.error("Search failed:", error);
        }
    };

    const getCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const { latitude, longitude } = pos.coords;
                setPosition({ lat: latitude, lng: longitude });

                fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                    .then(res => res.json())
                    .then(data => {
                        const addr = data.address || {};
                        onAddressSelect({
                            address: data.display_name,
                            city: addr.city || addr.town || addr.village || addr.county || "",
                            pincode: addr.postcode || "",
                            lat: latitude,
                            lng: longitude
                        });
                    });
            });
        }
    };

    if (!isMounted) return <div className="h-full w-full flex items-center justify-center bg-zinc-900 rounded-xl"><Loader2 className="animate-spin text-white" /></div>;

    return (
        <div className="relative h-full w-full min-h-[400px]">
            <div className="absolute top-4 left-4 right-4 z-[1000] flex gap-2">
                <div className="flex-1 flex gap-2">
                    <Input
                        placeholder="Search your location..."
                        className="bg-white text-black border-0 shadow-lg h-12 text-lg"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button onClick={handleSearch} className="bg-primary text-black h-12 px-4 shadow-lg">
                        <Search className="h-5 w-5" />
                    </Button>
                </div>
                <Button
                    onClick={getCurrentLocation}
                    className="bg-white text-black hover:bg-gray-200 h-12 w-12 p-0 shadow-lg"
                >
                    <MapPin className="h-5 w-5" />
                </Button>
            </div>

            <MapContainer
                center={position}
                zoom={13}
                style={{ height: "100%", width: "100%", borderRadius: "1rem" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className="map-tiles"
                />
                <LocationMarker position={position} setPosition={setPosition} onAddressSelect={onAddressSelect} />
            </MapContainer>

            <style jsx global>{`
                .leaflet-control-attribution {
                    display: none;
                }
                .map-tiles {
                    filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
                }
            `}</style>
        </div>
    );
}
