const admin = require('firebase-admin');

// Initialize Firebase Admin with your project
// You can use Application Default Credentials or service account
const serviceAccount = require('./service-account.json');

// Fix private key newlines if they are escaped
if (serviceAccount.private_key) {
    console.log('Original Key Length:', serviceAccount.private_key.length);
    console.log('First 30 chars:', serviceAccount.private_key.substring(0, 30));
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    console.log('Fixed Key Length:', serviceAccount.private_key.length);
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'studio-847805730-4f392'
});

const db = admin.firestore();
const auth = admin.auth();

async function seedFirebase() {
    console.log('\n🌱 Starting FlashFit Firebase Seeding...\n');

    try {
        // Step 1: Create Users
        console.log('👤 Creating Users...');
        const users = [
            { email: 'admin@flashfit.com', password: 'admin123456', name: 'Admin User' },
            { email: 'driver@flashfit.com', password: 'driver123456', name: 'John Driver' },
            { email: 'test@flashfit.com', password: 'test123456', name: 'Test Customer' }
        ];

        let driverUid = '';
        for (const user of users) {
            try {
                const userRecord = await auth.createUser({
                    email: user.email,
                    password: user.password,
                    displayName: user.name
                });
                console.log(`✅ Created: ${user.email} (UID: ${userRecord.uid})`);
                if (user.email === 'driver@flashfit.com') {
                    driverUid = userRecord.uid;
                }
            } catch (error) {
                if (error.code === 'auth/email-already-exists') {
                    console.log(`⚠️  ${user.email} already exists`);
                    // Get existing user UID if it's the driver
                    if (user.email === 'driver@flashfit.com') {
                        const existingUser = await auth.getUserByEmail(user.email);
                        driverUid = existingUser.uid;
                        console.log(`   Using existing driver UID: ${driverUid}`);
                    }
                } else {
                    console.error(`❌ Error creating ${user.email}:`, error.message);
                }
            }
        }

        // Step 2: Add Products (Trendy Clothes Only)
        console.log('\n📦 Clearing old products...');
        const productsRef = db.collection('products');
        const snapshot = await productsRef.get();
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        console.log('✅ Old products cleared.');

        console.log('\n📦 Adding Products...');
        const products = [
            // Streetwear
            {
                title: "Urban Cargo Joggers",
                price: 2499,
                category: "streetwear",
                image: "https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=500",
                stock: 45,
                pincodes: ["400059"],
                description: "Tactical cargo joggers with multiple utility pockets and adjustable cuffs.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Graffiti Print Hoodie",
                price: 3299,
                category: "streetwear",
                image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500",
                stock: 30,
                pincodes: ["400059"],
                description: "Heavyweight hoodie featuring exclusive street art graphics.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Distressed Denim Jacket",
                price: 4599,
                category: "streetwear",
                image: "https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=500",
                stock: 20,
                pincodes: ["400059"],
                description: "Vintage wash denim jacket with distressed details and custom buttons.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Techwear Windbreaker",
                price: 3999,
                category: "streetwear",
                image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500",
                stock: 25,
                pincodes: ["400059"],
                description: "Water-resistant windbreaker with reflective details for the urban explorer.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Street Graphic Tee",
                price: 1499,
                category: "streetwear",
                image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=500",
                stock: 60,
                pincodes: ["400059"],
                description: "Bold graphic tee made from premium heavyweight cotton.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },

            // Oversized
            {
                title: "Essential Oversized Tee",
                price: 1299,
                category: "oversized",
                image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500",
                stock: 100,
                pincodes: ["400059"],
                description: "The perfect boxy fit tee for everyday comfort and style.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Baggy Dad Jeans",
                price: 2999,
                category: "oversized",
                image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500",
                stock: 40,
                pincodes: ["400059"],
                description: "Relaxed fit denim with a classic 90s silhouette.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Drop Shoulder Sweatshirt",
                price: 2199,
                category: "oversized",
                image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500",
                stock: 55,
                pincodes: ["400059"],
                description: "Cozy fleece sweatshirt with a trendy drop shoulder cut.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Oversized Flannel Shirt",
                price: 2499,
                category: "oversized",
                image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=500",
                stock: 35,
                pincodes: ["400059"],
                description: "Heavyweight flannel shirt, perfect for layering.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Boxy Fit Polo",
                price: 1899,
                category: "oversized",
                image: "https://images.unsplash.com/photo-1626557981101-aae6f84aa6ff?w=500",
                stock: 45,
                pincodes: ["400059"],
                description: "Modern take on the classic polo with a relaxed, boxy fit.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },

            // Gym Fits
            {
                title: "Performance Pump Cover",
                price: 1999,
                category: "gym_fits",
                image: "https://images.unsplash.com/photo-1517438476312-10d79c077509?w=500",
                stock: 70,
                pincodes: ["400059"],
                description: "Oversized hoodie designed to keep you warm until the pump hits.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Pro Compression Tee",
                price: 999,
                category: "gym_fits",
                image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=500",
                stock: 80,
                pincodes: ["400059"],
                description: "Moisture-wicking compression fabric for peak performance.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Training Shorts 5\"",
                price: 1499,
                category: "gym_fits",
                image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500",
                stock: 60,
                pincodes: ["400059"],
                description: "Lightweight shorts with a 5-inch inseam for maximum range of motion.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Muscle Stringer Vest",
                price: 799,
                category: "gym_fits",
                image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=500",
                stock: 90,
                pincodes: ["400059"],
                description: "Classic stringer vest to show off those gains.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Seamless Leggings",
                price: 1999,
                category: "gym_fits",
                image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500",
                stock: 50,
                pincodes: ["400059"],
                description: "High-waisted seamless leggings for squat-proof confidence.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },

            // Shaadi Closet (Traditional)
            {
                title: "Royal Silk Sherwani",
                price: 15999,
                category: "shaadi_closet",
                image: "https://images.unsplash.com/photo-1595341888016-a392ef81b7de?w=500",
                stock: 10,
                pincodes: ["400059"],
                description: "Hand-embroidered silk sherwani for the perfect groom look.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Floral Lehenga Choli",
                price: 12499,
                category: "shaadi_closet",
                image: "https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=500",
                stock: 15,
                pincodes: ["400059"],
                description: "Designer floral lehenga with intricate zari work.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Classic Kurta Pajama",
                price: 2999,
                category: "shaadi_closet",
                image: "https://images.unsplash.com/photo-1622122201714-30783124d9b2?w=500",
                stock: 40,
                pincodes: ["400059"],
                description: "Elegant cotton silk kurta pajama set for festive occasions.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Embroidered Nehru Jacket",
                price: 3499,
                category: "shaadi_closet",
                category: "urban_style",
                image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500",
                stock: 15,
                pincodes: ["400059"],
                description: "Water-resistant windbreaker with utility pockets.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Ripped Skinny Jeans",
                price: 2199,
                category: "urban_style",
                image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500",
                stock: 30,
                pincodes: ["400059"],
                description: "Distressed denim for the edgy urban look.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Flannel Overshirt",
                price: 1599,
                category: "urban_style",
                image: "https://images.unsplash.com/photo-1515347619252-60a6bf4fffce?w=500",
                stock: 40,
                pincodes: ["400059"],
                description: "Checkered flannel shirt, perfect for layering.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },

            // --- ACCESSORIES ---
            {
                title: "Cuban Link Chain - Silver",
                price: 799,
                category: "accessories",
                image: "https://images.unsplash.com/photo-1599643478518-17488fbbcd75?w=500",
                stock: 100,
                pincodes: ["400059"],
                description: "Stainless steel cuban chain, anti-tarnish.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Retro Sunglasses",
                price: 499,
                category: "accessories",
                image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=500",
                stock: 80,
                pincodes: ["400059"],
                description: "90s style rectangular sunglasses.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Compact Umbrella - Black",
                price: 599,
                category: "accessories",
                image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=500",
                stock: 50,
                pincodes: ["400059"],
                description: "Windproof compact umbrella for urban commute.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Snapback Cap - NY",
                price: 899,
                category: "accessories",
                image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500",
                stock: 60,
                pincodes: ["400059"],
                description: "Classic snapback cap with embroidery.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },

            // --- LAST MINUTE (Essentials) ---
            {
                title: "Cotton Boxers (Pack of 3)",
                price: 999,
                category: "last_minute",
                image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500",
                stock: 100,
                pincodes: ["400059"],
                description: "Premium cotton boxers for daily comfort.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Ankle Socks (Pack of 5)",
                price: 499,
                category: "last_minute",
                image: "https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=500",
                stock: 150,
                pincodes: ["400059"],
                description: "Breathable ankle socks, perfect for sneakers.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Cotton Handkerchiefs",
                price: 299,
                category: "last_minute",
                image: "https://images.unsplash.com/photo-1596455607563-ad6193f76b17?w=500",
                stock: 200,
                pincodes: ["400059"],
                description: "Soft cotton handkerchiefs.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },

            // --- EVERYDAY ---
            {
                title: "Basic White Tee",
                price: 499,
                category: "everyday",
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500",
                stock: 100,
                pincodes: ["400059"],
                description: "Essential white crew neck t-shirt.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Chino Shorts - Khaki",
                price: 899,
                category: "everyday",
                image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=500",
                stock: 60,
                pincodes: ["400059"],
                description: "Comfortable chino shorts for casual wear.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },

            // --- WOMEN ---
            {
                title: "Crop Top - Lavender",
                price: 699,
                category: "women",
                image: "https://images.unsplash.com/photo-1583336630454-4474bc240311?w=500",
                stock: 50,
                pincodes: ["400059"],
                description: "Ribbed crop top, perfect for summer.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "High Waist Mom Jeans",
                price: 1899,
                category: "women",
                image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=500",
                stock: 40,
                pincodes: ["400059"],
                description: "Vintage fit high waist jeans.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },

            // --- KIDS ---
            {
                title: "Kids Denim Overalls",
                price: 1299,
                category: "kids",
                image: "https://images.unsplash.com/photo-1519238263496-63f82a0ef963?w=500",
                stock: 25,
                pincodes: ["400059"],
                description: "Cute and durable denim overalls.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
            {
                title: "Printed T-Shirt - Dino",
                price: 499,
                category: "kids",
                image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=500",
                stock: 60,
                pincodes: ["400059"],
                description: "Fun dinosaur print t-shirt for kids.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },

            // --- CLEARANCE ---
            {
                title: "Summer Tank Top",
                price: 299,
                category: "clearance",
                image: "https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=500",
                stock: 10,
                pincodes: ["400059"],
                description: "Last season's stock. Grab it before it's gone.",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            },
        ];

        const reviews = [
            { user: "Alex K.", rating: 5, comment: "Absolutely love the fit! 🔥" },
            { user: "Sarah M.", rating: 4, comment: "Great quality, but shipping took a while." },
            { user: "Rahul D.", rating: 5, comment: "Best gym wear I've bought in India." },
            { user: "Priya S.", rating: 5, comment: "The oversized tee is perfect." },
            { user: "Mike T.", rating: 3, comment: "Decent, but size runs large." },
            { user: "Ankit P.", rating: 4, comment: "Good material, very comfortable." },
            { user: "Sneha R.", rating: 5, comment: "Will definitely buy again! 😍" }
        ];

        for (const product of products) {
            const docRef = await db.collection('products').add(product);
            console.log(`✅ Added: ${product.title}`);

            // Add 2-5 random reviews for each product
            const numReviews = Math.floor(Math.random() * 4) + 2;
            for (let i = 0; i < numReviews; i++) {
                const randomReview = reviews[Math.floor(Math.random() * reviews.length)];
                await docRef.collection('reviews').add({
                    ...randomReview,
                    createdAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }

        // Step 3: Create Driver Document
        if (driverUid) {
            console.log('\n🚚 Creating Driver Document...');
            await db.collection('drivers').doc(driverUid).set({
                name: 'John Driver',
                phone: '9876543210',
                isOnline: false,
                currentLocation: {
                    lat: 19.1663,
                    lng: 72.8526
                },
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            console.log(`✅ Driver document created for UID: ${driverUid}`);
        } else {
            console.log('\n⚠️  Could not create driver document (no UID found)');
        }

        // Success Summary
        console.log('\n🎉 SEEDING COMPLETE!\n');
        console.log('📝 Test Credentials:');
        console.log('   Customer: test@flashfit.com / test123456');
        console.log('   Admin:    admin@flashfit.com / admin123456');
        console.log('   Driver:   driver@flashfit.com / driver123456\n');
        console.log('🌐 Test Your Apps:');
        console.log('   Customer: http://localhost:3000');
        console.log('   Admin:    http://localhost:3001');
        console.log('   Driver:   http://localhost:8081\n');

    } catch (error) {
        console.error('\n❌ Fatal Error:', error);
    } finally {
        process.exit(0);
    }
}

// Run the seeding
seedFirebase();
