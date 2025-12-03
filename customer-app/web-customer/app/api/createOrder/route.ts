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

        const body = await request.json();
        const { items, address, storeId, totalAmount, userId } = body;

        if (userId !== decodedToken.uid) {
            return NextResponse.json({ error: "Unauthorized: User ID mismatch" }, { status: 403 });
        }

        if (!items || !address || !storeId || !totalAmount || !userId) {
            console.error("Missing required fields:", { items: !!items, address: !!address, storeId: !!storeId, totalAmount: !!totalAmount, userId: !!userId });
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

        // Rate Limiting: Check last order time
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
                if (now - lastOrderTime < 60000) { // 1 minute
                    return NextResponse.json({ error: "Please wait a moment before placing another order." }, { status: 429 });
                }
            }
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

        // Transaction
        await adminDb.runTransaction(async (t: Transaction) => {
            let calculatedTotal = 0;

            // 1. Check and decrement stock
            for (const item of items) {
                const productRef = adminDb.collection("products").doc(item.productId);
                const productDoc = await t.get(productRef) as any; // Cast to any to avoid TS issues with admin SDK types

                if (!productDoc.exists) {
                    throw new Error(`Product ${item.productId} not found`);
                }

                const productData = productDoc.data();

                // Server-side price validation
                calculatedTotal += (productData.price || 0) * item.quantity;

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
                    t.update(productRef, { [`stock.${item.size}`]: currentStock - item.quantity });
                } else {
                    // Global stock (number)
                    const currentStock = typeof productData?.stock === "number" ? productData.stock : 0;
                    if (currentStock < item.quantity) {
                        throw new Error(`Insufficient stock for ${productData?.title}`);
                    }
                    if (typeof productData?.stock === "number") {
                        t.update(productRef, { stock: currentStock - item.quantity });
                    }
                }

                // Calculate delivery timeline
                let itemDeliveryDays = 2;
                if (productData?.category === "furniture") itemDeliveryDays = 7;
                else if (productData?.category === "custom") itemDeliveryDays = 5;
                else if (productData?.category === "shaadi_closet") itemDeliveryDays = 4;

                if (itemDeliveryDays > maxDeliveryDays) maxDeliveryDays = itemDeliveryDays;
            }

            const expectedDeliveryDate = new Date();
            expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + maxDeliveryDays);

            // Recalculate final amount with surge
            const finalAmount = calculatedTotal * surgeMultiplier;

            // Initialize tracking logs array
            const trackingLogs: any[] = [];

            // 2. Create Order
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

            // 3. Assign Driver (if found)
            if (nearestDriver) {
                // Check if driver is still available (optimistic)
                // In a real robust system, we'd read the driver doc inside transaction.
                const driverRef = adminDb.collection("drivers").doc(nearestDriver.id);
                const driverDoc = await t.get(driverRef) as any;

                if (driverDoc.exists && driverDoc.data()?.currentOrderId === null) {
                    orderData.driverId = nearestDriver.id;
                    orderData.status = "assigned";
                    orderData.assignedAt = FieldValue.serverTimestamp();
                    orderData.tracking.status = "assigned";
                    trackingLogs.push({
                        status: "assigned",
                        timestamp: new Date(),
                        driverId: nearestDriver.id,
                        description: "Order placed and driver assigned"
                    });

                    t.update(driverRef, { currentOrderId: orderRef.id });
                } else {
                    trackingLogs.push({
                        status: "placed",
                        timestamp: new Date(),
                        description: "Order placed successfully"
                    });
                }
            } else {
                trackingLogs.push({
                    status: "placed",
                    timestamp: new Date(),
                    description: "Order placed successfully"
                });
            }

            // Update tracking logs in order data
            orderData.tracking.logs = trackingLogs;

            // Write order (single write operation)
            t.set(orderRef, orderData);
        });

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

