# Backend Explanation

## Technology Choice
- **Runtime:** Node.js 18 (via Firebase Cloud Functions)
- **Framework:** Express.js (wrapped in Cloud Functions) or Native Triggers.
- **Language:** TypeScript for type safety.

## Architectural Pattern
We use a **Controller-Service-Repository** pattern to separate concerns:
1.  **Controller:** Handles HTTP requests, validation, and sending responses.
2.  **Service:** Contains the core business logic (e.g., "Calculate total price", "Assign driver").
3.  **Repository:** Handles direct database operations (e.g., "Find user by ID", "Update order status").

## Authentication & Session
- **Stateless:** We use JWTs (Firebase ID Tokens).
- **Middleware:** An `authMiddleware` intercepts requests, verifies the token via Firebase Admin SDK, and attaches the user object to the request.

## Business Logic Examples
- **Order Assignment:** When an order is placed, a geospatial query finds drivers within 5km.
- **Pricing Engine:** Dynamic calculation based on distance, weight, and surge pricing.

## Scheduler / Cron Jobs
- **Tool:** Firebase Scheduled Functions (Pub/Sub).
- **Jobs:**
    - `dailyInventoryCheck`: Runs at midnight to flag low stock.
    - `payoutProcessing`: Runs weekly to calculate driver earnings.

## File Upload System
- **Storage:** Google Cloud Storage.
- **Flow:** Client requests a signed URL -> Uploads file directly to GCS -> Backend saves the URL in the database.

## Security Measures
- **Input Validation:** Zod or Joi schemas for every endpoint.
- **Rate Limiting:** Preventing DDoS attacks.
- **Data Encryption:** TLS 1.2+ for transit, Google-managed encryption at rest.
