# ⚡ FASTEST Firebase Setup - 2 Minutes

## Step 1: Create Users (30 seconds)

Go to [Firebase Console](https://console.firebase.google.com) → Your Project → Authentication → Users → Add User

Create these 3 users:
```
Email: admin@flashfit.com     Password: admin123456
Email: driver@flashfit.com    Password: driver123456  
Email: test@flashfit.com      Password: test123456
```

**IMPORTANT**: Copy the UID of the driver user (you'll need it in Step 2)

---

## Step 2: Run Seed Script (1 minute)

1. Open http://localhost:3000 in your browser
2. Open DevTools: Press `F12` or `Cmd+Option+I`
3. Go to **Console** tab
4. Copy and paste this ENTIRE script:

```javascript
// ========== FLASHFIT SEED SCRIPT ==========
// Paste this in browser console on localhost:3000

(async function() {
  console.log("🌱 Starting FlashFit Seed...");
  
  // Get Firebase from window (already loaded)
  const { collection, addDoc, doc, setDoc, serverTimestamp } = window.firebase.firestore;
  const db = window.firebase.db;
  
  // CHANGE THIS: Replace with your driver's UID from Firebase Console
  const DRIVER_UID = "PASTE_DRIVER_UID_HERE";
  
  // Sample Products
  const products = [
    {
      title: "Nike Running Shoes",
      price: 2999,
      category: "running",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500",
      stock: 50,
      pincodes: ["400059"],
      description: "Premium running shoes for performance",
      createdAt: serverTimestamp()
    },
    {
      title: "Yoga Mat Premium",
      price: 899,
      category: "yoga",
      image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500",
      stock: 100,
      pincodes: ["400059"],
      description: "Non-slip, eco-friendly yoga mat",
      createdAt: serverTimestamp()
    },
    {
      title: "Baggy Track Pants",
      price: 1999,
      category: "fashion",
      image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500",
      stock: 40,
      pincodes: ["400059"],
      description: "Comfortable street-style baggy pants",
      createdAt: serverTimestamp()
    },
    {
      title: "Gym Duffel Bag",
      price: 1499,
      category: "accessories",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500",
      stock: 30,
      pincodes: ["400059"],
      description: "Spacious gym bag",
      createdAt: serverTimestamp()
    },
    {
      title: "Training Gloves",
      price: 699,
      category: "training",
      image: "https://images.unsplash.com/photo-1556817411-58c45dd94421?w=500",
      stock: 60,
      pincodes: ["400059"],
      description: "Durable training gloves",
      createdAt: serverTimestamp()
    }
  ];

  // Add Products
  console.log("📦 Adding products...");
  for (const product of products) {
    await addDoc(collection(db, "products"), product);
    console.log(`✅ Added: ${product.title}`);
  }

  // Add Driver Document
  console.log("🚚 Creating driver document...");
  await setDoc(doc(db, "drivers", DRIVER_UID), {
    name: "John Driver",
    phone: "9876543210",
    isOnline: false,
    currentLocation: {
      lat: 19.1663,
      lng: 72.8526
    },
    createdAt: serverTimestamp()
  });
  console.log("✅ Driver document created!");

  console.log("\n🎉 SETUP COMPLETE!\n");
  console.log("You can now test:");
  console.log("- Customer App: http://localhost:3000");
  console.log("- Admin: http://localhost:3001 (login: admin@flashfit.com)");
  console.log("- Driver: http://localhost:8081 (login: driver@flashfit.com)");
})();
```

**BEFORE RUNNING**: Replace `PASTE_DRIVER_UID_HERE` with the actual UID you copied in Step 1!

---

## Step 3: Test It!

Refresh the pages:
- **localhost:3000** - Should show 5 products
- **localhost:3001** - Login as admin
- **localhost:8081** - Login as driver (should work now!)

---

## ⚠️ If Script Fails

**Error: "firebase is not defined"**
- Make sure you're on `localhost:3000` (not 3001 or 8081)
- Wait for page to fully load before pasting script

**Error: "collection is not a function"**
- Refresh the page and try again
- Make sure the customer app loaded properly

**Still not working?**
- Go to Firebase Console → Firestore Database
- Manually create:
  1. Collection `products`
  2. Collection `drivers`
  3. Add documents using the JSON from the script

---

## 📝 Quick Reference

**Test Accounts:**
```
Customer: test@flashfit.com / test123456
Admin:    admin@flashfit.com / admin123456
Driver:   driver@flashfit.com / driver123456
```

**Delivery Pincode:** 400059

**Ports:**
- Customer: 3000
- Admin: 3001
- Driver: 8081
