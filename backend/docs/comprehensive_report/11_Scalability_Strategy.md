# Scalability Strategy

## Horizontal vs. Vertical Scaling
- **Strategy:** **Horizontal Scaling**.
- **Implementation:** Our serverless architecture (Cloud Functions) automatically spins up new instances to handle increased traffic. We do not rely on a single powerful server (Vertical).

## Auto-Scaling Groups
- **Cloud Functions:** Google manages the scaling. We can set `minInstances` to reduce cold starts and `maxInstances` to control costs/concurrency.
- **Firestore:** Automatically splits data across servers (sharding) as traffic grows.

## Load Balancers
- **Global Load Balancing:** Google Cloud Load Balancing distributes traffic to the nearest region, ensuring low latency for users worldwide.

## Database Sharding
- **Automatic:** Firestore handles sharding automatically.
- **Manual Optimization:** We structure data to avoid "hotspots" (e.g., avoiding monotonically increasing IDs as keys for high-write collections).

## Caching Strategy
1.  **Browser Cache:** Static assets (images, JS) cached via CDN headers.
2.  **Application Cache:** React Query / SWR caches API responses in the client.
3.  **CDN:** Firebase Hosting serves content from edge locations globally.

## Queue Systems for High Load
- **Scenario:** 10,000 orders placed in 1 minute (Flash Sale).
- **Solution:**
    1.  API accepts order -> Pushes to Cloud Pub/Sub topic -> Returns "Processing" to user immediately.
    2.  Background Workers pull from Pub/Sub -> Validate -> Update DB.
    3.  This "levels the load" and prevents DB overwhelm.
