# Security Fixes & Validations

## Overview
This document outlines all security measures implemented to prevent order fraud, location spoofing, price manipulation, and abuse in the FlashFit platform.

## Date: December 3, 2025

---

## 🔒 Security Measures Implemented

### 1. **Location & Service Area Validation**

#### Pincode Validation
- **Serviceable Pincodes**: Only orders from approved Mumbai pincodes are accepted
- **Allowed Pincodes**: 400059, 400060, 400062, 400063, 400064, 400065, 400066, 400067, 400068, 400069
- **Implementation**: Server-side validation in `/api/createOrder/route.ts`
- **Error Message**: Clear feedback when pincode is not serviceable

#### Geographic Bounds Check
- **Purpose**: Prevent international orders (e.g., London, New York)
- **Mumbai Bounds**:
  - Latitude: 18.90 to 19.30
  - Longitude: 72.75 to 72.95
- **Validation**: Coordinates must fall within Mumbai region
- **Error**: "Delivery location is outside our service area (Mumbai region only)"

### 2. **Price Tampering Prevention**

#### Server-Side Price Verification
- **Critical**: NEVER trust client-sent prices
- **Implementation**: Fetch actual prices from Firestore database
- **Validation**: 
  - Compare client price vs database price (1% tolerance for rounding)
  - Calculate total using ACTUAL database prices
  - Verify final total matches calculated total (2% variance for surge timing)
- **Error**: "Price verification failed. Please refresh your cart."

#### Price Limits
- **Minimum Order**: ₹100
- **Maximum Order**: ₹500,000 (5 lakhs)
- **Purpose**: Prevent unrealistic orders and potential exploits

### 3. **Input Validation & Sanitization**

#### Address Field Validation
- **Required Fields**: name, phone, street, city, pincode, location
- **Length Limits**: 2-200 characters per field
- **XSS Prevention**: Block `<script>`, `javascript:`, `onerror=`, `onclick=` patterns
- **SQL Injection Prevention**: Sanitize all input fields

#### Phone Number Validation
- **Format**: Indian mobile numbers only
- **Pattern**: Must start with 6-9, followed by 9 digits
- **Regex**: `/^[6-9]\d{9}$/`

### 4. **Order Quantity & Item Limits**

#### Per-Order Limits
- **Max Items**: 50 items per order
- **Max Quantity Per Item**: 10 units
- **Purpose**: Prevent bulk order abuse and inventory manipulation

#### Stock Validation
- **Real-time Check**: Verify stock availability during transaction
- **Size-based Stock**: Validate specific size availability
- **Error Handling**: Clear messages for out-of-stock items

### 5. **Rate Limiting & Abuse Prevention**

#### Time-Based Rate Limiting
- **Minimum Gap Between Orders**: 30 seconds
- **Purpose**: Prevent rapid order spam
- **Error**: "Please wait 30 seconds before placing another order."

#### Daily Order Limit
- **Max Orders Per Day**: 20 orders per user
- **Purpose**: Prevent abuse and bot attacks
- **Error**: "Daily order limit reached. Please contact support."

### 6. **Authentication & Authorization**

#### Email Verification
- **Requirement**: Email must be verified before placing orders
- **Check**: `decodedToken.email_verified`
- **Error**: "Please verify your email before placing an order"

#### Token Verification
- **Method**: Firebase Admin SDK `verifyIdToken()`
- **Validation**: 
  - Token must be valid
  - User ID must match authenticated user
  - Token must not be expired

### 7. **Transaction Safety**

#### Timeout Protection
- **Transaction Timeout**: 25 seconds
- **Purpose**: Prevent endless rolling/hanging transactions
- **Implementation**: `Promise.race()` with timeout
- **Error**: "Transaction timeout - please try again"

#### Read-Before-Write Enforcement
- **Firestore Rule**: All reads must complete before writes
- **Implementation**: Structured transaction phases:
  1. **Read Phase**: Fetch all products and driver data
  2. **Logic Phase**: Validate stock, calculate prices, prepare updates
  3. **Write Phase**: Update products, driver, create order

---

## 🛡️ Attack Vectors Prevented

### ✅ Location Spoofing
- **Attack**: User tries to order from London/international location
- **Prevention**: Geographic bounds check + pincode validation
- **Result**: Order rejected with clear error message

### ✅ Price Manipulation
- **Attack**: User modifies frontend code to change product prices
- **Prevention**: Server-side price verification using database prices
- **Result**: Order rejected if prices don't match

### ✅ Inventory Manipulation
- **Attack**: User tries to order more items than available in stock
- **Prevention**: Real-time stock validation in transaction
- **Result**: Order rejected with stock error

### ✅ Order Spam/Bot Attacks
- **Attack**: Automated bot places hundreds of orders
- **Prevention**: Rate limiting (30s gap + 20/day limit)
- **Result**: Requests throttled with 429 status

### ✅ XSS/Injection Attacks
- **Attack**: Malicious scripts in address fields
- **Prevention**: Input sanitization and pattern blocking
- **Result**: Order rejected with validation error

### ✅ Unauthorized Orders
- **Attack**: Unauthenticated or unverified user tries to order
- **Prevention**: Token verification + email verification check
- **Result**: 401/403 error response

---

## 📊 Security Checklist

- [x] Pincode validation (serviceable areas only)
- [x] Geographic bounds check (Mumbai region)
- [x] Server-side price verification
- [x] Price tampering prevention
- [x] Input sanitization (XSS/SQL injection)
- [x] Phone number validation (Indian format)
- [x] Order quantity limits
- [x] Rate limiting (time-based)
- [x] Daily order limits
- [x] Email verification requirement
- [x] Token authentication
- [x] Transaction timeout protection
- [x] Stock validation in transaction
- [x] Read-before-write enforcement

---

## 🔧 Files Modified

1. **`/customer-app/web-customer/app/api/createOrder/route.ts`**
   - Added security configuration constants
   - Implemented all validation layers
   - Added transaction timeout protection
   - Enhanced error handling

2. **`/customer-app/web-customer/app/page.tsx`**
   - Pincode modal for service area check
   - Frontend validation

3. **`/customer-app/web-customer/app/checkout/page.tsx`**
   - Form validation
   - Error handling for API responses

---

## 🚀 Next Steps

1. **Monitor & Log**: Implement logging for blocked orders to detect attack patterns
2. **Analytics**: Track validation failures to identify common issues
3. **Expand Service Area**: Add more pincodes as business grows
4. **Enhanced Fraud Detection**: Implement ML-based fraud detection for suspicious patterns
5. **CAPTCHA**: Add CAPTCHA for high-risk scenarios

---

## 📝 Notes

- All validations are server-side to prevent bypass
- Error messages are user-friendly but don't reveal security details
- Limits can be adjusted via constants at the top of the API route
- Transaction timeout ensures API always responds (prevents endless rolling)

---

**Last Updated**: December 3, 2025  
**Status**: ✅ Production Ready
