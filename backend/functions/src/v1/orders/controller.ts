import * as functions from "firebase-functions";
import { OrderService } from "./service";

const service = new OrderService();

export const createOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }

    const { items, address, storeId, totalAmount } = data;

    if (!items || !address || !storeId || !totalAmount) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }

    return await service.createOrder(context.auth.uid, data);
});

export const completeOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }

    const { orderId, deliveredItemIds, otp } = data;

    if (!orderId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing orderId");
    }

    if (!Array.isArray(deliveredItemIds)) {
        throw new functions.https.HttpsError("invalid-argument", "deliveredItemIds must be an array");
    }

    try {
        return await service.completeOrder(context.auth.uid, orderId, deliveredItemIds, otp);
    } catch (error: any) {
        console.error("Error in completeOrder:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", error.message || "Unknown error occurred");
    }
});

export const updateOrderStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }

    const { orderId, status, description } = data;

    if (!orderId || !status) {
        throw new functions.https.HttpsError("invalid-argument", "Missing orderId or status");
    }

    try {
        return await service.updateOrderStatus(context.auth.uid, orderId, status, description);
    } catch (error: any) {
        console.error("Error in updateOrderStatus:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", error.message || "Unknown error occurred");
    }
});
