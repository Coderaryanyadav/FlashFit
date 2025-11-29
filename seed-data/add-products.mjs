// Simple script to add products using Firebase Web SDK
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCcO8q6G08EPk047pncwT0UdJLiDB3WJ6I",
    authDomain: "studio-847805730-4f392.firebaseapp.com",
    projectId: "studio-847805730-4f392",
    storageBucket: "studio-847805730-4f392.firebasestorage.app",
    messagingSenderId: "497323679456",
    appId: "1:497323679456:web:fef3f0e6e3af943969ba85"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleProducts = [
    {
        title: "Premium Cotton T-Shirt",
        price: 599,
        stock: 50,
        category: "Men's Fashion",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Slim Fit Jeans",
        price: 1299,
        stock: 30,
        category: "Men's Fashion",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Running Shoes",
        price: 2499,
        stock: 25,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Casual Shirt",
        price: 899,
        stock: 40,
        category: "Men's Fashion",
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500&h=500&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Sports Jacket",
        price: 1899,
        stock: 20,
        category: "Men's Fashion",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=500&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Backpack",
        price: 1499,
        stock: 35,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop",
        pincodes: ["400059"]
    }
];

async function addProducts() {
    console.log('Adding sample products to Firebase...\n');

    for (const product of sampleProducts) {
        try {
            const docRef = await addDoc(collection(db, 'products'), {
                ...product,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log(`✅ Added: ${product.title} (ID: ${docRef.id})`);
        } catch (error) {
            console.error(`❌ Error adding ${product.title}:`, error);
        }
    }

    console.log('\n✅ All products added successfully!');
    process.exit(0);
}

addProducts();
