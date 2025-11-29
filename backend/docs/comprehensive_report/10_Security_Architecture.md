# Security Architecture

## Overview
Security is paramount for FlashFit, handling sensitive user data and payments. We adopt a "Security by Design" approach.

## OWASP Top 10 Coverage

### 1. Injection
- **Mitigation:** We use ORMs/ODMs (Firestore SDK) which automatically handle parameterization, preventing SQL/NoSQL injection.

### 2. Broken Authentication
- **Mitigation:** We rely on Firebase Authentication (Google Identity Platform), which handles session management, password hashing (scrypt), and multi-factor authentication securely.

### 3. Sensitive Data Exposure
- **Mitigation:** All data in transit is encrypted via TLS 1.2+. Data at rest in Firestore is encrypted by Google. PII is minimized.

### 4. XML External Entities (XXE)
- **Mitigation:** We use JSON exclusively for APIs; XML parsers are disabled.

### 5. Broken Access Control
- **Mitigation:**
    - **Firestore Security Rules:** Granular rules (e.g., `allow read: if request.auth.uid == resource.data.userId`).
    - **Role-Based Access Control (RBAC):** Custom Claims in JWT (e.g., `admin: true`) to restrict API endpoints.

## Input Validation
- **Server-Side:** All incoming data is validated against strict schemas (Zod) before processing.
- **Client-Side:** Form validation for immediate feedback.

## XSS / CSRF Protection
- **XSS:** React escapes content by default. We sanitize any user-generated HTML.
- **CSRF:** Firebase ID Tokens are sent in headers (Authorization: Bearer), not cookies, mitigating CSRF attacks.

## Secret Management
- **Tool:** Google Cloud Secret Manager.
- **Usage:** API keys (Razorpay, Maps) are stored in Secret Manager and injected into Cloud Functions at runtime as environment variables. They are NEVER committed to Git.
