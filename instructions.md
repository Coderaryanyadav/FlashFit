🚀 Project Name

FlashFit — 60-Minute Hyperlocal Clothes Delivery Platform

This file tells the AI exactly how to generate code for FlashFit.
Always follow these rules unless explicitly changed by the user.

🧱 1. TECHNOLOGY STACK
Frontend (3 Apps)

Next.js 14 / App Router

TypeScript

Tailwind CSS

shadcn/ui (Admin Dashboard only)

Google Maps JavaScript SDK

Firebase Web SDK v9+

Backend

Firebase Auth

Cloud Firestore

Cloud Functions (TypeScript)

Firebase Hosting

Firebase Storage

Payments

Razorpay

Deployment

Vercel (all Next.js apps)

Firebase (backend + hosting)

📁 2. PROJECT STRUCTURE (MANDATORY)

The AI must maintain this exact structure:

flashfit/
│
├── customer-app/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── firebase/
│
├── driver-app/
│   ├── app/
│   ├── components/
│
├── admin-dashboard/
│   ├── app/
│   ├── components/
│   ├── shadcn/
│
└── backend/
    ├── functions/
    │   └── index.ts
    ├── firestore.rules

🗄️ 3. FIRESTORE DATABASE SCHEMA (STRICT)

The AI must always use these collections + fields:

users
id, name, phone, role (customer/driver/admin), createdAt

drivers
id, userId, isOnline, currentLocation { lat, lng },
currentOrderId, vehicleNo, updatedAt

stores
id, name, address, description, location { lat, lng },
bannerImage, active

products
id, storeId, name, description, price, imageUrl,
category, inStock, deliveryTimeEstimate

orders
id, customerId, storeId, items[],
status (pending/assigned/picked_up/on_the_way/delivered/cancelled),
driverId, createdAt,
tracking { driverLocation { lat,lng } }

🔄 4. ORDER FLOW (MUST IMPLEMENT)
Customer App

Browse → Add to cart → Checkout

Razorpay payment

Order created with status "pending"

Live tracking with Google Maps

Admin Dashboard

View pending orders

Assign a driver manually

Update order status

Driver App

Go online/offline

Accept assigned orders

Update status → picked_up → on_the_way → delivered

Send GPS using navigator.geolocation.watchPosition every 3–5s

📡 5. LIVE GPS TRACKING CODE (MANDATORY)
Driver updates:
navigator.geolocation.watchPosition((pos) => {
  updateDoc(doc(db, "drivers", driverId), {
    currentLocation: {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    },
    updatedAt: Date.now()
  });
});

Customer/Admin listens:
onSnapshot(doc(db, "drivers", driverId), (snap) => {
  setDriverLocation(snap.data().currentLocation);
});

Map:

Use Google Maps JavaScript SDK

Show customer marker + driver marker + polyline route

🖼️ 6. UI REQUIREMENTS
Customer App

Clothing eCommerce design

Neon Green (#39FF14), black, white

Product grid + product cards

Checkout page

Order tracking page with live map

Smooth animations

Driver App

Mobile-first

Simple order list

Online/offline toggle

Live map + large buttons

Admin Dashboard

shadcn UI

Sidebar

Orders table

Driver list (with real-time location)

Store management

Analytics (orders, drivers, delivery times, revenue)

☁️ 7. CLOUD FUNCTIONS TO GENERATE

File: backend/functions/index.ts

Required Functions:

onOrderCreate

assignDriver(orderId, driverId)

onDriverLocationUpdate

razorpayCreateOrder

razorpayVerifySignature

Behaviors:

Create 60-min deadline

Validate driver availability

Update driver + order

Recalculate ETA

Update Firestore

🔐 8. FIREBASE SECURITY RULES (STRICT)

The AI must enforce:

Customers → only their own orders

Drivers → only assigned orders

Admin → full access

Validate roles

Prevent driver from editing unrelated orders

Prevent customer from editing other users

Rules file: backend/firestore.rules

🚀 9. DEPLOYMENT REQUIREMENTS
Vercel:

customer-app

driver-app

admin-dashboard

Firebase:

Cloud Functions

Firestore rules

Hosting optional

Environment variables required:

NEXT_PUBLIC_FIREBASE_*

GOOGLE_MAPS_API_KEY

RAZORPAY_KEY_ID

RAZORPAY_SECRET

🧪 10. SEED DATA REQUIREMENTS

The AI must generate:

5 stores

20 clothing products

3 driver accounts

10 sample orders

Used for demos & testing.

📚 11. AI BEHAVIOR RULES

When generating code:

DO:

✔ Follow project structure
✔ Write maintainable TypeScript
✔ Use modern Next.js App Router
✔ Use Firestore modular SDK
✔ Add comments explaining logic
✔ Keep UI clean and responsive

DON'T:

✘ Do not change architecture
✘ Do not rename folders
✘ Do not skip features
✘ Do not use outdated Firebase v8 SDK
✘ Do not invent new fields in Firestore
folder structure flashfit/
│
├── README.md
├── instructions.md
├── .gitignore
├── package.json
├── seed-data/
│   └── seed.json
├── env.example
│
├── customer-app/
│   ├── README.md
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── product/[id]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── order/[id]/page.tsx
│   ├── components/
│   ├── firebase/
│   │   └── client.ts
│   ├── lib/
│       └── utils.ts
│
├── driver-app/
│   ├── README.md
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── app/
│   │   ├── login/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── order/[id]/page.tsx
│   ├── components/
│   ├── firebase/
│       └── client.ts
│
├── admin-dashboard/
│   ├── README.md
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── app/
│   │   ├── login/page.tsx
│   │   ├── orders/page.tsx
│   │   ├── drivers/page.tsx
│   │   ├── stores/page.tsx
│   │   ├── analytics/page.tsx
│   ├── components/
│   ├── shadcn/
│   ├── firebase/
│       └── client.ts
│
└── backend/
    ├── firestore.rules
    ├── functions/
    │   ├── index.ts
    │   ├── tsconfig.json
    │   ├── package.json
    └── README.md

These instructions MUST be followed exactly.
AI tools (Cursor, Copilot, Replit Agent, ChatGPT Code Interpreter) must generate the FlashFit project strictly based on this document.

1. 📦 PROJECT OVERVIEW

Build a complete 60-minute clothes delivery platform with:

Customer Web App (Next.js 14 + TypeScript + Tailwind)

Driver Mobile Web App (Next.js + Tailwind)

Admin Dashboard (Next.js + Tailwind + shadcn/ui)

Firebase Backend (Auth, Firestore, Cloud Functions, Storage)

Live GPS Tracking (Google Maps JS SDK + Firestore listeners)

Payments (Razorpay)

Deployments (Vercel + Firebase)

2. 🗂️ MANDATORY PROJECT STRUCTURE

The AI must create this EXACT folder structure:

flashfit/
│
├── README.md
├── instructions.md
├── env.example
├── seed-data/ (starter data)
│   └── seed.json
│
├── customer-app/
│   ├── app/
│   ├── components/
│   ├── firebase/
│   ├── lib/
│
├── driver-app/
│   ├── app/
│   ├── components/
│   ├── firebase/
│
├── admin-dashboard/
│   ├── app/
│   ├── components/
│   ├── shadcn/
│   ├── firebase/
│
└── backend/
    ├── functions/
    │   └── index.ts
    ├── firestore.rules


Do NOT modify this structure.
Do NOT rename any folders.

3. 🔥 FIRESTORE DATABASE SCHEMA (STRICT)

AI must use only these fields:

users
id, name, phone, role (customer/driver/admin), createdAt

drivers
id, userId, isOnline, currentLocation {lat,lng},
currentOrderId, vehicleNo, updatedAt

stores
id, name, address, description,
location {lat,lng}, bannerImage, active

products
id, storeId, name, description, price,
imageUrl, category, inStock, deliveryTimeEstimate

orders
id, customerId, storeId, items[],
status (pending/assigned/picked_up/on_the_way/delivered/cancelled),
driverId, createdAt,
tracking { driverLocation {lat,lng} }


The AI must not add extra fields.

4. 🔁 ORDER FLOW — REQUIRED LOGIC
Customer App

Browse products

Add to cart

Checkout

Pay via Razorpay

Create order → status: "pending"

Track order live on map

Admin Dashboard

View pending orders

Assign driver manually

Update order status

Driver App

Login → go online/offline

Accept assigned order

Update status (picked_up, on_the_way, delivered)

Send GPS location continuously

5. 🗺️ LIVE GPS TRACKING (MANDATORY CODE)
Driver location updates:
navigator.geolocation.watchPosition((pos) => {
  updateDoc(doc(db, "drivers", driverId), {
    currentLocation: {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude
    },
    updatedAt: Date.now()
  });
});

Customer/Admin listener:
onSnapshot(doc(db, "drivers", driverId), (snap) => {
  setDriverLocation(snap.data().currentLocation);
});

Map Requirements:

Google Maps JavaScript SDK

Customer marker

Driver marker

Polyline route

Auto-update position

6. 🎨 UI RULES
Customer App

Modern clothing eCommerce UI

Neon Green (#39FF14) + black + white theme

Product grid

Product cards

Checkout

Order tracker with map

Driver App

Mobile-first layout

Large buttons

Online/offline toggle

Assigned orders list

Live map

Admin Dashboard

Use shadcn/ui

Sidebar

Orders table

Drivers list (with live locations)

Stores page

Analytics dashboard

7. ☁️ CLOUD FUNCTIONS (backend/functions/index.ts)

AI must implement EXACTLY these functions:

onOrderCreate

assignDriver(orderId, driverId)

onDriverLocationUpdate

razorpayCreateOrder

razorpayVerifySignature

Requirements:

Validate roles

Validate driver availability

Update order + driver state

Recalculate ETA

Update order tracking

8. 🔐 FIREBASE SECURITY RULES (STRICT)

AI must enforce:

Customers:

Can read/write only their own orders

Drivers:

Can read/write only assigned orders

Admin:

Full read/write access

Rules:

No user can modify other users

No customer can modify driver docs

No driver can modify unrelated orders

9. 🚀 DEPLOYMENT RULES
Vercel (each app separately)

customer-app → Vercel

driver-app → Vercel

admin-dashboard → Vercel

Firebase

Deploy functions

Deploy Firestore rules

Environment variables

AI must include .env.example with:

NEXT_PUBLIC_FIREBASE_*
GOOGLE_MAPS_API_KEY
RAZORPAY_KEY_ID
RAZORPAY_SECRET

10. 🧪 SEED DATA

AI must generate:

5 stores

20 clothing products

3 driver accounts

10 sample orders

Stored in seed-data/seed.json.

11. ⚙️ AI BEHAVIOR RULES
The AI MUST:

✔ Follow this file exactly
✔ Build production-grade code
✔ Use TypeScript everywhere
✔ Use modular Firebase SDK
✔ Use App Router in Next.js
✔ Use Tailwind on all apps
✔ Use shadcn on admin dashboard

The AI MUST NOT:

✘ Change the folder structure
✘ Modify field names
✘ Add new fields to Firestore
✘ Use Firebase v8 (ONLY v9 modular)
✘ Use React Router (Next.js only)
✘ Add random libraries not mentioned

12. 🎯 PURPOSE OF THIS FILE

This file is the single source of truth.

Any AI agent MUST read this file and generate the full FlashFit production codebase exactly as described.