# API Documentation

## Overview
This API powers the FlashFit customer application. It is built with Next.js App Router and uses Firebase Firestore as the database.

**Base URL**: `/api`

---

## Endpoints

### 1. Create Order
**POST** `/createOrder`

Creates a new order with strict validation, stock checking, and automatic driver assignment.

**Headers:**
- `Authorization`: `Bearer <firebase_id_token>`

**Request Body:**
```json
{
  "items": [
    {
      "id": "prod_123",
      "title": "Urban T-Shirt",
      "price": 999,
      "quantity": 1,
      "size": "M"
    }
  ],
  "address": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400059",
    "location": {
      "lat": 19.1136,
      "lng": 72.8697
    }
  },
  "storeId": "store_main",
  "totalAmount": 999,
  "userId": "user_123"
}
```

**Responses:**
- `201 Created`: Order placed successfully. Returns `{ success: true, orderId: "..." }`.
- `400 Bad Request`: Validation failed (invalid pincode, price mismatch, out of stock).
- `401 Unauthorized`: Missing or invalid token.
- `429 Too Many Requests`: Rate limit exceeded (5 req/min).

---

### 2. Get Products
**GET** `/products`

Fetches products, optionally filtered by pincode availability.

**Query Parameters:**
- `pincode` (optional): Filter products available in this pincode. Default: "400059".

**Responses:**
- `200 OK`: List of products.
- `500 Internal Server Error`: Database error or timeout.

---

### 3. Get Categories
**GET** `/categories`

Fetches all product categories.

**Responses:**
- `200 OK`: List of categories.

---

## Error Handling
All API endpoints return errors in a standard format:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE" // Optional
}
```

## Rate Limiting
- **Orders**: 5 requests per minute per user/IP.
- **Data Fetching**: 100 requests per minute per IP.
