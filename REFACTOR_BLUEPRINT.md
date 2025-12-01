# FlashFit Project Refactor Blueprint

## 1. New Folder Structure (Monorepo Architecture)

We will transition to a strict Monorepo structure using **Turborepo** or **NPM Workspaces**. This ensures code sharing, consistent tooling, and atomic deployments.

```text
/
├── package.json              # Root workspace config
├── turbo.json                # Turborepo pipeline config
├── apps/
│   ├── admin-dashboard/      # Next.js Admin Portal
│   ├── customer-app/         # Next.js Customer PWA/App
│   ├── driver-app/           # Next.js Driver PWA/App
│   └── backend/              # Firebase Functions & Rules
├── packages/
│   ├── types/                # Shared TypeScript Interfaces (Source of Truth)
│   ├── ui/                   # Shared Design System (Buttons, Inputs, Cards)
│   ├── utils/                # Shared Helpers (Date, Currency, Validation)
│   ├── api/                  # Shared API Client (Axios/Fetch wrappers)
│   └── config/               # Shared ESLint/TSConfig
└── scripts/                  # CI/CD and Setup Scripts
```

---

## 2. Architecture & Design Patterns

### A. Backend (Cloud Functions)
**Current State:** Monolithic `index.ts` (400+ lines). Hard to test, hard to maintain.
**New Architecture:** **Service-Controller-Trigger Pattern**.

*   **Controllers:** Handle HTTP requests (validation, response formatting).
*   **Services:** Business logic (DB interactions, calculations).
*   **Triggers:** Background events (Firestore triggers, Scheduled tasks).
*   **Utils:** Pure functions.

**New Structure:**
```text
backend/functions/src/
├── v1/
│   ├── orders/
│   │   ├── controller.ts   # createOrder, completeOrder
│   │   ├── service.ts      # Business logic for orders
│   │   └── triggers.ts     # onOrderUpdate, autoAssignDriver
│   ├── drivers/
│   └── products/
├── common/
│   ├── middleware.ts       # Auth, Error Handling
│   └── db.ts               # Firebase Admin init
└── index.ts                # Exports all functions cleanly
```

### B. Frontend (Apps)
**Current State:** Scattered logic, duplicated types, direct Firestore calls in components.
**New Architecture:** **Feature-Based Architecture**.

*   **Features:** Group code by domain (e.g., `features/auth`, `features/checkout`).
*   **Services:** API abstraction layer. No direct DB calls in UI components.
*   **State:** React Context or Zustand for global state (Auth, Cart).

**New Structure (e.g., customer-app):**
```text
src/
├── app/                    # Next.js App Router
├── components/             # Shared UI Components (from packages/ui)
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services.ts
│   └── orders/
├── lib/                    # 3rd party setup (Firebase, Stripe)
└── providers/              # Context Providers
```

---

## 3. Shared Packages (The "Glue")

### `@flashfit/types`
This is the **most critical** package. It defines the contract between Frontend and Backend.

```typescript
// packages/types/src/index.ts

export interface User {
  uid: string;
  email: string;
  role: 'customer' | 'driver' | 'admin';
  profile: UserProfile;
}

export interface Order {
  id: string;
  customerId: string;
  driverId?: string;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: Address;
  createdAt: Date;
  updatedAt: Date;
}

export type OrderStatus = 'placed' | 'confirmed' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
```

### `@flashfit/utils`
Shared logic to prevent bugs.
*   `formatCurrency(amount: number): string`
*   `calculateDistance(lat1, lon1, lat2, lon2): number`
*   `validatePhone(phone: string): boolean`

---

## 4. Database Schema Optimization (Firestore)

**Current Issues:**
*   Root collections for everything.
*   Potential for "hotspotting" if orders grow massive.

**Recommendations:**
1.  **Subcollections for Logs:** Move `tracking.logs` array to a subcollection `orders/{orderId}/logs` to avoid hitting the 1MB document limit.
2.  **Sharding Counters:** If `stats.totalOrders` is updated frequently, use distributed counters.
3.  **Denormalization:** Store `storeName` and `storeLocation` on the `Order` document (already doing this, keep it up).
4.  **Indexes:** Ensure composite indexes exist for queries like `orders.where('driverId', '==', ...).where('status', 'in', ...)` (Driver App).

---

## 5. Implementation Plan

### Phase 1: Foundation
1.  Initialize `packages/types`.
2.  Move all interface definitions from `*.ts` files to this package.
3.  Update `tsconfig.json` in all apps to reference `@flashfit/types`.

### Phase 2: Backend Migration
1.  Create `backend/functions/src`.
2.  Refactor `createOrder` and `completeOrder` into `v1/orders`.
3.  Implement `zod` for runtime validation in Controllers.

### Phase 3: Frontend Standardization
1.  Create `@flashfit/ui` with Shadcn UI components.
2.  Refactor `driver-app` to use the new shared types and UI.
3.  Implement `useOrderService` hook to abstract Firebase calls.

---

## 6. Code Snippets

### Backend: Modular Controller (`backend/functions/src/v1/orders/controller.ts`)
```typescript
import * as functions from "firebase-functions";
import { OrderService } from "./service";
import { z } from "zod";

const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string(), quantity: z.number() })),
  address: z.object({ street: z.string(), city: z.string() }),
  storeId: z.string(),
});

export const createOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError("unauthenticated", "Login required");
  
  const payload = createOrderSchema.parse(data);
  const service = new OrderService();
  
  return await service.createOrder(context.auth.uid, payload);
});
```

### Frontend: Typed Hook (`packages/hooks/useOrders.ts`)
```typescript
import { useState, useEffect } from 'react';
import { Order } from '@flashfit/types';
import { db } from '@/lib/firebase';

export function useActiveOrders(userId: string) {
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    // ... Firestore listener using typed Order
  }, [userId]);
  
  return { orders };
}
```
