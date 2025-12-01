import { NextResponse } from "next/server";
import { db, auth } from "@/utils/firebase"; // We need admin SDK for transactions, but client SDK is limited. 
// actually we need firebase-admin for secure transactions on server side.
// Since this is a Next.js API route running on server, we should use firebase-admin.

// However, initializing firebase-admin in Next.js requires service account or env vars.
// Let's check if we have firebase-admin setup in the project or if we can use the client SDK with rules (less secure for stock)
// OR better, we use the existing firebase-admin setup if available.

// Let's try to use the client SDK for now but we might hit permission issues if rules are strict.
// The best way for Vercel is to use firebase-admin.

import { adminDb } from "@/utils/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { items, address, storeId, totalAmount, userId } = body;

        if (!items || !address || !storeId || !totalAmount || !userId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Calculate surge (Simplified)
        const hour = new Date().getHours();
        const surgeMultiplier = (hour >= 18 && hour <= 21) ? 1.5 : 1.0;
        const finalAmount = totalAmount * surgeMultiplier;

        const orderRef = adminDb.collection("orders").doc();
        const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();
        let maxDeliveryDays = 2;

        // Transaction
        await adminDb.runTransaction(async (t) => {
            // 1. Check and decrement stock
            for (const item of items) {
                const productRef = adminDb.collection("products").doc(item.productId);
                const productDoc = await t.get(productRef);

                if (!productDoc.exists) {
                    throw new Error(`Product ${item.productId} not found`);
                }

                const productData = productDoc.data();

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

            // Fetch store details
            let storeName = "FlashFit Store";
            let pickupAddress = "Goregaon, Mumbai";

            if (storeId) {
                const storeDoc = await t.get(adminDb.collection("users").doc(storeId));
                if (storeDoc.exists) {
                    const storeData = storeDoc.data();
                    storeName = storeData?.storeName || storeData?.displayName || storeName;
                    pickupAddress = storeData?.storeAddress || pickupAddress;
                }
            }

            // 2. Create Order
            const orderData = {
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
                },
            };

            t.set(orderRef, orderData);

            // 3. Add initial log
            const logRef = orderRef.collection("logs").doc();
            t.set(logRef, {
                status: "placed",
                timestamp: FieldValue.serverTimestamp(),
                description: "Order placed successfully",
            });
        });

        return NextResponse.json({ orderId: orderRef.id, success: true });

    } catch (error: any) {
        console.error("Error creating order:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
