/**
 * Firebase Seed Data Script
 * Run this in the browser console while on any FlashFit page
 * This will create demo accounts and sample products in Firebase
 */

// Step 1: Create Admin Account
// Go to http://localhost:3001/login and create account using Firebase Auth UI
// OR run this in console:
/*
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./utils/firebase";

createUserWithEmailAndPassword(auth, "admin@flashfit.com", "admin123456")
  .then(() => console.log("Admin created!"))
  .catch(err => console.error(err));
*/

// Step 2: Create Demo Products
// Copy and run this in browser console on localhost:3000:

const sampleProducts = [
    {
        title: "Nike Running Shoes",
        price: 2999,
        category: "running",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
        stock: 50,
        pincodes: ["400059"],
        description: "Premium running shoes for performance",
        createdAt: new Date()
    },
    {
        title: "Gym Duffel Bag",
        price: 1499,
        category: "accessories",
        image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
        stock: 30,
        pincodes: ["400059"],
        description: "Spacious gym bag with multiple compartments",
        createdAt: new Date()
    },
    {
        title: "Yoga Mat Premium",
        price: 899,
        category: "yoga",
        image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
        stock: 100,
        pincodes: ["400059"],
        description: "Non-slip, eco-friendly yoga mat",
        createdAt: new Date()
    },
    {
        title: "Baggy Track Pants",
        price: 1999,
        category: "fashion",
        image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500",
        stock: 40,
        pincodes: ["400059"],
        description: "Comfortable street-style baggy pants",
        createdAt: new Date()
    },
    {
        title: "Training Gloves",
        price: 699,
        category: "training",
        image: "https://images.unsplash.com/photo-1556817411-58c45dd94421?w=500",
        stock: 60,
        pincodes: ["400059"],
        description: "Durable training gloves with wrist support",
        createdAt: new Date()
    }
];

// To seed products, run in console:
/*
import { collection, addDoc } from "firebase/firestore";
import { db } from "./utils/firebase";

sampleProducts.forEach(async (product) => {
  await addDoc(collection(db, "products"), product);
  console.log("Added:", product.title);
});
*/

// Step 3: Create Driver Account
// Run this in console to create driver document:
/*
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "./utils/firebase";

async function createDriver() {
  const driverCred = await createUserWithEmailAndPassword(
    auth,
    "driver@flashfit.com",
    "driver123456"
  );

  await setDoc(doc(db, "drivers", driverCred.user.uid), {
    name: "John Driver",
    phone: "9876543210",
    isOnline: false,
    currentLocation: {
      lat: 19.1663,
      lng: 72.8526
    },
    createdAt: Date.now()
  });

  console.log("Driver created!");
}

createDriver();
*/
