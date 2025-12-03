# How to Fix "No Products Found"

If your homepage is empty, follow these steps:

## 1. Check the Debug Page
Go to: `https://flashfit-nu.vercel.app/debug`

- **If "Total Products: 0"**: Your database is empty. You need to add products.
- **If "Pincodes: MISSING"**: Your products exist but don't have the `pincodes` field.

## 2. Add Dummy Products (If Empty)
You can use the Admin Dashboard to add products, or run a seed script.

### Quick Fix: Run Seed Script
I have created a seed script in `customer-app/web-customer/scripts/seed-products.js`.
Run it locally to populate your database:

```bash
cd customer-app/web-customer
node scripts/seed-products.js
```

*(Note: You need to set `FIREBASE_PRIVATE_KEY` in `.env.local` for this script to work locally)*

## 3. Fix Missing Pincodes
If you have products but they don't show up, they might be missing the `400059` pincode.
Update them in the Firebase Console:
1. Go to Firestore Database > `products` collection.
2. Edit a product.
3. Add a field `pincodes` (type: Array).
4. Add value `400059` (type: String).

---

# How to Fix "Order Failed"

If you can see products but cannot buy them:

## 1. Update Vercel Environment Variable
The `FIREBASE_PRIVATE_KEY` in Vercel is BROKEN.
1. Generate a NEW key from Firebase Console.
2. Copy the WHOLE string (including `-----BEGIN...`).
3. Paste it into Vercel > Settings > Environment Variables.
4. Redeploy.

This is the #1 cause of order failures.
