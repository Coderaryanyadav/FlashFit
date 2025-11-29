const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: 'studio-847805730-4f392'
    });
}

const db = admin.firestore();

async function debugDB() {
    console.log('--- FIXING DRIVER DATA ---');

    // 1. Find Driver UID
    const usersSnapshot = await db.collection('users').where('email', '==', 'driver@flashfit.com').get();
    if (usersSnapshot.empty) {
        console.log('❌ Driver user not found!');
        return;
    }

    const driverUser = usersSnapshot.docs[0];
    const driverUid = driverUser.id;
    console.log(`Found Driver UID: ${driverUid}`);

    // 2. Create Driver Doc
    await db.collection('drivers').doc(driverUid).set({
        name: 'John Driver',
        email: 'driver@flashfit.com',
        phone: '9876543210',
        isOnline: false,
        currentLocation: { lat: 19.1663, lng: 72.8526 },
        totalDeliveries: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    console.log('✅ Driver doc created/updated.');

    console.log('\n--- DRIVERS AFTER FIX ---');
    const drivers = await db.collection('drivers').get();
    drivers.forEach(doc => {
        console.log(doc.id, doc.data());
    });
}

debugDB();
