# Connect Everything: End-to-End Integration Guide

This guide explains how to connect all components of the FlashFit platform and verify the end-to-End flow.

## 1. Prerequisites

Ensure you have the following running:
1.  **Firebase Backend**: Deployed or running locally via emulators.
2.  **Web Customer App**: Running on `localhost:3000`.
3.  **Web Admin Dashboard**: Running on `localhost:3001` (or similar).
4.  **Mobile Apps**: Running via Expo Go (requires physical device or simulator).

## 2. Environment Setup

### Backend
- Ensure `functions/index.ts` is deployed.
- Set Razorpay keys in Firebase config:
  ```bash
  firebase functions:config:set razorpay.key_id="YOUR_KEY" razorpay.key_secret="YOUR_SECRET"
  ```

### Web Customer App
- Copy `.env.example` to `.env.local`.
- Fill in your Firebase config keys.
- Run: `npm run dev`

### Web Admin Dashboard
- Copy `.env.example` to `.env.local`.
- Fill in your Firebase config keys.
- Run: `npm run dev`

### Mobile Apps (Customer & Driver)
- Update `firebaseConfig.ts` in both `app-customer` and `app-driver` with your actual Firebase keys.
- Run: `npx expo start`

## 3. Verification Steps

### Step A: Seed Data
1.  Navigate to `seed-data` directory.
2.  Run `npm run seed` to populate Firestore with Products, Stores, and Drivers.

### Step B: Customer Flow (Web)
1.  Open Customer Web App.
2.  Browse products and add items to cart.
3.  Proceed to Checkout.
4.  Enter address and click "Pay Now".
5.  **Verify**:
    - Razorpay modal opens.
    - After success, you are redirected to Order Tracking page.
    - Order status shows "Pending" or "Placed".

### Step C: Driver Assignment (Backend)
1.  The `autoAssignDriver` Cloud Function should trigger automatically upon payment.
2.  **Verify**:
    - In Firestore, the Order document `status` changes to `assigned`.
    - `driverId` field is populated.

### Step D: Driver Flow (Simulation)
1.  Navigate to `simulator` directory.
2.  Run `npm start` to simulate a driver moving.
3.  **Verify**:
    - In Customer App (Tracking Page), the driver marker moves on the map.
    - In Admin Dashboard, the driver location updates.

### Step E: Admin Monitoring
1.  Open Admin Dashboard.
2.  Login (use any email/pass for now as auth is stubbed or use Firebase Auth user).
3.  Go to **Orders** page.
4.  **Verify**:
    - The new order appears in the list.
    - Status reflects the current state (Assigned/Picked Up).

## 4. Troubleshooting

- **CORS Errors**: Ensure Cloud Functions are deployed correctly. The Firebase SDK `httpsCallable` handles CORS automatically, but if you use raw `fetch`, you need manual CORS handling.
- **Auth Errors**: Ensure you are logged in. The apps use anonymous auth or stubbed auth for MVP.
- **Map Not Loading**: Ensure Google Maps API key is enabled and restricted correctly in Google Cloud Console.
