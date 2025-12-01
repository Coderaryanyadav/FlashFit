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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatServer = exports.productEmbeddingJob = exports.storeSubscriptionHandler = exports.updateDriverScore = exports.generateSurgePrice = exports.calculateSmartETA = exports.onDriverLocationUpdate = exports.autoAssignDriver = exports.razorpayVerifySignature = exports.razorpayCreateOrder = exports.submitRating = exports.updateOrderStatus = exports.completeOrder = exports.createOrder = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const razorpay_1 = __importDefault(require("razorpay"));
const crypto = __importStar(require("crypto"));
const utils_1 = require("./utils");
__exportStar(require("./ai"), exports);
__exportStar(require("./utils"), exports);
admin.initializeApp();
const db = admin.firestore();
const ordersController = __importStar(require("./src/v1/orders/controller"));
// 1. Order Functions (Refactored to v1)
exports.createOrder = ordersController.createOrder;
exports.completeOrder = ordersController.completeOrder;
exports.updateOrderStatus = ordersController.updateOrderStatus;
exports.submitRating = ordersController.submitRating;
// 2. razorpayCreateOrder
exports.razorpayCreateOrder = functions.https.onCall(async (data, context) => {
    var _a, _b;
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
    }
    const { amount, orderId } = data;
    // Initialize Razorpay
    const razorpay = new razorpay_1.default({
        key_id: ((_a = functions.config().razorpay) === null || _a === void 0 ? void 0 : _a.key_id) || "rzp_test_123",
        key_secret: ((_b = functions.config().razorpay) === null || _b === void 0 ? void 0 : _b.key_secret) || "secret_123",
    });
    const options = {
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt: orderId,
        notes: { orderId },
    };
    try {
        const order = await razorpay.orders.create(options);
        return order;
    }
    catch (error) {
        throw new functions.https.HttpsError("internal", error.message);
    }
});
// 3. razorpayVerifySignature
exports.razorpayVerifySignature = functions.https.onCall(async (data, _context) => {
    var _a;
    const { orderId, paymentId, signature } = data;
    const keySecret = ((_a = functions.config().razorpay) === null || _a === void 0 ? void 0 : _a.key_secret) || "secret_123";
    const generatedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(`${orderId}|${paymentId}`)
        .digest("hex");
    if (generatedSignature === signature) {
        // Update order payment status
        // Note: In real app, orderId here is Razorpay order ID.
        // We need to map it back to our Firestore order ID or pass it in data.
        // Assuming client passes firestoreOrderId too or we query by razorpayOrderId.
        if (data.firestoreOrderId) {
            await db.collection("orders").doc(data.firestoreOrderId).update({
                paymentStatus: "paid",
                paymentId: paymentId,
                paidAt: firestore_1.FieldValue.serverTimestamp(),
            });
        }
        return { success: true };
    }
    else {
        throw new functions.https.HttpsError("permission-denied", "Invalid signature");
    }
});
// 4. autoAssignDriver (Trigger on Order Creation/Update)
exports.autoAssignDriver = functions.firestore
    .document("orders/{orderId}")
    .onUpdate(async (change, context) => {
    var _a, _b, _c, _d;
    const after = change.after.data();
    const _before = change.before.data();
    // Trigger when:
    // 1. Order is newly created with COD (paymentStatus: 'pending', status: 'pending')
    // 2. OR paymentStatus changes to 'paid' (for future online payments)
    // AND driver is not yet assigned
    const shouldAssign = ((after.status === "pending" && !after.driverId) &&
        (after.paymentStatus === "pending" || after.paymentStatus === "paid"));
    if (shouldAssign) {
        // Find nearest online driver
        const driversSnap = await db.collection("drivers")
            .where("isOnline", "==", true)
            .where("currentOrderId", "==", null) // Available drivers
            .get();
        let nearestDriver = null;
        let minDistance = Infinity;
        // Get store location from order or use default
        const storeLat = ((_a = after.storeLocation) === null || _a === void 0 ? void 0 : _a.lat) || 28.6139;
        const storeLng = ((_b = after.storeLocation) === null || _b === void 0 ? void 0 : _b.lng) || 77.2090;
        driversSnap.docs.forEach((doc) => {
            const driver = doc.data();
            if (driver.location) {
                const dist = (0, utils_1.calculateDistance)(storeLat, storeLng, driver.location.lat, driver.location.lng);
                if (dist < minDistance) {
                    minDistance = dist;
                    nearestDriver = doc;
                }
            }
        });
        if (nearestDriver) {
            await change.after.ref.update({
                driverId: nearestDriver.id,
                status: "assigned",
                assignedAt: firestore_1.FieldValue.serverTimestamp(),
                tracking: {
                    status: "assigned",
                    logs: [
                        ...(((_c = after.tracking) === null || _c === void 0 ? void 0 : _c.logs) || []),
                        { status: "assigned", timestamp: new Date(), driverId: nearestDriver.id },
                    ],
                },
            });
            await db.collection("drivers").doc(nearestDriver.id).update({
                currentOrderId: context.params.orderId,
            });
            console.log(`Assigned driver ${nearestDriver.id} to order ${context.params.orderId}`);
        }
        else {
            console.log("No drivers available");
            // Update order to show no drivers available
            await change.after.ref.update({
                status: "pending",
                driverSearchFailed: true,
                tracking: {
                    status: "searching_driver",
                    logs: [
                        ...(((_d = after.tracking) === null || _d === void 0 ? void 0 : _d.logs) || []),
                        { status: "no_driver_available", timestamp: new Date() },
                    ],
                },
            });
        }
    }
    return null;
});
// 5. onDriverLocationUpdate
exports.onDriverLocationUpdate = functions.firestore
    .document("drivers/{driverId}")
    .onUpdate(async (change, _context) => {
    const after = change.after.data();
    const before = change.before.data();
    if (!after.location || !after.currentOrderId)
        return null;
    // If location changed significantly
    if (before.location &&
        before.location.lat === after.location.lat &&
        before.location.lng === after.location.lng) {
        return null;
    }
    // Update order with driver location for live tracking
    await db.collection("orders").doc(after.currentOrderId).update({
        "driverLocation": after.location,
    });
    return null;
});
// 6. calculateSmartETA (Callable)
exports.calculateSmartETA = functions.https.onCall(async (data, _context) => {
    const { origin, destination } = data;
    // Mock ETA calculation
    const dist = (0, utils_1.calculateDistance)(origin.lat, origin.lng, destination.lat, destination.lng);
    const time = (0, utils_1.estimateTime)(dist);
    return { etaMinutes: Math.round(time), distanceKm: dist.toFixed(1) };
});
// 7. generateSurgePrice (Callable)
exports.generateSurgePrice = functions.https.onCall(async (_data, _context) => {
    const hour = new Date().getHours();
    return { multiplier: (0, utils_1.getSurgeMultiplier)(hour) };
});
// 8. updateDriverScore (Scheduled or Trigger)
// Let's make it a trigger on order completion
exports.updateDriverScore = functions.firestore
    .document("orders/{orderId}")
    .onUpdate(async (change, _context) => {
    const after = change.after.data();
    const before = change.before.data();
    if (after.status === "delivered" && before.status !== "delivered") {
        const driverId = after.driverId;
        if (!driverId)
            return null;
        const driverRef = db.collection("drivers").doc(driverId);
        // Simple score update logic
        await db.runTransaction(async (t) => {
            var _a;
            const driverDoc = await t.get(driverRef);
            const currentScore = ((_a = driverDoc.data()) === null || _a === void 0 ? void 0 : _a.score) || 4.5;
            // Increment score slightly for successful delivery
            const newScore = Math.min(5.0, currentScore + 0.1);
            t.update(driverRef, { score: newScore, deliveriesCompleted: firestore_1.FieldValue.increment(1) });
        });
    }
    return null;
});
// 9. storeSubscriptionHandler (Scheduled - daily)
exports.storeSubscriptionHandler = functions.pubsub.schedule("every 24 hours").onRun(async (_context) => {
    const storesSnap = await db.collection("stores").where("subscriptionStatus", "==", "active").get();
    const now = new Date();
    const batch = db.batch();
    storesSnap.docs.forEach((doc) => {
        const data = doc.data();
        if (data.subscriptionExpiry && data.subscriptionExpiry.toDate() < now) {
            batch.update(doc.ref, { subscriptionStatus: "expired" });
        }
    });
    await batch.commit();
    return null;
});
// 10. productEmbeddingJob (Stub for Pinecone)
exports.productEmbeddingJob = functions.firestore
    .document("products/{productId}")
    .onCreate(async (snap, context) => {
    const product = snap.data();
    // Stub: Generate embedding for product.title + product.description
    console.log(`Generating embedding for product ${context.params.productId}: ${product.title}`);
    // Mock embedding vector
    const embedding = new Array(1536).fill(0).map(() => Math.random());
    // Store in Firestore for now (or send to Pinecone)
    await snap.ref.update({
        embedding: embedding,
        embeddingStatus: "completed",
    });
    return null;
});
// 11. chatServer (Firestore-based)
exports.chatServer = functions.firestore
    .document("messages/{messageId}")
    .onCreate(async (snap, _context) => {
    const msg = snap.data();
    if (msg.sender === "user") {
        // Auto-reply stub
        await db.collection("messages").add({
            threadId: msg.threadId,
            sender: "system",
            text: "Thanks for your message! Our support team will get back to you shortly.",
            createdAt: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    return null;
});
//# sourceMappingURL=index.js.map