import { NextResponse } from "next/server";
import { db, auth } from "@/utils/firebase"; // We need admin SDK for transactions, but client SDK is limited. 
// actually we need firebase-admin for secure transactions on server side.
// Since this is a Next.js API route running on server, we should use firebase-admin.

// However, initializing firebase-admin in Next.js requires service account or env vars.
// Let's check if we have firebase-admin setup in the project or if we can use the client SDK with rules (less secure for stock)
// OR better, we use the existing firebase-admin setup if available.

// Let's try to use the client SDK for now but we might hit permission issues if rules are strict.
// The best way for Vercel is to use firebase-admin.

import { getAdminDb, getAdminAuth } from "@/utils/firebaseAdmin";
import { FieldValue, Transaction } from "firebase-admin/firestore";

// Security Configuration
const SERVICEABLE_PINCODES = ["400059", "400060", "400062", "400063", "400064", "400065", "400066", "400067", "400068", "400069"]; // Mumbai Goregaon area
const MUMBAI_BOUNDS = {
    minLat: 18.90,
    maxLat: 19.30,
    minLng: 72.75,
    maxLng: 72.95
};
const MAX_ITEMS_PER_ORDER = 50;
const MAX_QUANTITY_PER_ITEM = 10;
const MAX_ORDER_AMOUNT = 500000; // 5 lakhs
const MIN_ORDER_AMOUNT = 100;

export async function POST(request: Request) {
    try {
        // Initialize Firebase Admin lazily
        const adminDb = getAdminDb();
        const adminAuth = getAdminAuth();

        // Check if Firebase Admin is initialized
        if (!adminDb || !adminAuth) {
            console.error("Firebase Admin is not initialized");
            return NextResponse.json({
                error: "Server configuration error: Database not initialized. Please check Firebase credentials."
            }, { status: 500 });
        }

        // Verify Auth Token
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
        }

        const token = authHeader.split("Bearer ")[1];
        let decodedToken;
        try {
            decodedToken = await adminAuth.verifyIdToken(token);
        } catch (e) {
            console.error("Token verification failed:", e);
            return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 });
        }

        // Verify email is verified
        if (!decodedToken.email_verified) {
            return NextResponse.json({ error: "Please verify your email before placing an order" }, { status: 403 });
        }

        const body = await request.json();
        const { items, address, storeId, totalAmount, userId } = body;

        if (userId !== decodedToken.uid) {
            return NextResponse.json({ error: "Unauthorized: User ID mismatch" }, { status: 403 });
        }

        if (!items || !address || !storeId || !totalAmount || !userId) {
            console.error("Missing required fields:", { items: !!items, address: !!address, storeId: !!storeId, totalAmount: !!totalAmount, userId: !!userId });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // ============ SECURITY VALIDATIONS ============

        // 1. Validate Pincode (Serviceable Area Check)
        if (!address.pincode || typeof address.pincode !== 'string') {
            return NextResponse.json({ error: "Invalid pincode format" }, { status: 400 });
        }
        const cleanPincode = address.pincode.trim();
        if (!SERVICEABLE_PINCODES.includes(cleanPincode)) {
            return NextResponse.json({
                error: `Sorry, we don't deliver to pincode ${cleanPincode}. Currently serving: ${SERVICEABLE_PINCODES.join(', ')}`
            }, { status: 400 });
        }

        // 2. Validate Location (Prevent London/International Orders)
        if (!address.location || typeof address.location.lat !== 'number' || typeof address.location.lng !== 'number') {
            return NextResponse.json({ error: "Invalid location coordinates" }, { status: 400 });
        }
        const { lat, lng } = address.location;
        if (lat < MUMBAI_BOUNDS.minLat || lat > MUMBAI_BOUNDS.maxLat ||
            lng < MUMBAI_BOUNDS.minLng || lng > MUMBAI_BOUNDS.maxLng) {
            return NextResponse.json({
                error: "Delivery location is outside our service area (Mumbai region only)"
            }, { status: 400 });
        }

        // 3. Validate Address Fields (Prevent Injection/Malicious Input)
        const addressFields = ['name', 'phone', 'street', 'city'];
        for (const field of addressFields) {
            if (!address[field] || typeof address[field] !== 'string') {
                return NextResponse.json({ error: `Invalid address field: ${field}` }, { status: 400 });
            }
            // Check for suspicious patterns (SQL injection, XSS, etc.)
            const value = address[field].trim();
            if (value.length < 2 || value.length > 200) {
                return NextResponse.json({ error: `${field} must be between 2 and 200 characters` }, { status: 400 });
            }
            if (/<script|javascript:|onerror=|onclick=/i.test(value)) {
                return NextResponse.json({ error: "Invalid characters detected in address" }, { status: 400 });
            }
        }

        // 4. Validate Phone Number (Indian format)
        const phoneRegex = /^[6-9]\d{9}$/;
        if (!phoneRegex.test(address.phone.replace(/\s+/g, ''))) {
            return NextResponse.json({ error: "Invalid Indian phone number format" }, { status: 400 });
        }

        // 5. Validate Items Array
        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
        }
        if (items.length > MAX_ITEMS_PER_ORDER) {
            return NextResponse.json({ error: `Maximum ${MAX_ITEMS_PER_ORDER} items allowed per order` }, { status: 400 });
        }

        // 6. Validate Each Item
        for (const item of items) {
            if (!item.productId || typeof item.productId !== 'string') {
                return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
            }
            if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > MAX_QUANTITY_PER_ITEM) {
                return NextResponse.json({ error: `Invalid quantity. Must be between 1 and ${MAX_QUANTITY_PER_ITEM}` }, { status: 400 });
            }
            if (item.price && (typeof item.price !== 'number' || item.price < 0)) {
                return NextResponse.json({ error: "Invalid item price" }, { status: 400 });
            }
        }

        // 7. Validate Total Amount (Prevent Price Tampering)
        if (typeof totalAmount !== 'number' || totalAmount < MIN_ORDER_AMOUNT || totalAmount > MAX_ORDER_AMOUNT) {
            return NextResponse.json({
                error: `Order amount must be between ₹${MIN_ORDER_AMOUNT} and ₹${MAX_ORDER_AMOUNT}`
            }, { status: 400 });
        }

        // Calculate surge (Simplified)
        const hour = new Date().getHours();
        const surgeMultiplier = (hour >= 18 && hour <= 21) ? 1.5 : 1.0;
        const finalAmount = totalAmount * surgeMultiplier;

        const orderRef = adminDb.collection("orders").doc();
        const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
        let maxDeliveryDays = 2;

        // Fetch store details (moved outside transaction to simplify, as it's read-only)
        let storeName = "FlashFit Store";
        let pickupAddress = "Goregaon, Mumbai";

        if (storeId) {
            const storeDoc = await adminDb.collection("users").doc(storeId).get();
            if (storeDoc.exists) {
                const storeData = storeDoc.data();
                storeName = storeData?.storeName || storeData?.displayName || storeName;
                pickupAddress = storeData?.storeAddress || pickupAddress;
            }
        }

        // FETCH DRIVERS (Outside Transaction for initial query, then re-check inside)

        // Rate Limiting: Check last order time (Enhanced)
        const lastOrderSnap = await adminDb.collection("orders")
            .where("userId", "==", userId)
            .orderBy("createdAt", "desc")
            .limit(1)
            .get();

        if (!lastOrderSnap.empty) {
            const lastOrder = lastOrderSnap.docs[0].data();
            if (lastOrder.createdAt) {
                const lastOrderTime = lastOrder.createdAt.toDate().getTime();
                const now = Date.now();
                // Prevent rapid order spam (30 seconds minimum)
                if (now - lastOrderTime < 30000) {
                    return NextResponse.json({ error: "Please wait 30 seconds before placing another order." }, { status: 429 });
                }
            }
        }

        // Daily Order Limit (Prevent Abuse)
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayOrdersSnap = await adminDb.collection("orders")
            .where("userId", "==", userId)
            .where("createdAt", ">=", todayStart)
            .get();

        if (todayOrdersSnap.size >= 20) { // Max 20 orders per day
            return NextResponse.json({ error: "Daily order limit reached. Please contact support if you need to place more orders." }, { status: 429 });
        }

        const driversSnap = await adminDb.collection("drivers")
            .where("isOnline", "==", true)
            .where("currentOrderId", "==", null)
            .get();

        let nearestDriver: any = null;
        let minDistance = Infinity;
        // Default store location (Goregaon)
        const storeLat = 19.163328;
        const storeLng = 72.841200;

        driversSnap.docs.forEach((doc: any) => {
            const driver = doc.data();
            if (driver.location) {
                const dist = calculateDistance(storeLat, storeLng, driver.location.lat, driver.location.lng);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestDriver = doc;
                }
            }
        });

        // Transaction with Timeout Protection
        const transactionPromise = adminDb.runTransaction(async (t: Transaction) => {
            let calculatedTotal = 0;
            const productUpdates: { ref: any; data: any }[] = [];
            let maxDeliveryDays = 2;

            // 1. READS: Fetch all products first
            const productRefs = items.map((item: any) => adminDb.collection("products").doc(item.productId));
            const productDocs = await t.getAll(...productRefs);

            // Fetch Driver Doc if nearestDriver is found (Read Phase)
            let driverDoc: any = null;
            let driverRef: any = null;
            if (nearestDriver) {
                driverRef = adminDb.collection("drivers").doc(nearestDriver.id);
                driverDoc = await t.get(driverRef);
            }

            // 2. LOGIC & VALIDATION
            items.forEach((item: any, index: number) => {
                const productDoc = productDocs[index];

                if (!productDoc.exists) {
                    throw new Error(`Product ${item.productId} not found`);
                }

                const productData = productDoc.data() as any;

                // ⚠️ CRITICAL: Server-side price validation (Prevent Price Tampering)
                // NEVER trust client-sent prices - always use database prices
                const actualPrice = productData.price || 0;

                // Verify client price matches server price (with 1% tolerance for rounding)
                if (item.price && Math.abs(item.price - actualPrice) > actualPrice * 0.01) {
                    throw new Error(`Price mismatch for ${productData.title}. Please refresh and try again.`);
                }

                // Use ACTUAL database price for calculation
                calculatedTotal += actualPrice * item.quantity;

                // Handle stock validation
                if (productData?.stock && typeof productData.stock === "object") {
                    // Size-based stock
                    if (!item.size) {
                        throw new Error(`Size selection is required for ${productData.title}`);
                    }
                    const currentStock = productData.stock[item.size] || 0;
                    if (currentStock < item.quantity) {
                        throw new Error(`Insufficient stock for ${productData.title} size ${item.size}`);
                    }
                    productUpdates.push({
                        ref: productDoc.ref,
                        data: { [`stock.${item.size}`]: currentStock - item.quantity }
                    });
                } else {
                    // Global stock (number)
                    const currentStock = typeof productData?.stock === "number" ? productData.stock : 0;
                    if (currentStock < item.quantity) {
                        throw new Error(`Insufficient stock for ${productData?.title}`);
                    }
                    if (typeof productData?.stock === "number") {
                        productUpdates.push({
                            ref: productDoc.ref,
                            data: { stock: currentStock - item.quantity }
                        });
                    }
                }

                // Calculate delivery timeline
                let itemDeliveryDays = 2;
                if (productData?.category === "furniture") itemDeliveryDays = 7;
                else if (productData?.category === "custom") itemDeliveryDays = 5;
                else if (productData?.category === "shaadi_closet") itemDeliveryDays = 4;

                if (itemDeliveryDays > maxDeliveryDays) maxDeliveryDays = itemDeliveryDays;
            });

            // Verify total amount matches calculated total (with surge)
            const expectedDeliveryDate = new Date();
            expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + maxDeliveryDays);

            // Recalculate final amount with surge
            const finalAmount = calculatedTotal * surgeMultiplier;

            // Verify client-sent total is close to calculated total (allow 2% variance for rounding/surge timing)
            if (Math.abs(totalAmount - finalAmount) > finalAmount * 0.02) {
                throw new Error(`Price verification failed. Expected: ₹${finalAmount.toFixed(2)}, Received: ₹${totalAmount}. Please refresh your cart.`);
            }

            // Initialize tracking logs array
            const trackingLogs: any[] = [];

            // Prepare Order Data
            const orderData: any = {
                id: orderRef.id,
                userId,
                storeId,
                storeName,
                pickupAddress,
                items,
                address,
                status: "pending",
                paymentStatus: "pending",
                paymentMethod: "COD",
                totalAmount: finalAmount,
                surgeMultiplier,
                deliveryOtp,
                estimatedDeliveryAt: expectedDeliveryDate,
                createdAt: FieldValue.serverTimestamp(),
                tracking: {
                    status: "placed",
                    logs: trackingLogs
                },
            };

            // Check Driver Assignment (Logic Phase)
            let assignedDriverId = null;
            if (driverDoc && driverDoc.exists && driverDoc.data()?.currentOrderId === null) {
                assignedDriverId = nearestDriver.id;
                orderData.driverId = assignedDriverId;
                orderData.status = "assigned";
                orderData.assignedAt = FieldValue.serverTimestamp();
                orderData.tracking.status = "assigned";
                trackingLogs.push({
                    status: "assigned",
                    timestamp: new Date(),
                    driverId: assignedDriverId,
                    description: "Order placed and driver assigned"
                });
            } else {
                trackingLogs.push({
                    status: "placed",
                    timestamp: new Date(),
                    description: "Order placed successfully"
                });
            }

            // Update tracking logs in order data
            orderData.tracking.logs = trackingLogs;

            // 3. WRITES: Perform all updates and sets

            // Update products
            for (const update of productUpdates) {
                t.update(update.ref, update.data);
            }

            // Update driver if assigned
            if (assignedDriverId && driverRef) {
                t.update(driverRef, { currentOrderId: orderRef.id });
            }

            // Create order
            t.set(orderRef, orderData);
        });

        // Add timeout to prevent hanging (25 seconds)
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Transaction timeout - please try again")), 25000)
        );

        await Promise.race([transactionPromise, timeoutPromise]);

        return NextResponse.json({ orderId: orderRef.id, success: true });

    } catch (error: any) {
        console.error("❌ Error creating order:");
        console.error("Error name:", error?.name);
        console.error("Error message:", error?.message);
        console.error("Error stack:", error?.stack);
        console.error("Full error:", JSON.stringify(error, null, 2));

        return NextResponse.json({
            error: error.message || "Internal Server Error",
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}

// Helper Functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
}

function deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
}

