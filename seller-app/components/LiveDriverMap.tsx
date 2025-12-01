"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";

// Dynamic import for the map part
const MapComponent = dynamic(() => import("./MapComponent"), {
    ssr: false,
    loading: () => <div className="h-[400px] w-full bg-zinc-900 animate-pulse rounded-lg flex items-center justify-center text-gray-500">Loading Map...</div>
});

interface DriverLocation {
    driverId: string;
    driverName: string;
    latitude: number;
    longitude: number;
    status: 'online' | 'offline';
    lastUpdated: any;
}

export function LiveDriverMap() {
    const [driverLocations, setDriverLocations] = useState<DriverLocation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "driverLocations"), (snapshot) => {
            const locations = snapshot.docs.map(doc => ({
                driverId: doc.id,
                ...doc.data()
            })) as DriverLocation[];
            setDriverLocations(locations.filter(loc => loc.status === 'online'));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <Card className="bg-zinc-900 border-zinc-800 overflow-hidden">
            <CardHeader className="pb-3">
                <CardTitle className="text-white flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-green-500" />
                    Live Driver Locations
                    <span className="ml-auto text-xs font-normal text-gray-400 bg-zinc-800 px-2 py-1 rounded-full">
                        {driverLocations.length} Online
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="h-[400px] w-full relative">
                    <MapComponent locations={driverLocations} />
                </div>
            </CardContent>
        </Card>
    );
}

