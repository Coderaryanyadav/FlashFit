"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Custom icon for drivers (Green marker)
const driverIcon = L.icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

export default function MapComponent({ locations }: { locations: any[] }) {
    const defaultCenter = { lat: 19.0760, lng: 72.8777 }; // Mumbai

    return (
        <MapContainer
            center={locations.length > 0 ? { lat: locations[0].latitude, lng: locations[0].longitude } : defaultCenter}
            zoom={11}
            style={{ height: "100%", width: "100%" }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className="map-tiles"
            />
            {locations.map((driver) => (
                driver.latitude && driver.longitude ? (
                    <Marker
                        key={driver.driverId}
                        position={[driver.latitude, driver.longitude]}
                        icon={driverIcon}
                    >
                        <Popup>
                            <div className="text-black font-sans">
                                <strong className="text-sm">{driver.driverName}</strong>
                                <div className="text-xs text-gray-600">Status: {driver.status}</div>
                                <div className="text-xs text-gray-500">
                                    Last update: {driver.lastUpdated?.toDate ? new Date(driver.lastUpdated.toDate()).toLocaleTimeString() : 'Just now'}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ) : null
            ))}
            <style jsx global>{`
                .leaflet-control-attribution {
                    display: none;
                }
                .map-tiles {
                    filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%);
                }
                .leaflet-popup-content-wrapper {
                    border-radius: 8px;
                    padding: 0;
                }
                .leaflet-popup-content {
                    margin: 12px;
                }
            `}</style>
        </MapContainer>
    );
}
