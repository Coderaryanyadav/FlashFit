import * as admin from 'firebase-admin';
import * as path from 'path';

// Initialize Firebase Admin
// Reusing the same service account for simplicity in this env
const serviceAccount = require('../seed-data/service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Mock route (New Delhi)
const ROUTE = [
    { lat: 28.6139, lng: 77.2090 }, // CP
    { lat: 28.6129, lng: 77.2295 }, // India Gate
    { lat: 28.5921, lng: 77.2270 }, // Lodhi Garden
    { lat: 28.5679, lng: 77.2433 }, // Lajpat Nagar
];

async function simulateDriver(driverId: string) {
    console.log(`Starting simulation for driver ${driverId}...`);
    let index = 0;

    setInterval(async () => {
        const location = ROUTE[index];

        try {
            await db.collection('drivers').doc(driverId).update({
                currentLocation: location,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`Driver ${driverId} moved to ${location.lat}, ${location.lng}`);
        } catch (error) {
            console.error(`Error updating location for ${driverId}:`, error);
        }

        index = (index + 1) % ROUTE.length;
    }, 5000); // Update every 5 seconds
}

// Get first available driver and simulate
async function start() {
    const driversSnap = await db.collection('drivers').where('isOnline', '==', true).limit(1).get();
    if (driversSnap.empty) {
        console.log('No online drivers found to simulate.');
        return;
    }

    const driverId = driversSnap.docs[0].id;
    simulateDriver(driverId);
}

start();
