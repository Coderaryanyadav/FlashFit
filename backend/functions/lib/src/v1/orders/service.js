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
exports.OrderService = void 0;
const db_1 = require("../../common/db");
const utils_1 = require("../../common/utils");
const firestore_1 = require("firebase-admin/firestore");
const functions = __importStar(require("firebase-functions"));
class OrderService {
    async createOrder(userId, data) {
        const { items, address, storeId, totalAmount } = data;
        // Calculate surge
        const hour = new Date().getHours();
        const surgeMultiplier = (0, utils_1.getSurgeMultiplier)(hour);
        const finalAmount = totalAmount * surgeMultiplier;
        const orderRef = db_1.db.collection("orders").doc();
        const deliveryOtp = (0, utils_1.generateOtp)();
        let maxDeliveryDays = 2;
        // Transaction to handle inventory and order creation
        await db_1.db.runTransaction(async (t) => {
            // 1. Check and decrement stock
            for (const item of items) {
                const productRef = db_1.db.collection("products").doc(item.productId);
                const productDoc = await t.get(productRef);
                if (!productDoc.exists) {
                    throw new functions.https.HttpsError("not-found", `Product ${item.productId} not found`);
                }
                const productData = productDoc.data();
                // Handle size-specific stock
                if (item.size && (productData === null || productData === void 0 ? void 0 : productData.stock) && typeof productData.stock === "object") {
                    const currentStock = productData.stock[item.size] || 0;
                    if (currentStock < item.quantity) {
                        throw new functions.https.HttpsError("failed-precondition", `Insufficient stock for ${productData.title} size ${item.size}`);
                    }
                    t.update(productRef, { [`stock.${item.size}`]: currentStock - item.quantity });
                }
                else {
                    // Fallback to global stock
                    const currentStock = typeof (productData === null || productData === void 0 ? void 0 : productData.stock) === "number" ? productData.stock : 0;
                    if (currentStock < item.quantity) {
                        throw new functions.https.HttpsError("failed-precondition", `Insufficient stock for ${productData === null || productData === void 0 ? void 0 : productData.title}`);
                    }
                    if (typeof (productData === null || productData === void 0 ? void 0 : productData.stock) === "number") {
                        t.update(productRef, { stock: currentStock - item.quantity });
                    }
                }
                // Calculate delivery timeline
                let itemDeliveryDays = 2;
                if ((productData === null || productData === void 0 ? void 0 : productData.category) === "furniture")
                    itemDeliveryDays = 7;
                else if ((productData === null || productData === void 0 ? void 0 : productData.category) === "custom")
                    itemDeliveryDays = 5;
                else if ((productData === null || productData === void 0 ? void 0 : productData.category) === "shaadi_closet")
                    itemDeliveryDays = 4;
                if (itemDeliveryDays > maxDeliveryDays)
                    maxDeliveryDays = itemDeliveryDays;
            }
            const expectedDeliveryDate = new Date();
            expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + maxDeliveryDays);
            // Fetch store details
            let storeName = "FlashFit Store";
            let pickupAddress = "Goregaon, Mumbai";
            if (storeId) {
                const storeDoc = await t.get(db_1.db.collection("users").doc(storeId));
                if (storeDoc.exists) {
                    const storeData = storeDoc.data();
                    storeName = (storeData === null || storeData === void 0 ? void 0 : storeData.storeName) || (storeData === null || storeData === void 0 ? void 0 : storeData.displayName) || storeName;
                    pickupAddress = (storeData === null || storeData === void 0 ? void 0 : storeData.storeAddress) || pickupAddress;
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
                createdAt: firestore_1.FieldValue.serverTimestamp(),
                tracking: {
                    status: "placed",
                    // logs: [] // Moved to subcollection
                },
            };
            t.set(orderRef, orderData);
            // 3. Add initial log to subcollection
            const logRef = orderRef.collection("logs").doc();
            t.set(logRef, {
                status: "placed",
                timestamp: firestore_1.FieldValue.serverTimestamp(),
                description: "Order placed successfully",
            });
        });
        return { orderId: orderRef.id, finalAmount };
    }
    async completeOrder(callerId, orderId, deliveredItemIds, otp) {
        const orderRef = db_1.db.collection("orders").doc(orderId);
        await db_1.db.runTransaction(async (t) => {
            const orderDoc = await t.get(orderRef);
            if (!orderDoc.exists) {
                throw new functions.https.HttpsError("not-found", "Order not found");
            }
            const orderData = orderDoc.data();
            // Security Check: Ensure caller is the assigned driver
            if ((orderData === null || orderData === void 0 ? void 0 : orderData.driverId) !== callerId) {
                throw new functions.https.HttpsError("permission-denied", "You are not authorized to complete this order");
            }
            // Verify OTP
            if ((orderData === null || orderData === void 0 ? void 0 : orderData.deliveryOtp) && orderData.deliveryOtp !== otp) {
                throw new functions.https.HttpsError("invalid-argument", "Invalid OTP");
            }
            const items = (orderData === null || orderData === void 0 ? void 0 : orderData.items) || [];
            const updatedItems = items.map((item) => {
                const itemId = item.id || item.productId;
                const isDelivered = deliveredItemIds.includes(itemId);
                return Object.assign(Object.assign({}, item), { status: isDelivered ? "delivered" : "returned" });
            });
            const returnedItems = items.filter((item) => {
                const itemId = item.id || item.productId;
                return !deliveredItemIds.includes(itemId);
            });
            const deliveredItems = items.filter((item) => {
                const itemId = item.id || item.productId;
                return deliveredItemIds.includes(itemId);
            });
            // Recalculate Total Amount based on delivered items
            const surgeMultiplier = (orderData === null || orderData === void 0 ? void 0 : orderData.surgeMultiplier) || 1;
            const newTotalBase = deliveredItems.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
            const newFinalAmount = newTotalBase * surgeMultiplier;
            // Handle returns (increment stock)
            for (const item of returnedItems) {
                const productId = item.productId || item.id;
                if (productId) {
                    const productRef = db_1.db.collection("products").doc(productId);
                    const productDoc = await t.get(productRef);
                    if (productDoc.exists) {
                        const productData = productDoc.data();
                        if (item.size && (productData === null || productData === void 0 ? void 0 : productData.stock) && typeof productData.stock === "object") {
                            const currentStock = productData.stock[item.size] || 0;
                            t.update(productRef, { [`stock.${item.size}`]: currentStock + (item.quantity || 1) });
                        }
                        else {
                            const currentStock = typeof (productData === null || productData === void 0 ? void 0 : productData.stock) === "number" ? productData.stock : 0;
                            if (typeof (productData === null || productData === void 0 ? void 0 : productData.stock) === "number") {
                                t.update(productRef, { stock: currentStock + (item.quantity || 1) });
                            }
                        }
                    }
                }
            }
            const allReturned = deliveredItemIds.length === 0;
            const newStatus = allReturned ? "returning" : "delivered";
            const currentPaymentStatus = (orderData === null || orderData === void 0 ? void 0 : orderData.paymentStatus) || "pending";
            // If COD, payment is collected now. If Online, it was already paid.
            // If partial return on Online order -> Refund needed (Manual for now).
            // If partial return on COD -> Collect newFinalAmount.
            // For MVP, if delivered, we assume payment is collected/verified.
            const newPaymentStatus = allReturned ? "cancelled" : ((orderData === null || orderData === void 0 ? void 0 : orderData.paymentMethod) === "COD" ? "paid" : currentPaymentStatus);
            // Credit Driver Earnings (Flat fee for MVP)
            const DELIVERY_FEE = 40;
            if (newStatus === "delivered" && (orderData === null || orderData === void 0 ? void 0 : orderData.driverId)) {
                const driverRef = db_1.db.collection("drivers").doc(orderData.driverId);
                t.update(driverRef, {
                    totalEarnings: firestore_1.FieldValue.increment(DELIVERY_FEE),
                    totalDeliveries: firestore_1.FieldValue.increment(1),
                });
            }
            t.update(orderRef, {
                status: newStatus,
                items: updatedItems,
                totalAmount: newFinalAmount,
                deliveredAt: firestore_1.FieldValue.serverTimestamp(),
                paymentStatus: newPaymentStatus,
                tracking: {
                    status: newStatus,
                    // logs: [] // Moved to subcollection
                },
            });
            // Add log to subcollection
            const logRef = orderRef.collection("logs").doc();
            t.set(logRef, {
                status: newStatus,
                timestamp: firestore_1.FieldValue.serverTimestamp(),
                description: allReturned ? "Order returned" : `Order delivered. Amount: ${newFinalAmount}`,
            });
        });
        return { success: true };
    }
    async updateOrderStatus(callerId, orderId, status, description) {
        const orderRef = db_1.db.collection("orders").doc(orderId);
        await db_1.db.runTransaction(async (t) => {
            const orderDoc = await t.get(orderRef);
            if (!orderDoc.exists) {
                throw new functions.https.HttpsError("not-found", "Order not found");
            }
            const orderData = orderDoc.data();
            // Security Check: Ensure caller is the assigned driver (or we could check for admin role here too if we had user role context)
            // For now, if the caller matches the driverId, allow.
            // If not, we might block, BUT admins also use this.
            // Since we don't have easy admin check inside Service without fetching User doc,
            // we will allow if driverId matches OR if we assume admin calls are handled upstream or we fetch user.
            // Let's fetch the caller's profile to check role if not driver.
            if ((orderData === null || orderData === void 0 ? void 0 : orderData.driverId) !== callerId) {
                const userRef = db_1.db.collection("users").doc(callerId);
                const userDoc = await t.get(userRef);
                const userData = userDoc.data();
                if ((userData === null || userData === void 0 ? void 0 : userData.role) !== "admin") {
                    throw new functions.https.HttpsError("permission-denied", "You are not authorized to update this order");
                }
            }
            t.update(orderRef, {
                status,
                tracking: {
                    status,
                    // logs: [] // Moved to subcollection
                },
            });
            // Add log to subcollection
            const logRef = orderRef.collection("logs").doc();
            t.set(logRef, {
                status,
                timestamp: firestore_1.FieldValue.serverTimestamp(),
                description: description || `Order status updated to ${status}`,
            });
        });
        return { success: true };
    }
}
exports.OrderService = OrderService;
//# sourceMappingURL=service.js.map