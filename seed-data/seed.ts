import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

// Initialize Firebase Admin
// Note: In a real scenario, you'd need a service account key
// For this environment, we assume it's set up or we mock it for local emulation
const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seed() {
    try {
        const seedDataPath = path.join(__dirname, 'seeds', 'seed.json');
        const seedData = JSON.parse(fs.readFileSync(seedDataPath, 'utf8'));

        // Seed Products
        if (seedData.products) {
            console.log('Seeding products...');
            const batch = db.batch();
            for (const product of seedData.products) {
                const ref = db.collection('products').doc(product.id);
                batch.set(ref, product);
            }
            await batch.commit();
            console.log('Products seeded.');
        }

        // Seed Stores
        if (seedData.stores) {
            console.log('Seeding stores...');
            const batch = db.batch();
            for (const store of seedData.stores) {
                const ref = db.collection('stores').doc(store.id);
                batch.set(ref, store);
            }
            await batch.commit();
            console.log('Stores seeded.');
        }

        // Seed Drivers
        if (seedData.drivers) {
            console.log('Seeding drivers...');
            const batch = db.batch();
            for (const driver of seedData.drivers) {
                const ref = db.collection('drivers').doc(driver.id);
                batch.set(ref, driver);
            }
            await batch.commit();
            console.log('Drivers seeded.');
        }

        console.log('Seeding complete!');
    } catch (error) {
        console.error('Seeding failed:', error);
    }
}

seed();
