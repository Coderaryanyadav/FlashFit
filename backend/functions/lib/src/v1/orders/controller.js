"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.submitRating = exports.updateOrderStatus = exports.completeOrder = exports.createOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const service_1 = require("./service");
const service = new service_1.OrderService();
exports.createOrder = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { items, address, storeId, totalAmount } = data;
    if (!items || !address || !storeId || !totalAmount) {
        throw new functions.https.HttpsError("invalid-argument", "Missing required fields");
    }
    try {
        return await service.createOrder(context.auth.uid, data);
    }
    catch (error) {
        console.error("Error in createOrder:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", error.message || "Unknown error occurred");
    }
});
exports.completeOrder = functions.https.onCall(async (data, context) => {
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
    }
    catch (error) {
        console.error("Error in completeOrder:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", error.message || "Unknown error occurred");
    }
});
exports.updateOrderStatus = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { orderId, status, description } = data;
    if (!orderId || !status) {
        throw new functions.https.HttpsError("invalid-argument", "Missing orderId or status");
    }
    try {
        return await service.updateOrderStatus(context.auth.uid, orderId, status, description);
    }
    catch (error) {
        console.error("Error in updateOrderStatus:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", error.message || "Unknown error occurred");
    }
});
exports.submitRating = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { orderId, rating, review } = data;
    if (!orderId || !rating) {
        throw new functions.https.HttpsError("invalid-argument", "Missing orderId or rating");
    }
    if (rating < 1 || rating > 5) {
        throw new functions.https.HttpsError("invalid-argument", "Rating must be between 1 and 5");
    }
    try {
        return await service.submitRating(context.auth.uid, orderId, rating, review);
    }
    catch (error) {
        console.error("Error in submitRating:", error);
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        throw new functions.https.HttpsError("internal", error.message || "Unknown error occurred");
    }
});
//# sourceMappingURL=controller.js.map