# Database System

## Technology: Google Cloud Firestore
Firestore is a flexible, scalable NoSQL cloud database for mobile, web, and server development from Firebase and Google Cloud Platform.

## Why Firestore?
- **Real-time updates:** Clients receive data changes instantly.
- **Offline support:** SDKs cache data locally for offline usage.
- **Scalability:** Automatic horizontal scaling.

## Collection Structure

### `users`
Stores customer profiles.
- `uid` (Document ID)
- `email`
- `profile` (Map)

### `products`
Catalog of items.
- `sku` (Document ID)
- `name`
- `price`
- `inventory_count`

### `orders`
Transactional data.
- `order_id` (Document ID)
- `user_id` (Indexed)
- `status` (Indexed)
- `created_at` (Indexed)

### `drivers`
Driver profiles and real-time state.
- `driver_id` (Document ID)
- `is_online` (Boolean)
- `location` (GeoPoint)

## Indexing Strategy
- **Single-field indexes:** Automatically created for all fields.
- **Composite indexes:** Manually defined for complex queries (e.g., `orders` where `status == 'pending'` AND `created_at < NOW`).
- **Exemptions:** Large text fields (descriptions) are excluded from indexing to save storage costs.

## Optimization & Scaling
- **Sharding:** Not strictly needed for Firestore unless hitting 10k writes/sec, but we use "Distributed Counters" for high-frequency updates (like global order count).
- **Denormalization:** We duplicate some data (e.g., user name in order document) to reduce read operations.

## Backup & Restore
- **Automated Backups:** Daily export to Google Cloud Storage.
- **Point-in-Time Recovery (PITR):** Enabled for critical collections to restore data from any second in the last 7 days.
