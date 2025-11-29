const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'studio-847805730-4f392'
});

const db = admin.firestore();

async function restoreDriver() {
    console.log('Restoring John Driver...');
    try {
        // We need the UID. Since we don't know it easily, we'll search by email in users collection first.
        const usersRef = db.collection('users');
        const snapshot = await usersRef.where('email', '==', 'driver@flashfit.com').get();

        if (snapshot.empty) {
            console.log('Driver user not found in users collection. Creating...');
            // In a real scenario we'd use Auth, but here we just want the doc for Admin Panel display if it reads from drivers collection.
            // But wait, Admin Panel reads from 'drivers' collection? Yes.
            // And 'drivers' collection doc ID usually matches Auth UID.
            // I'll just create a dummy doc if I can't find the UID, or use a fixed one if I can't auth.
            // But wait, I can use auth to get UID.
            try {
                const userRecord = await admin.auth().getUserByEmail('driver@flashfit.com');
                const uid = userRecord.uid;

                await db.collection('drivers').doc(uid).set({
                    name: 'John Driver',
                    email: 'driver@flashfit.com',
                    phone: '9876543210',
                    isOnline: false,
                    currentLocation: { lat: 19.1663, lng: 72.8526 },
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
                console.log('Driver restored with UID:', uid);
            } catch (e) {
                console.error('Error fetching user from Auth:', e);
            }
        } else {
            const uid = snapshot.docs[0].id;
            await db.collection('drivers').doc(uid).set({
                name: 'John Driver',
                email: 'driver@flashfit.com',
                phone: '9876543210',
                isOnline: false,
                currentLocation: { lat: 19.1663, lng: 72.8526 },
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log('Driver restored with UID:', uid);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

restoreDriver();
