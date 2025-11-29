// seed-firebase.js
// Run this script to seed your Firebase database with demo data
// Usage: node seed-firebase.js

const admin = require('firebase-admin');

// Initialize Firebase Admin (use your service account key)
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

async function seedDatabase() {
    console.log("🌱 Starting Firebase seeding...\n");

    // 1. Create Admin User
    try {
        const adminUser = await auth.createUser({
            email: 'admin@flashfit.com',
            password: 'admin123456',
            displayName: 'Admin User'
        });
        console.log("✅ Admin user created:", adminUser.email);
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            console.log("⚠️  Admin user already exists");
        } else {
            console.error("❌ Error creating admin:", error.message);
        }
    }

    // 2. Create Driver User
    try {
        const driverUser = await auth.createUser({
            email: 'driver@flashfit.com',
            password: 'driver123456',
            displayName: 'John Driver'
        });
        console.log("✅ Driver user created:", driverUser.email);

        // Create driver document
        await db.collection('drivers').doc(driverUser.uid).set({
            name: 'John Driver',
            phone: '9876543210',
            isOnline: false,
            currentLocation: {
                lat: 19.1663,
                lng: 72.8526
            },
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        console.log("✅ Driver document created");
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            console.log("⚠️  Driver user already exists");
        } else {
            console.error("❌ Error creating driver:", error.message);
        }
    }

    // 3. Create Customer User
    try {
        const customerUser = await auth.createUser({
            email: 'test@flashfit.com',
            password: 'test123456',
            displayName: 'Test User'
        });
        console.log("✅ Customer user created:", customerUser.email);
    } catch (error) {
        if (error.code === 'auth/email-already-exists') {
            console.log("⚠️  Customer user already exists");
        } else {
            console.error("❌ Error creating customer:", error.message);
        }
    }

    // 4. Add Sample Products
    const products = [
        {
            title: "Nike Running Shoes",
            price: 2999,
            category: "running",
            image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
            stock: 50,
            pincodes: ["400059"],
            description: "Premium running shoes for performance",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            title: "Gym Duffel Bag",
            price: 1499,
            category: "accessories",
            image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
            stock: 30,
            pincodes: ["400059"],
            description: "Spacious gym bag with multiple compartments",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            title: "Yoga Mat Premium",
            price: 899,
            category: "yoga",
            image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
            stock: 100,
            pincodes: ["400059"],
            description: "Non-slip, eco-friendly yoga mat",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            title: "Baggy Track Pants",
            price: 1999,
            category: "fashion",
            image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500",
            stock: 40,
            pincodes: ["400059"],
            description: "Comfortable street-style baggy pants",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            title: "Training Gloves",
            price: 699,
            category: "training",
            image: "https://images.unsplash.com/photo-1556817411-58c45dd94421?w=500",
            stock: 60,
            pincodes: ["400059"],
            description: "Durable training gloves with wrist support",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        },
        {
            title: "Sports Water Bottle",
            price: 399,
            category: "accessories",
            image: "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=500",
            stock: 200,
            pincodes: ["400059"],
            description: "1L insulated water bottle",
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }
    ];

    console.log("\n📦 Adding sample products...");
    for (const product of products) {
        await db.collection('products').add(product);
        console.log(`✅ Added: ${product.title}`);
    }

    console.log("\n🎉 Seeding complete!\n");
    console.log("📝 Demo Credentials:");
    console.log("   Admin:    admin@flashfit.com / admin123456");
    console.log("   Driver:   driver@flashfit.com / driver123456");
    console.log("   Customer: test@flashfit.com / test123456");
    console.log("\n✨ You can now test the platform!");

    process.exit(0);
}

seedDatabase().catch(console.error);
