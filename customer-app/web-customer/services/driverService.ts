import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/shared/infrastructure/firebase";

export interface DriverLocation {
    driverId: string;
    latitude: number;
    longitude: number;
    status: string;
    lastUpdated: any;
}

export const DriverService = {
    subscribeToDriverLocation: (driverId: string, callback: (location: DriverLocation | null) => void) => {
        const docRef = doc(db, "driverLocations", driverId);
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                callback(docSnap.data() as DriverLocation);
            } else {
                callback(null);
            }
        });
    }
};
