const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function setupUsers() {
    console.log('🔧 Setting up users...\n');

    try {
        // 1. Create admin user
        console.log('Creating admin user...');
        let adminUser;
        try {
            adminUser = await admin.auth().getUserByEmail('admin@flashfit.com');
            console.log('✅ Admin user already exists');
        } catch (error) {
            adminUser = await admin.auth().createUser({
                email: 'admin@flashfit.com',
                password: 'admin123456',
                displayName: 'FlashFit Admin'
            });
            console.log('✅ Admin user created');
        }

        // Set admin user document
        await db.collection('users').doc(adminUser.uid).set({
            uid: adminUser.uid,
            email: 'admin@flashfit.com',
            displayName: 'FlashFit Admin',
            role: 'admin',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 2. Create driver user
        console.log('Creating driver user...');
        let driverUser;
        try {
            driverUser = await admin.auth().getUserByEmail('driver@flashfit.com');
            console.log('✅ Driver user already exists');
        } catch (error) {
            driverUser = await admin.auth().createUser({
                email: 'driver@flashfit.com',
                password: 'driver123456',
                displayName: 'Flash Driver'
            });
            console.log('✅ Driver user created');
        }

        // Set driver user document
        await db.collection('users').doc(driverUser.uid).set({
            uid: driverUser.uid,
            email: 'driver@flashfit.com',
            displayName: 'Flash Driver',
            role: 'driver',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Set driver document
        await db.collection('drivers').doc(driverUser.uid).set({
            uid: driverUser.uid,
            name: 'Flash Driver',
            email: 'driver@flashfit.com',
            phone: '+919876543210',
            isOnline: false,
            status: 'offline',
            totalDeliveries: 0,
            rating: 4.8,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 3. Delete John Driver if exists
        console.log('\nDeleting old drivers...');
        const driversSnapshot = await db.collection('drivers').get();
        for (const doc of driversSnapshot.docs) {
            const data = doc.data();
            if (data.name === 'John Driver' || data.email === 'john@flashfit.com') {
                await doc.ref.delete();
                try {
                    await admin.auth().deleteUser(doc.id);
                } catch (e) { }
                console.log('✅ Deleted John Driver');
            }
        }

        // 4. Create test customer
        console.log('\nCreating test customer...');
        let customerUser;
        try {
            customerUser = await admin.auth().getUserByEmail('test@flashfit.com');
            console.log('✅ Test customer already exists');
        } catch (error) {
            customerUser = await admin.auth().createUser({
                email: 'test@flashfit.com',
                password: 'test123456',
                displayName: 'Test Customer'
            });
            console.log('✅ Test customer created');
        }

        await db.collection('users').doc(customerUser.uid).set({
            uid: customerUser.uid,
            email: 'test@flashfit.com',
            displayName: 'Test Customer',
            role: 'customer',
            totalOrders: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log('\n🎉 User setup complete!');
        console.log('\n📝 Login Credentials:');
        console.log('   Admin:    admin@flashfit.com / admin123456');
        console.log('   Driver:   driver@flashfit.com / driver123456');
        console.log('   Customer: test@flashfit.com / test123456');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

setupUsers();
