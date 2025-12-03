import type { Firestore } from 'firebase-admin/firestore';

interface DriverCandidate {
    id: string;
    location: {
        lat: number;
        lng: number;
    };
    isAvailable: boolean;
    currentOrders: number;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function findNearestDriver(
    db: Firestore,
    deliveryLat: number,
    deliveryLng: number
): Promise<string | null> {
    try {
        const driversSnapshot = await db.collection('drivers')
            .where('isAvailable', '==', true)
            .where('isOnline', '==', true)
            .limit(20)
            .get();

        if (driversSnapshot.empty) {
            console.warn('No available drivers found');
            return null;
        }

        const drivers: DriverCandidate[] = driversSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as DriverCandidate));

        // Find nearest driver with capacity
        let nearestDriver: { id: string; distance: number } | null = null;

        for (const driver of drivers) {
            if (!driver.location || driver.currentOrders >= 3) continue;

            const distance = calculateDistance(
                deliveryLat,
                deliveryLng,
                driver.location.lat,
                driver.location.lng
            );

            if (!nearestDriver || distance < nearestDriver.distance) {
                nearestDriver = { id: driver.id, distance };
            }
        }

        if (nearestDriver && nearestDriver.distance <= 10) {
            return nearestDriver.id;
        }

        return null;
    } catch (error) {
        console.error('Error finding nearest driver:', error);
        return null;
    }
}

export async function assignDriverToOrder(
    db: Firestore,
    orderId: string,
    driverId: string
): Promise<void> {
    const batch = db.batch();

    // Update order with driver
    const orderRef = db.collection('orders').doc(orderId);
    batch.update(orderRef, {
        driverId,
        status: 'assigned',
        assignedAt: new Date()
    });

    // Update driver
    const driverRef = db.collection('drivers').doc(driverId);
    batch.update(driverRef, {
        currentOrders: (await driverRef.get()).data()?.currentOrders || 0 + 1,
        lastAssignedAt: new Date()
    });

    await batch.commit();
}
