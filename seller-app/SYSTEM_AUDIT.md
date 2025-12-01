# FlashFit System Audit & Architecture Plan

## 1. System Overview
The FlashFit platform consists of three Next.js applications sharing a common Firebase backend.

- **Customer App (Port 3000)**: E-commerce storefront for browsing products, managing cart/wishlist, and tracking orders.
- **Admin Panel (Port 3001)**: Dashboard for managing products, drivers, and monitoring orders.
- **Driver App (Port 3002)**: Mobile-first web app for drivers to view assigned orders and update status.

## 2. Architecture & Data Flow
- **Authentication**: Firebase Auth (Email/Password).
- **Database**: Firestore.
  - `users`: Stores user profiles (customers, drivers, admins).
  - `orders`: Central order management.
  - `products`: Product catalog.
- **State Management**: Zustand (Customer App), React Context/Local State (others).
- **Styling**: Tailwind CSS with `shadcn/ui` components.

## 3. Critical Issues Found (Deep Scan)
### Security
- 🔴 **Hardcoded Firebase Config**: API keys are exposed in `utils/firebase.ts` in all three apps.
- 🔴 **Client-Side Admin Logic**: Some admin checks might be client-side only (needs verification).

### Code Quality
- 🔴 **Duplication**: `utils/firebase.ts` and UI components are duplicated across apps.
- 🔴 **Type Safety**: Many `any` types used, especially for `Order` and `Product` interfaces.
- 🔴 **Hardcoded Strings**: Statuses ("placed", "confirmed") are hardcoded in multiple places.

### Performance
- 🔴 **Unoptimized Images**: Some images might not be using `next/image` optimally.
- 🔴 **Heavy Re-renders**: Cart and Wishlist logic could be optimized.

## 4. Production Rewrite Plan
### Phase 1: Foundation (Current)
- [x] Fix Build Errors (Wishlist, Cart, Rating components).
- [x] Ensure all apps run locally.
- [ ] **Action**: Refactor `utils/firebase.ts` to use Environment Variables.
- [ ] **Action**: Create shared `types` definitions.

### Phase 2: Refactoring
- [ ] **Customer App**:
  - Move Firestore logic to `services/orderService.ts`, `services/productService.ts`.
  - Implement `Suspense` for all search param usage.
- [ ] **Admin Panel**:
  - Secure driver creation (Done).
  - Implement real-time order monitoring with proper listeners.
- [ ] **Driver App**:
  - Optimize for mobile view.
  - Ensure real-time status updates are robust.

### Phase 3: Optimization
- [ ] Implement `SWR` or `TanStack Query` for data fetching.
- [ ] Add Error Boundaries.
- [ ] optimize `globals.css` and Tailwind config.

## 5. Next Steps
1. Refactor `utils/firebase.ts` to use `.env`.
2. Create `types/index.ts` for shared interfaces.
3. Verify Order Flow E2E.
