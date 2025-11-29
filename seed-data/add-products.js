const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const sampleProducts = [
    {
        title: "Premium Cotton T-Shirt",
        price: 599,
        stock: 50,
        category: "Men's Fashion",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
        pincodes: ["400059"],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        title: "Slim Fit Jeans",
        price: 1299,
        stock: 30,
        category: "Men's Fashion",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500",
        pincodes: ["400059"],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        title: "Running Shoes",
        price: 2499,
        stock: 25,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        pincodes: ["400059"],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        title: "Casual Shirt",
        price: 899,
        stock: 40,
        category: "Men's Fashion",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500",
        pincodes: ["400059"],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        title: "Sports Jacket",
        price: 1899,
        stock: 20,
        category: "Men's Fashion",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500",
        pincodes: ["400059"],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    {
        title: "Backpack",
        price: 1499,
        stock: 35,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        pincodes: ["400059"],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
];

async function addProducts() {
    try {
        console.log('Adding sample products...');

        for (const product of sampleProducts) {
            const docRef = await db.collection('products').add(product);
            console.log(`✅ Added: ${product.title} (ID: ${docRef.id})`);
        }

        console.log('\n✅ All products added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding products:', error);
        process.exit(1);
    }
}

addProducts();
