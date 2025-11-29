// Add more realistic fashion products
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

const fashionProducts = [
    // Men's Clothing
    {
        title: "Classic White Oxford Shirt",
        price: 1299,
        stock: 45,
        category: "Men's Clothing",
        image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Navy Blue Blazer",
        price: 3499,
        stock: 20,
        category: "Men's Clothing",
        image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Black Leather Jacket",
        price: 4999,
        stock: 15,
        category: "Men's Clothing",
        image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Denim Jacket - Light Blue",
        price: 2299,
        stock: 30,
        category: "Men's Clothing",
        image: "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Graphic Print T-Shirt",
        price: 699,
        stock: 60,
        category: "Men's Clothing",
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Polo Shirt - Navy",
        price: 999,
        stock: 50,
        category: "Men's Clothing",
        image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },

    // Women's Clothing
    {
        title: "Floral Summer Dress",
        price: 1899,
        stock: 35,
        category: "Women's Clothing",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Black Evening Gown",
        price: 3999,
        stock: 12,
        category: "Women's Clothing",
        image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Casual Denim Skirt",
        price: 1299,
        stock: 40,
        category: "Women's Clothing",
        image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "White Linen Blouse",
        price: 1499,
        stock: 45,
        category: "Women's Clothing",
        image: "https://images.unsplash.com/photo-1564257577-a6e1d8c4c1c1?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Striped Midi Dress",
        price: 2199,
        stock: 28,
        category: "Women's Clothing",
        image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },

    // Footwear
    {
        title: "White Sneakers - Classic",
        price: 2999,
        stock: 50,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Black Formal Shoes",
        price: 3499,
        stock: 30,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Brown Leather Boots",
        price: 4299,
        stock: 20,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1605812860427-4024433a70fd?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Women's Heels - Red",
        price: 2799,
        stock: 25,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Canvas Slip-Ons",
        price: 1599,
        stock: 55,
        category: "Footwear",
        image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },

    // Accessories
    {
        title: "Leather Wallet - Brown",
        price: 899,
        stock: 70,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Aviator Sunglasses",
        price: 1299,
        stock: 45,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Leather Belt - Black",
        price: 799,
        stock: 60,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1624222247344-550fb60583f2?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Wrist Watch - Silver",
        price: 3999,
        stock: 25,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    },
    {
        title: "Canvas Tote Bag",
        price: 1199,
        stock: 40,
        category: "Accessories",
        image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=500&h=600&fit=crop",
        pincodes: ["400059"]
    }
];

async function addFashionProducts() {
    console.log('Adding fashion products to Firebase...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const product of fashionProducts) {
        try {
            const docRef = await addDoc(collection(db, 'products'), {
                ...product,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log(`✅ Added: ${product.title} (${product.category}) - ₹${product.price}`);
            successCount++;
        } catch (error) {
            console.error(`❌ Error adding ${product.title}:`, error.message);
            errorCount++;
        }
    }

    console.log(`\n✅ Successfully added ${successCount} products`);
    if (errorCount > 0) {
        console.log(`❌ Failed to add ${errorCount} products`);
    }
    process.exit(0);
}

addFashionProducts();
