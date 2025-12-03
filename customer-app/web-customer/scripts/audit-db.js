
const admin = require('firebase-admin');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
// Note: We assume the environment variables are set or we use the service account key if available.
// For this script, we'll try to use the default credentials or a mock check if running in a restricted env.

const serviceAccount = require('../serviceAccountKey.json');

initializeApp({
    credential: cert(serviceAccount)
});

const db = getFirestore();

async function auditDatabase() {
    console.log("🔍 Starting Database Audit...");

    try {
        // 1. Check Categories
        const categoriesSnap = await db.collection('categories').get();
        console.log(`\n📂 Categories Found: ${categoriesSnap.size}`);
        categoriesSnap.docs.forEach(doc => {
            console.log(`   - ${doc.id} (${doc.data().name})`);
        });

        // 2. Check Products
        const productsSnap = await db.collection('products').get();
        console.log(`\n📦 Total Products Found: ${productsSnap.size}`);

        // 3. Check Pincode Mapping
        const pincode = "400059";
        const serviceableProducts = productsSnap.docs.filter(doc => {
            const data = doc.data();
            return data.pincodes && Array.isArray(data.pincodes) && data.pincodes.includes(pincode);
        });

        console.log(`\n📍 Products available in ${pincode}: ${serviceableProducts.length}`);

        if (serviceableProducts.length === 0) {
            console.error("   ❌ CRITICAL: No products found for the default pincode!");
            console.log("   Checking first 3 products pincode structure:");
            productsSnap.docs.slice(0, 3).forEach(doc => {
                console.log(`   - ${doc.id}: pincodes = ${JSON.stringify(doc.data().pincodes)}`);
            });
        } else {
            console.log("   ✅ Pincode mapping looks good.");
        }

    } catch (error) {
        console.error("❌ Audit Failed:", error);
    }
}

auditDatabase();
