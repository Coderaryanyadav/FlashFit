# Industrial Audit V2: Server Hang Investigation

## Objective
Identify the root cause of the API requests (`/api/products`, `/api/categories`) hanging in `(pending)` state on Vercel.

## Potential Causes
1.  **Middleware Blocking**: `middleware.ts` might be intercepting requests and not calling `next()`, or awaiting an async operation that times out.
2.  **Firebase Admin Initialization**: If `getAdminDb()` hangs (e.g., waiting for metadata service on Vercel), the API route will hang.
3.  **Database Connection**: Firewall rules or cold start issues.
4.  **Vercel Function Timeout**: The function takes longer than 10s (Hobby plan limit).

## Audit Log

### 1. Middleware Check
- [ ] Check `middleware.ts` content.
- [ ] Verify matcher configuration.

### 2. Firebase Admin Check
- [ ] Verify `firebaseAdmin.ts` initialization logic.
- [ ] Check for `await` on top-level or inside initialization.

### 3. API Route Check
- [ ] Review `api/products/route.ts` for complexity.
- [ ] Review `api/categories/route.ts`.

## Findings
- **Middleware**: No middleware file found in root or src. No blocking logic.
- **Firebase Admin**: Initialization logic is robust and handles key parsing correctly.
- **API Routes**: Found potential for infinite hang if Firestore is unreachable.
  - **Action**: Added strict 8-second timeout to `/api/products` and `/api/categories`.
  - **Action**: Verified `page.tsx` has fallback logic to Client SDK if API fails/times out.
- **Performance**: Throttled `mousemove` and `scroll` listeners to prevent browser freeze.
- **Cleanup**: Deleted unused `NewsletterPopup`.
