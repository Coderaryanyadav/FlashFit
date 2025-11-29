# Testing & QA Strategy

## Overview
Quality Assurance is integrated into every stage of our SDLC, not just the end. We employ the "Testing Pyramid" strategy: many unit tests, fewer integration tests, and targeted UI tests.

## 1. Unit Testing
- **Scope:** Individual functions, utilities, and components.
- **Tools:** Jest (Backend), React Testing Library (Frontend).
- **Coverage Goal:** >80% code coverage.
- **Example:** Testing the `calculateOrderTotal(items)` function to ensure math is correct.

## 2. Integration Testing
- **Scope:** Interaction between modules (e.g., API + Database).
- **Tools:** Jest + Firebase Emulators.
- **Process:** Spin up a local Firestore emulator, seed data, run API function, verify database state change.

## 3. API Testing
- **Scope:** Verifying HTTP endpoints.
- **Tools:** Postman / Insomnia (Manual), Supertest (Automated).
- **Checks:** Status codes (200, 400, 500), Response payload structure, Latency.

## 4. UI/UX Testing
- **Scope:** Visual regression and usability.
- **Tools:** Storybook (Component isolation), Chromatic (Visual diffs).

## 5. Automated E2E Testing
- **Scope:** Critical user flows (Signup -> Add to Cart -> Checkout).
- **Tools:** Cypress or Playwright.
- **Frequency:** Runs on every Pull Request to `main`.

## 6. Security Testing
- **SAST (Static Application Security Testing):** SonarQube scanning code for vulnerabilities.
- **DAST (Dynamic Application Security Testing):** OWASP ZAP scans on staging environment.

## 7. Performance & Load Testing
- **Tools:** k6 or Apache JMeter.
- **Scenario:** Simulate 1000 concurrent users placing orders to identify bottlenecks.

## 8. UAT (User Acceptance Testing)
- **Process:** Before a major release, the product is deployed to a `staging` environment.
- **Testers:** Internal team members and beta users.
- **Sign-off:** Required from Product Manager before production deployment.
