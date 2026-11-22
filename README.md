# ⚡ FlashFit — Ultra-Fast 60-Minute Fashion Delivery Platform

[![Turborepo](https://img.shields.io/badge/monorepo-Turborepo-000?logo=turborepo)](https://turbo.build)
[![Next.js](https://img.shields.io/badge/framework-Next.js%2014%20(App%20Router)-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/backend-Firebase%20%2F%20Firestore-orange?logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/styling-Tailwind_CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com)
[![Deployment](https://img.shields.io/badge/deployed_on-Vercel-black?logo=vercel)](https://vercel.com)
[![Status](https://img.shields.io/badge/audit_status-VERIFIED_PASSING-brightgreen)]()

FlashFit is an ultra-fast, on-demand quick-commerce fashion platform that delivers sportswear, activewear, and gym apparel directly to consumers in under **60 minutes**. Built as an enterprise-grade Turborepo monorepo with Next.js 14 App Router, Firebase/Firestore, Zustand state management, and real-time delivery tracking.

---

## 🌐 Live Production Deployments (Vercel)

All micro-frontends are deployed live to Vercel production edge infrastructure:

| Application | Domain / Live URL | Mirror / Alias URL | HTTP Status | Role |
| :--- | :--- | :--- | :---: | :--- |
| **🛍️ Customer Storefront** | [https://flash-fit-web-customer.vercel.app](https://flash-fit-web-customer.vercel.app) | [https://flashfit-customer-web.vercel.app](https://flashfit-customer-web.vercel.app) | `200 OK` | Product catalog, cart, checkout, live order tracking |
| **📊 Admin Operations Dashboard** | [https://flashfit-admin.vercel.app](https://flashfit-admin.vercel.app) | — | `200 OK` | Inventory management, orders dispatch, fleet management |
| **🛵 Driver Delivery Portal** | [https://flashfit-drivers.vercel.app](https://flashfit-drivers.vercel.app) | [https://flashfit-driver-web.vercel.app](https://flashfit-driver-web.vercel.app) | `200 OK` | Order dispatching, turn-by-turn routing, OTP delivery confirmation |

---

## 📐 System Architecture Diagram

```mermaid
flowchart TD
    subgraph Clients["Micro-Frontend Client Applications"]
        CustApp["Customer Web App\n(Next.js 14 / Port 3000)\nflash-fit-web-customer.vercel.app"]
        AdminApp["Admin Dashboard\n(Next.js 14 / Port 3001)\nflashfit-admin.vercel.app"]
        DriverApp["Driver Portal\n(Next.js 14 / Port 3002)\nflashfit-drivers.vercel.app"]
        SellerApp["Seller Portal\n(Next.js 14 / Port 3003)"]
    end

    subgraph EdgeLayer["Edge & Deployment Infrastructure"]
        VercelCDN["Vercel Global Edge Network / CDN"]
        NextAPIs["Next.js Route Handlers / Serverless Functions"]
    end

    subgraph Shared["Shared Monorepo Packages"]
        SharedTypes["@flashfit/types\n(TypeScript Domain Interfaces & Models)"]
    end

    subgraph CloudServices["Backend & Third-Party Services"]
        FBAuth["Firebase Authentication\n(Identity & Session Management)"]
        Firestore["Cloud Firestore\n(Real-Time NoSQL Database)"]
        FBStorage["Cloud Storage\n(Media, Invoices & Assets)"]
        CloudFunc["Firebase Cloud Functions\n(Node.js / TypeScript Webhooks)"]
        Razorpay["Razorpay Payment Gateway\n(Checkout & Verification)"]
    end

    CustApp --> VercelCDN
    AdminApp --> VercelCDN
    DriverApp --> VercelCDN
    SellerApp --> VercelCDN

    VercelCDN --> NextAPIs
    CustApp -.-> SharedTypes
    AdminApp -.-> SharedTypes
    DriverApp -.-> SharedTypes
    SellerApp -.-> SharedTypes

    NextAPIs --> FBAuth
    NextAPIs --> Firestore
    NextAPIs --> Razorpay
    CustApp --> Firestore
    DriverApp --> Firestore
    AdminApp --> Firestore
    CloudFunc --> Firestore
    NextAPIs --> FBStorage
```

---

## ⚡ 60-Minute Order Lifecycle & Delivery Workflow

```mermaid
sequenceDiagram
    autonumber
    actor Customer as Customer
    participant CustApp as Customer App
    participant Firestore as Cloud Firestore
    participant Admin as Admin / Dispatcher
    participant Driver as Driver Portal
    actor Rider as Delivery Partner

    Customer->>CustApp: Browse catalog & add items to cart
    Customer->>CustApp: Enter delivery address & pincode
    Customer->>CustApp: Checkout via Razorpay / COD
    CustApp->>Firestore: Create Order (status: "placed")
    Firestore-->>Admin: Real-time order alert via onSnapshot
    Admin->>Admin: Pack order at local micro-fulfillment dark store
    Admin->>Firestore: Update order (status: "ready_for_pickup")
    Firestore-->>Driver: Dispatch alert to nearby available drivers
    Rider->>Driver: Accept delivery assignment
    Driver->>Firestore: Update order (status: "assigned", driverId: rider.id)
    Rider->>Driver: Arrive at dark store & verify order
    Driver->>Firestore: Update order (status: "out_for_delivery")
    Firestore-->>CustApp: Real-time map update & ETA countdown
    Rider->>Customer: Arrive at delivery address (< 60 mins)
    Customer->>Rider: Provide delivery OTP
    Rider->>Driver: Enter OTP confirmation
    Driver->>Firestore: Update order (status: "delivered")
    Firestore-->>CustApp: Delivery confirmed & receipt generated
```

---

## 🔄 State Management & Real-Time Sync Flow

```mermaid
flowchart LR
    subgraph UI["React UI Components"]
        CatalogView["Product Catalog & Filters"]
        CartDrawer["Slide-over Cart"]
        OrderTracker["Live Order Tracker"]
    end

    subgraph State["Zustand Client Stores"]
        CartStore["useCartStore\n(Items, Totals, Discounts)"]
        AuthStore["useAuthStore\n(User, Session, Roles)"]
        LocationStore["useLocationStore\n(Pincode, Delivery Address)"]
    end

    subgraph DataSync["Sync Layer"]
        FirestoreListener["Firestore onSnapshot\n(Real-time Streams)"]
        APIClient["Next.js Fetch / Server Actions"]
    end

    subgraph DB["Firestore Collections"]
        ColProducts["products"]
        ColOrders["orders"]
        ColUsers["users"]
        ColCategories["categories"]
    end

    CatalogView --> APIClient
    APIClient --> ColProducts
    APIClient --> ColCategories
    CartDrawer --> CartStore
    OrderTracker --> FirestoreListener
    FirestoreListener <--> ColOrders
    AuthStore <--> ColUsers
```

---

## 📁 Repository Structure

```
FlashFit/
├── customer-app/
│   └── web-customer/              # Customer-facing storefront (Next.js 14)
│       ├── app/                   # App Router pages (/products, /cart, /checkout, /orders)
│       │   ├── api/               # Serverless API routes (/api/categories, /api/products, etc.)
│       │   └── layout.tsx         # Global layout with Navigation and Footer
│       ├── components/            # UI components (ProductCard, Navbar, CartDrawer, etc.)
│       ├── lib/                   # Utility helpers, Firebase config, and stores
│       └── __tests__/             # Jest unit and component test suites (50 passing tests)
├── admin-dashboard/
│   └── web-admin/                 # Operations dashboard (Next.js 14)
│       ├── app/                   # Order dispatch, inventory, driver monitoring
│       └── components/            # Data tables, metrics cards, driver maps
├── driver-app/
│   └── web-driver/                # Driver companion mobile-first web app (Next.js 14 / Capacitor)
│       ├── app/                   # Active deliveries, route navigation, OTP verification
│       └── components/            # Order claim cards, status sliders, camera scanner
├── seller-app/                    # Vendor portal for inventory catalog management (Next.js 14)
├── backend/
│   └── functions/                 # Firebase Cloud Functions (TypeScript)
├── packages/
│   └── types/                     # Shared domain models & TypeScript interfaces (@flashfit/types)
│       ├── src/
│       │   └── index.ts           # Product, CartItem, Order, User, Driver schemas
│       └── tsconfig.json
├── seed-data/                     # Database seed scripts for categories, products, and stores
├── REBUTTAL_AUDIT_REPORT.md       # Full engineering audit and rebuttal verification report
├── VERCEL_DEPLOYMENT_GUIDE.md     # Production deployment instructions and environment keys
├── turbo.json                     # Turborepo task orchestrator configuration
└── package.json                   # Root workspace manifest with monorepo scripts
```

---

## 💻 Local Port Mapping & Micro-Frontends

Every micro-frontend is assigned an isolated port to enable friction-free concurrent local development:

| Micro-Frontend | Directory | Local Port | Local URL | Role |
| :--- | :--- | :---: | :--- | :--- |
| **Customer App** | `customer-app/web-customer` | `3000` | [http://localhost:3000](http://localhost:3000) | Customer shopping experience, cart, checkout |
| **Admin Dashboard** | `admin-dashboard/web-admin` | `3001` | [http://localhost:3001](http://localhost:3001) | Inventory, order management, fleet dispatch |
| **Driver App** | `driver-app/web-driver` | `3002` | [http://localhost:3002](http://localhost:3002) | Order delivery workflow, status transitions |
| **Seller App** | `seller-app` | `3003` | [http://localhost:3003](http://localhost:3003) | Vendor catalog and analytics |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: `24.x` (or `>= 18.x`)
- **npm**: `10.x` or higher
- **Firebase Project**: Firestore initialized in Google Cloud / Firebase console

### 1. Clone & Install
```bash
git clone https://github.com/Coderaryanyadav/FlashFit.git
cd FlashFit
npm install
```

### 2. Environment Variables Configuration
Create `.env.local` files for the workspaces (or set in Vercel project environment):

```env
# Firebase Client SDK Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCcO8q6G08EPk047pncwT0UdJLiDB3WJ6I
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-847805730-4f392.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-847805730-4f392
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-847805730-4f392.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=497323679456
NEXT_PUBLIC_FIREBASE_APP_ID=1:497323679456:web:fef3f0e6e3af943969ba85

# Firebase Admin SDK Configuration
FIREBASE_PROJECT_ID=studio-847805730-4f392
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@studio-847805730-4f392.iam.gserviceaccount.com
# For Vercel, store the private key as a Base64-encoded string to avoid newline parsing errors:
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

# Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_123
RAZORPAY_SECRET=test_secret
```

### 3. Run Development Servers
Launch all applications and TypeScript watchers in parallel via Turborepo:
```bash
npm run dev
```

---

## 🛠️ CLI & Build Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs all micro-frontends concurrently on ports 3000-3003 with hot reload |
| `npm run build` | Compiles `@flashfit/types`, all Next.js applications, and cloud functions |
| `npm run lint` | Executes ESLint checks across all monorepo packages |
| `npm --prefix customer-app/web-customer test` | Executes Jest unit and component test suites (50 tests passing) |
| `npm --prefix customer-app/web-customer run test:e2e` | Runs Playwright end-to-end shopping and checkout tests |

---

## 🛡️ Audit & Quality Assurance Summary

The FlashFit platform has undergone an exhaustive engineering rebuttal audit:

- **Type Safety**: Fully resolved missing `Product` and `CartItem` attributes in `@flashfit/types`. All workspaces pass strict `tsc --noEmit`.
- **Port Orchestration**: Eliminated `EADDRINUSE` conflicts by pinning dedicated development ports across workspaces (`3000`, `3001`, `3002`, `3003`).
- **SSR Optimization**: Cleared Next.js client-side bailout warnings by optimizing dynamic imports and component hydration.
- **Unit Test Coverage**: 7/7 test suites and 50/50 unit tests passing.
- **Vercel Production Verification**: Live deployments configured with root Turborepo context and verified returning `HTTP 200 OK` on all endpoints.

For deeper technical audit logs and deployment steps:
- 📖 [Comprehensive Rebuttal Audit Report](./REBUTTAL_AUDIT_REPORT.md)
- 🚀 [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)
- 📋 [Production Deployment Checklist](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)

---

## 📄 License

Private repository &copy; 2026 FlashFit Team. All rights reserved.
