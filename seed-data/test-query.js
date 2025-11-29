const admin = require('firebase-admin');
const serviceAccount = require('./service-account.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function testQuery() {
    console.log('Testing product queries...\n');

    // Test 1: All products
    const allProducts = await db.collection('products').get();
    console.log('✅ Total products:', allProducts.size);

    // Test 2: Men products
    const menProducts = await db.collection('products').where('category', '==', 'men').get();
    console.log('✅ Men products:', menProducts.size);

    // Test 3: Show first men product
    if (menProducts.size > 0) {
        const firstMen = menProducts.docs[0].data();
        console.log('\n📦 Sample Men Product:');
        console.log('   ID:', menProducts.docs[0].id);
        console.log('   Title:', firstMen.title);
        console.log('   Category:', firstMen.category);
        console.log('   Price:', firstMen.price);
        console.log('   Image:', firstMen.image?.substring(0, 50) + '...');
    }

    // Test 4: All categories
    const categories = await db.collection('categories').get();
    console.log('\n✅ Total categories:', categories.size);
    categories.docs.forEach(doc => {
        console.log('   -', doc.data().name, '(slug:', doc.data().slug + ')');
    });

    process.exit(0);
}

testQuery().catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
});
