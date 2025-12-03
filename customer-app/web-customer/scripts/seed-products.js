
const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // You might need to point this to your key file

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

const dummyProducts = [
    {
        title: "Urban Oversized Tee",
        price: 1299,
        description: "Premium cotton oversized t-shirt for the urban explorer.",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80",
        category: "urban-style",
        pincodes: ["400059", "400060"],
        stock: 50,
        rating: 4.8
    },
    {
        title: "Cargo Joggers",
        price: 2499,
        description: "Functional and stylish cargo joggers with multiple pockets.",
        image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=800&q=80",
        category: "urban-style",
        pincodes: ["400059"],
        stock: 30,
        rating: 4.5
    },
    {
        title: "Minimalist Hoodie",
        price: 3999,
        description: "Heavyweight fleece hoodie in neutral tones.",
        image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80",
        category: "everyday",
        pincodes: ["400059", "400062"],
        stock: 20,
        rating: 4.9
    }
];

async function seed() {
    console.log("🌱 Seeding products...");
    const batch = db.batch();

    for (const product of dummyProducts) {
        const ref = db.collection('products').doc();
        batch.set(ref, product);
    }

    await batch.commit();
    console.log("✅ Added 3 dummy products with pincode 400059");
}

seed().catch(console.error);
