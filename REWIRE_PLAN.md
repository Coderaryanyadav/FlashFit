# Project Rewire & Audit Plan

This document outlines the systematic plan to audit, fix ("rewire"), and verify the entire FlashFit project, as requested.

## Phase 1: Backend Core (Critical Path)
- [x] **Order Service (`service.ts`)**: Fix Firestore transaction errors (Reads before Writes).
- [x] **Order Triggers (`triggers.ts`)**: Fix infinite loop and race condition in `autoAssignDriver`.
- [x] **Order Controller (`controller.ts`)**: Verified (mostly unused by Customer App).
- [x] **Driver Service**: Verified `completeOrder` Cloud Function usage.
- [ ] **Product Service**: Verify inventory management logic.

## Phase 2: Frontend Integration (Customer App)
- [x] **API Route (`/api/createOrder`)**: **CRITICAL FIX**: Refactored transaction to fix "Reads before Writes" error. The app uses this instead of Cloud Function.
- [x] **Checkout Flow**: Verified `createOrder` API call payload and response handling.
- [ ] **Order Tracking**: Verify real-time updates (Firestore listeners).
- [ ] **Cart Management**: Verified logic, stock check is handled in API.

## Phase 3: Frontend Integration (Driver App)
- [x] **Order Acceptance**: Verified `runTransaction` usage (Correct).
- [x] **Delivery Flow**: Verified `completeOrder` Cloud Function usage (Correct).
- [ ] **Location Tracking**: Verify WebSocket/Firestore location updates.

## Phase 4: System-Wide Verification
- [ ] **Build Check**: Ensure all packages build without errors.
- [ ] **Lint Check**: Ensure no critical linting errors.
- [ ] **End-to-End Test**: Simulate a full order lifecycle (Create -> Accept -> Deliver).

## Current Status
- **Backend**: Fixing `orders/service.ts` transaction logic.
- **Build**: Verifying backend build.
