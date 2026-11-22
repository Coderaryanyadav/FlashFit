# FlashFit - Ultra-Fast Fashion Delivery Platform

[![Turborepo](https://img.shields.io/badge/monorepo-Turborepo-000?logo=turborepo)](https://turbo.build)
[![Next.js](https://img.shields.io/badge/framework-Next.js%2014-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/backend-Firebase%20%2F%20Firestore-orange?logo=firebase)](https://firebase.google.com)
[![Status](https://img.shields.io/badge/build-passing-brightgreen)]()

FlashFit is an ultra-fast, modern e-commerce platform offering 60-minute apparel and sports gear delivery. Built as a high-performance Next.js 14 monorepo with Firebase, Zustand, and Tailwind CSS.

---

## 🌐 Live Deployments (Vercel)

| Application | Role | Production URL | Status |
|---|---|---|:---:|
| **Customer App** | Storefront, product catalog, cart, checkout & live order tracking | [https://flashfit-customer-web.vercel.app](https://flashfit-customer-web.vercel.app) | 🟢 Live (HTTP 200) |
| **Admin Dashboard** | Operations portal for managing orders, inventory & delivery drivers | [https://flashfit-admin.vercel.app](https://flashfit-admin.vercel.app) | 🟢 Live (HTTP 200) |
| **Driver App** | Mobile-first web app for drivers to accept orders, navigate & confirm delivery | [https://flashfit-driver-web.vercel.app](https://flashfit-driver-web.vercel.app) | 🟢 Live (HTTP 200) |

---

## 🏛️ Monorepo Architecture

The platform is structured as a unified Turborepo containing micro-frontends, backend cloud functions, and shared libraries:

```
FlashFit/
├── customer-app/web-customer/ # Next.js 14 Customer Storefront (Port 3000)
├── admin-dashboard/web-admin/ # Next.js 14 Admin Panel (Port 3001)
├── driver-app/web-driver/     # Next.js 14 / Capacitor Driver App (Port 3002)
├── seller-app/                # Next.js 14 Seller Portal (Port 3003)
├── backend/
│   └── functions/             # Firebase Cloud Functions (TypeScript)
├── packages/
│   └── types/                 # Shared domain models & TypeScript interfaces (@flashfit/types)
├── seed-data/                 # Database seed scripts & setup utilities
└── turbo.json                 # Turborepo task pipeline configuration
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js `24.x` (or `>= 18.x`)
- npm `10.x` or higher

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/Coderaryanyadav/FlashFit.git
cd FlashFit
npm install
```

### 2. Configure Environment Variables
Create `.env.local` files for each app using the configuration below:

```bash
# Root & customer-app/web-customer/.env.local
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCcO8q6G08EPk047pncwT0UdJLiDB3WJ6I
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=studio-847805730-4f392.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=studio-847805730-4f392
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=studio-847805730-4f392.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=497323679456
NEXT_PUBLIC_FIREBASE_APP_ID=1:497323679456:web:fef3f0e6e3af943969ba85
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-fbsvc@studio-847805730-4f392.iam.gserviceaccount.com
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_123
RAZORPAY_SECRET=test_secret
```

### 3. Start Development Servers
Run all applications in parallel with dedicated port allocations:
```bash
npm run dev
```

---

## 💻 Local Port Mapping

Each micro-frontend runs on an isolated port to avoid port conflicts:

| Application | Local Port | URL | Description |
|---|:---:|---|---|
| **Customer App** | `3000` | [http://localhost:3000](http://localhost:3000) | Shopping experience, catalog, cart, checkout |
| **Admin Dashboard** | `3001` | [http://localhost:3001](http://localhost:3001) | Inventory, order management, driver dispatch |
| **Driver App** | `3002` | [http://localhost:3002](http://localhost:3002) | Order delivery workflow, status transitions |
| **Seller App** | `3003` | [http://localhost:3003](http://localhost:3003) | Vendor catalog and analytics |

---

## 🛠️ Monorepo Scripts

| Command | Action |
|---|---|
| `npm run dev` | Runs all 4 apps and watchers concurrently via Turborepo |
| `npm run build` | Builds all packages (`@flashfit/types`, apps, backend) |
| `npm run lint` | Runs ESLint checks across all monorepo packages |
| `npm --prefix customer-app/web-customer test` | Runs Jest unit test suites (50 tests passing) |
| `npm --prefix customer-app/web-customer run test:e2e` | Runs Playwright end-to-end shopping flow tests |

---

## 🛡️ Audit & System Verification

The entire repository underwent an exhaustive engineering audit with all issues remediated:

- **Type Safety**: Resolved missing `Product` and `CartItem` properties in `@flashfit/types`. All 6 packages typecheck cleanly (`npx tsc --noEmit` exits `0`).
- **Port Isolation**: Isolated ports (`3000`, `3001`, `3002`, `3003`) to eliminate collisions.
- **SSR Optimization**: Replaced dynamic SSR bailouts with direct client component imports.
- **Unit & Integration Tests**: 7/7 test suites and 50/50 unit tests passing.
- **Production Builds**: All 6 packages build cleanly with Turborepo caching.

Detailed documentation and test reports:
- [Comprehensive Rebuttal Audit Report](./REBUTTAL_AUDIT_REPORT.md)
- [Vercel Deployment Guide](./VERCEL_DEPLOYMENT_GUIDE.md)
- [Vercel Setup Complete Reference](./VERCEL_SETUP_COMPLETE.md)
- [Production Deployment Checklist](./PRODUCTION_DEPLOYMENT_CHECKLIST.md)

---

## 📄 License

Private repository &copy; 2026 FlashFit Team. All rights reserved.
