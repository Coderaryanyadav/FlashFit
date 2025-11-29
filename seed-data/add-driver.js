const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const testDriver = {
    name: "Rajesh Kumar",
    phone: "+919876543210",
    email: "driver@flashfit.com",
    isOnline: true,
    currentOrderId: null,
    location: {
        lat: 19.1663,
        lng: 72.8526,
        timestamp: new Date()
    },
    stats: {
        totalDeliveries: 0,
        rating: 5.0,
        todayEarnings: 0,
        weekEarnings: 0
    },
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
};

async function addDriver() {
    try {
        console.log('Adding test driver...');

        const docRef = await db.collection('drivers').add(testDriver);
        console.log(`✅ Added driver: ${testDriver.name} (ID: ${docRef.id})`);
        console.log(`   Phone: ${testDriver.phone}`);
        console.log(`   Location: ${testDriver.location.lat}, ${testDriver.location.lng}`);

        console.log('\n✅ Driver added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding driver:', error);
        process.exit(1);
    }
}

addDriver();
