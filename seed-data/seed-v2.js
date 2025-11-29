const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

// Fix private key newlines
if (serviceAccount.private_key) {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'studio-847805730-4f392'
});

const db = admin.firestore();
const auth = admin.auth();

async function seedFirebaseV2() {
    console.log('\n🌱 Starting FlashFit Firebase Seeding V2 (Expanded Categories)...\n');

    try {
        // Step 1: Create Users (Ensure Driver Exists)
        console.log('👤 Verifying Users...');
        const users = [
            { email: 'admin@flashfit.com', password: 'admin123456', name: 'Admin User', role: 'admin' },
            { email: 'driver@flashfit.com', password: 'driver123456', name: 'John Driver', role: 'driver' },
            { email: 'test@flashfit.com', password: 'test123456', name: 'Test Customer', role: 'customer' }
        ];

        let driverUid = '';

        for (const user of users) {
            try {
                let userRecord;
                try {
                    userRecord = await auth.getUserByEmail(user.email);
                    console.log(`   User exists: ${user.email}`);
                } catch (e) {
                    userRecord = await auth.createUser({
                        email: user.email,
                        password: user.password,
                        displayName: user.name
                    });
                    console.log(`✅ Created: ${user.email}`);
                }

                if (user.role === 'driver') driverUid = userRecord.uid;

                // Ensure Firestore User Doc exists
                await db.collection('users').doc(userRecord.uid).set({
                    uid: userRecord.uid,
                    email: user.email,
                    displayName: user.name,
                    role: user.role,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                }, { merge: true });

            } catch (error) {
                console.error(`❌ Error processing ${user.email}:`, error.message);
            }
        }

        // Step 2: Clear Old Products
        console.log('\n📦 Clearing old products...');
        const productsRef = db.collection('products');
        const snapshot = await productsRef.get();
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        await batch.commit();
        console.log('✅ Old products cleared.');

        // Step 2.1: Clear Old Drivers
        console.log('\n🚚 Clearing old drivers...');
        const driversRef = db.collection('drivers');
        const driverSnapshot = await driversRef.get();
        const driverBatch = db.batch();
        driverSnapshot.docs.forEach((doc) => {
            driverBatch.delete(doc.ref);
        });
        await driverBatch.commit();
        console.log('✅ Old drivers cleared.');

        // Step 3: Add New Products
        console.log('\n📦 Adding Expanded Product Catalog...');

        const categories = {
            women: [
                { title: "Floral Summer Dress", price: 1599, image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500" },
                { title: "High Waist Mom Jeans", price: 1899, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500" },
                { title: "Oversized Boyfriend Blazer", price: 3499, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500" },
                { title: "Crop Top - Lavender", price: 699, image: "https://images.unsplash.com/photo-1583336630454-4474bc240311?w=500" },
                { title: "Satin Midi Skirt", price: 1299, image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500" }
            ],
            men: [
                { title: "Classic Oxford Shirt", price: 1499, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500" },
                { title: "Slim Fit Chinos", price: 1999, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=500" },
                { title: "Denim Jacket", price: 2499, image: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500" },
                { title: "Crew Neck Sweatshirt", price: 1299, image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500" },
                { title: "Linen Trousers", price: 2199, image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500" }
            ],
            kids: [
                { title: "Kids Denim Overalls", price: 1299, image: "https://images.unsplash.com/photo-1519238263496-63f82a0ef963?w=500" },
                { title: "Dino Print Tee", price: 499, image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500" },
                { title: "Cotton Shorts Set", price: 899, image: "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?w=500" },
                { title: "Party Frock - Pink", price: 1599, image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=500" },
                { title: "Hooded Jacket", price: 1199, image: "https://images.unsplash.com/photo-1519238263496-63f82a0ef963?w=500" }
            ],
            urban_style: [
                { title: "Oversized Graphic Hoodie", price: 2999, image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500" },
                { title: "Cargo Joggers", price: 2499, image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500" },
                { title: "Bucket Hat", price: 699, image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500" },
                { title: "Bomber Jacket", price: 3999, image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500" },
                { title: "Chunky Sneakers", price: 4999, image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500" }
            ],
            shaadi_closet: [
                { title: "Silk Sherwani", price: 15999, image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=500" },
                { title: "Embroidered Lehenga", price: 12499, image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500" },
                { title: "Kurta Pajama Set", price: 2999, image: "https://images.unsplash.com/photo-1622122201714-30783124d9b2?w=500" },
                { title: "Nehru Jacket", price: 3499, image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500" },
                { title: "Saree - Kanjivaram", price: 8999, image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500" }
            ],
            accessories: [
                { title: "Retro Sunglasses", price: 499, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500" },
                { title: "Leather Wallet", price: 999, image: "https://images.unsplash.com/photo-1627123424574-181ce90b94c0?w=500" },
                { title: "Silver Chain", price: 799, image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=500" },
                { title: "Snapback Cap - NY", price: 899, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500" },
                { title: "Digital Watch", price: 1499, image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=500" }
            ],
            gifting: [
                { title: "Luxury Perfume Set", price: 2499, image: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=500" },
                { title: "Tie & Cufflinks Box", price: 1299, image: "https://images.unsplash.com/photo-1591369822096-35c93e9d492d?w=500" },
                { title: "Handbag - Beige", price: 1999, image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=500" },
                { title: "Scented Candles", price: 599, image: "https://images.unsplash.com/photo-1602825389660-18882cd25172?w=500" },
                { title: "Gift Card ₹1000", price: 1000, image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=500" }
            ],
            everyday: [
                { title: "Basic White Tee", price: 499, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500" },
                { title: "Cotton Joggers", price: 999, image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500" },
                { title: "Polo T-Shirt", price: 799, image: "https://images.unsplash.com/photo-1626557981101-aae6f84aa6ff?w=500" },
                { title: "Shorts - Khaki", price: 699, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500" },
                { title: "Flip Flops", price: 299, image: "https://images.unsplash.com/photo-1621768216002-5ac171876625?w=500" }
            ],
            last_minute: [
                { title: "Ankle Socks (Pack of 5)", price: 499, image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500" },
                { title: "Cotton Boxers", price: 399, image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500" },
                { title: "Handkerchief Set", price: 199, image: "https://images.unsplash.com/photo-1596455607563-ad6193f76b17?w=500" },
                { title: "Face Mask (Pack of 3)", price: 149, image: "https://images.unsplash.com/photo-1586942593568-29361efcd571?w=500" },
                { title: "Shoe Laces - White", price: 99, image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=500" }
            ]
        };

        const reviews = [
            { user: "Alex K.", rating: 5, comment: "Absolutely love the fit! 🔥" },
            { user: "Sarah M.", rating: 4, comment: "Great quality, but shipping took a while." },
            { user: "Rahul D.", rating: 5, comment: "Best purchase ever." },
            { user: "Priya S.", rating: 5, comment: "Looks exactly like the picture." },
            { user: "Mike T.", rating: 3, comment: "Decent, but size runs large." }
        ];

        // Step 2.2: Seed Categories Collection
        console.log('\n📂 Seeding Categories...');
        const categoriesRef = db.collection('categories');
        const categorySnapshot = await categoriesRef.get();
        const categoryBatch = db.batch();
        categorySnapshot.docs.forEach((doc) => {
            categoryBatch.delete(doc.ref);
        });
        await categoryBatch.commit();
        console.log('✅ Old categories cleared.');

        for (const [slug, items] of Object.entries(categories)) {
            const categoryData = {
                name: slug.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                slug: slug,
                image: items[0].image, // Use first product image as category image
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('categories').doc(slug).set(categoryData);
            console.log(`   Created category: ${categoryData.name}`);
        }

        let count = 0;
        for (const [category, items] of Object.entries(categories)) {
            for (const item of items) {
                const product = {
                    ...item,
                    category: category,
                    stock: Math.floor(Math.random() * 80) + 20,
                    pincodes: ["400059"],
                    description: `Premium quality ${item.title.toLowerCase()} for your collection.`,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                };

                const docRef = await db.collection('products').add(product);

                // Add Reviews
                const numReviews = Math.floor(Math.random() * 3) + 1;
                for (let i = 0; i < numReviews; i++) {
                    const randomReview = reviews[Math.floor(Math.random() * reviews.length)];
                    await docRef.collection('reviews').add({
                        ...randomReview,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });
                }
                count++;
            }
        }
        console.log(`✅ Added ${count} products across ${Object.keys(categories).length} categories.`);

        // Step 4: Ensure Driver Document
        if (driverUid) {
            console.log('\n🚚 Verifying Driver Document...');
            await db.collection('drivers').doc(driverUid).set({
                name: 'John Driver',
                email: 'driver@flashfit.com',
                phone: '9876543210',
                isOnline: false,
                currentLocation: {
                    lat: 19.1663,
                    lng: 72.8526
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`✅ Driver document verified for UID: ${driverUid}`);
        }

        console.log('\n🎉 SEEDING V2 COMPLETE!\n');

    } catch (error) {
        console.error('\n❌ Fatal Error:', error);
    } finally {
        process.exit(0);
    }
}

seedFirebaseV2();
