const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");

// Initialize Firebase Admin (Check if already initialized)
if (!admin.apps.length) {
    const serviceAccount = require("./service-account.json");
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

const db = getFirestore();

// --- CONFIGURATION ---
const CATEGORIES = [
    {
        name: "Women",
        slug: "women",
        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
        description: "Elegant and trendy styles for her."
    },
    {
        name: "Men",
        slug: "men",
        image: "https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&q=80",
        description: "Sharp looks for the modern man."
    },
    {
        name: "Kids",
        slug: "kids",
        image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=800&q=80",
        description: "Comfortable and cool fits for the little ones."
    },
    {
        name: "Urban Style",
        slug: "urban-style",
        image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
        description: "Streetwear essentials for the city."
    },
    {
        name: "Accessories",
        slug: "accessories",
        image: "https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800&q=80",
        description: "The perfect finishing touches."
    },
    {
        name: "Everyday",
        slug: "everyday",
        image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80",
        description: "Daily essentials, elevated."
    },
    {
        name: "Last-Minute",
        slug: "last-minute",
        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=800&q=80",
        description: "Quick picks for urgent needs."
    }
];

const PRODUCTS_PER_CATEGORY = 8;

async function seedData() {
    console.log("🚀 Starting Seed V4: The No Mercy Update...");

    try {
        // 1. Clear existing Products and Categories
        console.log("🗑️  Clearing old data...");
        const productsSnapshot = await db.collection("products").get();
        const deleteProductPromises = productsSnapshot.docs.map((doc) => doc.ref.delete());
        await Promise.all(deleteProductPromises);

        const categoriesSnapshot = await db.collection("categories").get();
        const deleteCategoryPromises = categoriesSnapshot.docs.map((doc) => doc.ref.delete());
        await Promise.all(deleteCategoryPromises);
        console.log("✅ Old data cleared.");

        // 2. Seed Categories
        console.log("📂 Seeding Categories...");
        for (const cat of CATEGORIES) {
            await db.collection("categories").doc(cat.slug).set(cat);
        }
        console.log("✅ Categories seeded.");

        // 3. Seed Products
        console.log("📦 Seeding Products...");
        const batch = db.batch();
        let productCount = 0;

        for (const cat of CATEGORIES) {
            for (let i = 1; i <= PRODUCTS_PER_CATEGORY; i++) {
                const isLowStock = Math.random() > 0.7; // 30% chance of low stock
                const stock = isLowStock ? Math.floor(Math.random() * 5) + 1 : Math.floor(Math.random() * 50) + 10;

                const productRef = db.collection("products").doc();
                const product = {
                    id: productRef.id,
                    title: `${cat.name} Item ${i}`,
                    description: `Premium ${cat.name.toLowerCase()} item, perfect for your collection.`,
                    price: Math.floor(Math.random() * 2000) + 500,
                    originalPrice: Math.floor(Math.random() * 3000) + 2500,
                    image: `${cat.image}&auto=format&fit=crop&w=500&h=625`, // 4:5 Aspect Ratio
                    category: cat.slug,
                    stock: stock,
                    rating: (Math.random() * 2 + 3).toFixed(1), // 3.0 to 5.0
                    reviews: Math.floor(Math.random() * 100),
                    isNew: i <= 2,
                    pincodes: ["400059"], // Default serviceable pincode
                    createdAt: admin.firestore.FieldValue.serverTimestamp(),
                };

                batch.set(productRef, product);
                productCount++;
            }
        }

        await batch.commit();
        console.log(`✅ ${productCount} Products seeded.`);
        console.log("🎉 Seed V4 Complete!");

    } catch (error) {
        console.error("❌ Error seeding data:", error);
    }
}

seedData();
