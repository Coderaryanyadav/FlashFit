const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixDriverStatus() {
    try {
        console.log('🔧 Fixing driver status...');

        // Get all drivers
        const driversSnapshot = await db.collection('drivers').get();

        for (const doc of driversSnapshot.docs) {
            await doc.ref.update({
                isOnline: false,
                status: 'offline',
                lastSeen: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ Fixed driver: ${doc.id}`);
        }

        console.log('🎉 All drivers fixed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

fixDriverStatus();
