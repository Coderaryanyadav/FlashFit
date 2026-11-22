<div align="center">

# ⚡ FlashFit
### *Ultra-Fast 60-Minute Fashion & Activewear Quick-Commerce Platform*

[![Turborepo](https://img.shields.io/badge/monorepo-Turborepo-000000?style=for-the-badge&logo=turborepo&logoColor=white)](https://turbo.build)
[![Next.js](https://img.shields.io/badge/Next.js%2014-App%20Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vercel](https://img.shields.io/badge/Vercel-Production_Live-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)
[![Test Suite](https://img.shields.io/badge/Jest_Tests-50%2F50_Passing-brightgreen?style=for-the-badge&logo=jest&logoColor=white)]()

<br/>

**[🚀 Live Customer Storefront](https://flash-fit-web-customer.vercel.app)** &nbsp;•&nbsp;
**[📊 Admin Operations Panel](https://flashfit-admin.vercel.app)** &nbsp;•&nbsp;
**[🛵 Driver Partner Portal](https://flashfit-drivers.vercel.app)** &nbsp;•&nbsp;
**[📋 Audit Report](./docs/REBUTTAL_AUDIT_REPORT.md)** &nbsp;•&nbsp;
**[🤝 Contributing](./docs/CONTRIBUTING.md)**

</div>

---

## 📖 Overview

**FlashFit** is an enterprise-grade quick-commerce fashion platform engineered for sub-**60 minute delivery** of premium activewear, sportswear, and athletic gear. Built using a high-performance **Turborepo** monorepo architecture, the platform connects retail customers, dark store fulfillment hubs, dispatch operators, and last-mile delivery partners into one synchronized real-time ecosystem.

### ✨ Key Capabilities

- ⚡ **Sub-60 Minute Fulfillment**: Local micro-fulfillment hub dispatch algorithm optimized for low latency and high density.
- 📱 **Four Specialized Micro-Frontends**: Decoupled applications for Customers, Dark Store Admins, Delivery Riders, and Sellers.
- 📍 **Real-Time GPS Tracking**: Driver location streaming and ETA calculation powered by Firebase Firestore listeners (`onSnapshot`).
- 💳 **Seamless Payments**: Native Razorpay checkout integration with instant order confirmation, webhooks, and Cash on Delivery fallback.
- 🛡️ **End-to-End Type Safety**: Shared domain models (`@flashfit/types`) enforce schema integrity across web apps and serverless backend.
- 🧪 **Production Tested**: 50 passing unit test suites, strict linting, zero build warnings, and production edge routing on Vercel.

---

## 📑 Table of Contents

- [🌐 Live Production Deployments](#-live-production-deployments-vercel)
- [📐 System Architecture Diagram](#-system-architecture-diagram)
- [⚡ 60-Minute Order Lifecycle & Delivery Workflow](#-60-minute-order-lifecycle--delivery-workflow)
- [🔄 State Management & Real-Time Sync Flow](#-state-management--real-time-sync-flow)
- [📁 Monorepo Workspace Directory Tree](#-monorepo-workspace-directory-tree)
- [📦 Workspace Component Matrix](#-workspace-component-matrix)
- [💻 Local Port Mapping & Micro-Frontends](#-local-port-mapping--micro-frontends)
- [🚀 Getting Started](#-getting-started)
- [🛠️ CLI & Build Scripts](#️-cli--build-scripts)
- [🛡️ Audit & Quality Assurance](#️-audit--quality-assurance-summary)
- [🤝 Contributing & Security](#-contributing--security)

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

## 📁 Monorepo Workspace Directory Tree

```text
FlashFit (Monorepo Root)
│
├── 📁 customer-app/
│   └── 📁 web-customer/                   # [Port 3000] Customer Storefront (Next.js 14 App Router)
│       ├── 📁 app/                         # App Router routing structure
│       │   ├── 📁 (auth)/                  # User login, registration & phone OTP authentication
│       │   ├── 📁 api/                     # Next.js Serverless Route Handlers
│       │   │   ├── 📁 categories/          # GET /api/categories (Firestore catalog query)
│       │   │   ├── 📁 products/            # GET/POST /api/products (Filtering & search)
│       │   │   └── 📁 orders/              # POST /api/orders & live status updates
│       │   ├── 📁 cart/                    # Shopping cart drawer & price calculations
│       │   ├── 📁 checkout/                # Razorpay payment integration & address selection
│       │   ├── 📁 orders/                  # Order status page & real-time delivery tracking
│       │   ├── 📁 products/                # Product details, sizing selector & variant gallery
│       │   ├── 📄 layout.tsx               # Root layout with TopBar, Navigation & Footer
│       │   ├── 📄 page.tsx                 # Homepage: Hero banners, flash deals, categories
│       │   ├── 📄 error.tsx                # Error boundary handler
│       │   └── 📄 not-found.tsx            # Custom 404 handler
│       ├── 📁 components/                  # Reusable UI component library
│       │   ├── 📁 cart/                    # Cart items, price breakdown & promo codes
│       │   ├── 📁 layout/                  # Navbar, CategoryNav, MobileMenu, Footer
│       │   ├── 📁 order/                   # Live tracking stepper, map view & delivery ETA
│       │   ├── 📁 product/                 # ProductCard, SizePicker, ImageCarousel, QuickBuy
│       │   └── 📁 ui/                      # Base primitives (Button, Modal, Input, Badge, Skeleton)
│       ├── 📁 lib/                         # Core utilities, stores, and service clients
│       │   ├── 📄 firebase.ts              # Firebase Client SDK initialization
│       │   └── 📄 firebaseAdmin.ts         # Firebase Admin SDK (Server-side Firestore operations)
│       ├── 📁 store/                       # Client state management (Zustand)
│       │   ├── 📄 cartStore.ts             # Cart state, persistent local storage, discounts
│       │   ├── 📄 authStore.ts             # User authentication, session tokens
│       │   └── 📄 locationStore.ts         # User geo-location, active delivery pincode
│       ├── 📁 __tests__/                   # Unit & integration test suites (50 passing Jest tests)
│       ├── 📁 e2e/                         # Playwright end-to-end shopping & checkout test specs
│       ├── 📄 next.config.js               # Next.js bundler config with remote image domains
│       ├── 📄 tailwind.config.js           # Tailwind CSS theme styling rules
│       ├── 📄 tsconfig.json                # TypeScript compiler configuration
│       └── 📄 package.json                 # customer-app dependencies & scripts
│
├── 📁 admin-dashboard/
│   └── 📁 web-admin/                       # [Port 3001] Operations & Dispatch Panel (Next.js 14)
│       ├── 📁 app/                         # Operations routes
│       │   ├── 📁 analytics/               # Real-time GMV, delivery times, conversion metrics
│       │   ├── 📁 customers/               # Customer relationship and order history
│       │   ├── 📁 drivers/                 # Driver fleet roster, online/offline status, assignments
│       │   ├── 📁 inventory/               # Dark store stock levels, low-stock alerts, SKU updates
│       │   ├── 📁 orders/                  # Live order queue, filter by status (placed, ready, dispatched)
│       │   └── 📁 settings/                # Store configuration, dark store radius & policies
│       ├── 📁 components/                  # Data tables, live driver maps, dispatch modals
│       ├── 📁 services/                    # Admin Firestore listeners and batch update APIs
│       └── 📄 package.json                 # admin-dashboard dependencies & scripts
│
├── 📁 driver-app/
│   └── 📁 web-driver/                      # [Port 3002] Driver Delivery Partner Portal (Next.js / Capacitor)
│       ├── 📁 app/                         # Driver workflow routes
│       │   ├── 📁 active-orders/           # Active pickup and delivery assignments
│       │   ├── 📁 history/                 # Completed delivery history and trip logs
│       │   ├── 📁 navigation/              # Turn-by-turn route coordinates to dark store & customer
│       │   └── 📁 profile/                 # Driver credentials, vehicle details, earnings summary
│       ├── 📁 components/                  # Swipe-to-accept cards, OTP verification modals, map view
│       ├── 📄 capacitor.config.ts          # Hybrid mobile app wrapper configuration (Android/iOS)
│       └── 📄 package.json                 # driver-app dependencies & scripts
│
├── 📁 seller-app/                          # [Port 3003] Vendor & Merchant Portal (Next.js 14)
│   ├── 📁 app/                             # Seller routes (/products, /orders, /analytics, /inventory)
│   ├── 📁 components/                      # Product onboarding modals, inventory update grids
│   └── 📄 package.json                     # seller-app dependencies & scripts
│
├── 📁 backend/                             # Backend Services & Cloud Logic
│   ├── 📁 functions/                       # Firebase Cloud Functions (TypeScript)
│   │   ├── 📁 src/                         # Functions source code
│   │   │   ├── 📄 index.ts                 # Order lifecycle trigger hooks (onOrderCreated, onDriverAssigned)
│   │   │   └── 📄 ai.ts                    # Smart delivery ETA prediction & route optimization
│   │   ├── 📄 firebase.json                # Cloud functions emulators & deploy target config
│   │   ├── 📄 package.json                 # Functions dependencies
│   │   └── 📄 tsconfig.json                # Functions TypeScript compiler configuration
│   └── 📁 firestore-rules/                 # Production Firestore security & validation rules
│       └── 📄 firestore.rules              # Granular read/write security rules for collections
│
├── 📁 packages/                            # Shared Internal Workspace Packages
│   └── 📁 types/                           # Shared TypeScript domain types (@flashfit/types)
│       ├── 📁 src/                         # Type declarations
│       │   └── 📄 index.ts                 # Product, CartItem, Order, User, Driver, Category types
│       ├── 📄 package.json                 # Workspace package manifest
│       └── 📄 tsconfig.json                # Shared TypeScript configuration
│
├── 📁 seed-data/                           # Database Seeding & Mock Data
│   ├── 📄 seed-firebase.js                 # Automated Firestore seeder for categories, products, stores
│   ├── 📄 add-products.mjs                 # Apparel & sports equipment catalog loader
│   ├── 📄 setup-users.js                   # Test credentials and mock driver accounts generator
│   └── 📄 firestore.indexes.json           # Composite index definitions for Firestore queries
│
├── 📁 docs/                                # Technical Documentation & Engineering Guides
│   ├── 📄 REBUTTAL_AUDIT_REPORT.md         # Exhaustive audit findings, fixes, and rebuttal verification
│   ├── 📄 VERCEL_DEPLOYMENT_GUIDE.md       # Monorepo deployment instructions, secrets, and CLI flags
│   ├── 📄 VERCEL_SETUP_COMPLETE.md         # Complete environment and DNS propagation summary
│   ├── 📄 PRODUCTION_DEPLOYMENT_CHECKLIST.md # Pre-flight and post-deployment checklist
│   ├── 📄 CONTRIBUTING.md                  # Development guidelines, branch standards & PR checklist
│   └── 📄 SECURITY.md                      # Vulnerability reporting and security policies
│
├── 📁 .github/                             # Continuous Integration & Automation Workflows
│   ├── 📁 ISSUE_TEMPLATE/                  # Bug report & feature request GitHub issue templates
│   ├── 📄 PULL_REQUEST_TEMPLATE.md         # Pull request review checklist
│   └── 📁 workflows/                       # GitHub Actions (CI build, lint, and test validation)
│
├── 📄 turbo.json                           # Turborepo task orchestrator pipeline definitions
└── 📄 package.json                         # Monorepo root package manifest with workspace bindings
```

---

## 📦 Workspace Component Matrix

| Module | Workspace Directory | Framework / Stack | Local Port | Production Live Link |
| :--- | :--- | :--- | :---: | :--- |
| **Storefront** | `customer-app/web-customer` | Next.js 14, Tailwind CSS, Zustand | `3000` | [flash-fit-web-customer.vercel.app](https://flash-fit-web-customer.vercel.app) |
| **Operations** | `admin-dashboard/web-admin` | Next.js 14, Radix UI, Tailwind | `3001` | [flashfit-admin.vercel.app](https://flashfit-admin.vercel.app) |
| **Rider Portal**| `driver-app/web-driver` | Next.js 14, Capacitor, Leaflet | `3002` | [flashfit-drivers.vercel.app](https://flashfit-drivers.vercel.app) |
| **Seller Portal**| `seller-app` | Next.js 14, Tailwind CSS | `3003` | Local Micro-Frontend |
| **Functions** | `backend/functions` | Node.js 18, TypeScript, Firebase | — | Cloud Trigger Workers |
| **Types** | `packages/types` | TypeScript 5.x (`@flashfit/types`) | — | Internal Shared Library |

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
- 📖 [Comprehensive Rebuttal Audit Report](./docs/REBUTTAL_AUDIT_REPORT.md)
- 🚀 [Vercel Deployment Guide](./docs/VERCEL_DEPLOYMENT_GUIDE.md)
- 📋 [Production Deployment Checklist](./docs/PRODUCTION_DEPLOYMENT_CHECKLIST.md)

---

## 🤝 Contributing & Security

We welcome community contributions, architectural improvements, and bug fixes!

- **Contributing Guide**: Please review our [Contributing Guidelines](./docs/CONTRIBUTING.md) for branch naming conventions (`feat/`, `fix/`), testing standards, and local workspace setup.
- **Issue Templates**: Submit bugs via the [Bug Report Template](./.github/ISSUE_TEMPLATE/bug_report.md) or propose features via the [Feature Request Template](./.github/ISSUE_TEMPLATE/feature_request.md).
- **Security Policy**: For responsible vulnerability disclosure and supported versions, consult our [Security Policy](./docs/SECURITY.md).

---

## 📄 License

Private repository &copy; 2026 FlashFit Team. All rights reserved.
