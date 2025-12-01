import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import Razorpay from "razorpay";
import * as crypto from "crypto";
import { calculateDistance, estimateTime, getSurgeMultiplier, generateOtp } from "./utils";
export * from "./ai";
export * from "./utils";

admin.initializeApp();
const db = admin.firestore();

import * as ordersController from "./src/v1/orders/controller";

// 1. Order Functions (Refactored to v1)
export const createOrder = ordersController.createOrder;
export const completeOrder = ordersController.completeOrder;
export const updateOrderStatus = ordersController.updateOrderStatus;
export const submitRating = ordersController.submitRating;

// 2. razorpayCreateOrder
export const razorpayCreateOrder = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError("unauthenticated", "User must be authenticated");
  }

  const { amount, orderId } = data;

  // Initialize Razorpay
  const razorpay = new Razorpay({
    key_id: functions.config().razorpay?.key_id || "rzp_test_123", // Fallback for dev
    key_secret: functions.config().razorpay?.key_secret || "secret_123",
  });

  const options = {
    amount: Math.round(amount * 100), // amount in paisa
    currency: "INR",
    receipt: orderId,
    notes: { orderId },
  };

  try {
    const order = await razorpay.orders.create(options);
    return order;
  } catch (error: any) {
    throw new functions.https.HttpsError("internal", error.message);
  }
});

// 3. razorpayVerifySignature
export const razorpayVerifySignature = functions.https.onCall(async (data, _context) => {
  const { orderId, paymentId, signature } = data;

  const keySecret = functions.config().razorpay?.key_secret || "secret_123";

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
        paidAt: FieldValue.serverTimestamp(),
      });
    }
    return { success: true };
  } else {
    throw new functions.https.HttpsError("permission-denied", "Invalid signature");
  }
});

// 4. autoAssignDriver (Trigger on Order Creation/Update)
export const autoAssignDriver = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const _before = change.before.data();

    // Trigger when:
    // 1. Order is newly created with COD (paymentStatus: 'pending', status: 'pending')
    // 2. OR paymentStatus changes to 'paid' (for future online payments)
    // AND driver is not yet assigned
    const shouldAssign = (
      (after.status === "pending" && !after.driverId) &&
      (after.paymentStatus === "pending" || after.paymentStatus === "paid")
    );

    if (shouldAssign) {
      // Find nearest online driver
      const driversSnap = await db.collection("drivers")
        .where("isOnline", "==", true)
        .where("currentOrderId", "==", null) // Available drivers
        .get();

      let nearestDriver: any = null;
      let minDistance = Infinity;

      // Get store location from order or use default
      const storeLat = after.storeLocation?.lat || 28.6139;
      const storeLng = after.storeLocation?.lng || 77.2090;

      driversSnap.docs.forEach((doc) => {
        const driver = doc.data();
        if (driver.location) {
          const dist = calculateDistance(storeLat, storeLng, driver.location.lat, driver.location.lng);
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
          assignedAt: FieldValue.serverTimestamp(),
          tracking: {
            status: "assigned",
            logs: [
              ...(after.tracking?.logs || []),
              { status: "assigned", timestamp: new Date(), driverId: nearestDriver.id },
            ],
          },
        });
        await db.collection("drivers").doc(nearestDriver.id).update({
          currentOrderId: context.params.orderId,
        });
        console.log(`Assigned driver ${nearestDriver.id} to order ${context.params.orderId}`);
      } else {
        console.log("No drivers available");
        // Update order to show no drivers available
        await change.after.ref.update({
          status: "pending",
          driverSearchFailed: true,
          tracking: {
            status: "searching_driver",
            logs: [
              ...(after.tracking?.logs || []),
              { status: "no_driver_available", timestamp: new Date() },
            ],
          },
        });
      }
    }
    return null;
  });

// 5. onDriverLocationUpdate
export const onDriverLocationUpdate = functions.firestore
  .document("drivers/{driverId}")
  .onUpdate(async (change, _context) => {
    const after = change.after.data();
    const before = change.before.data();

    if (!after.location || !after.currentOrderId) return null;

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
export const calculateSmartETA = functions.https.onCall(async (data, _context) => {
  const { origin, destination } = data;
  // Mock ETA calculation
  const dist = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
  const time = estimateTime(dist);
  return { etaMinutes: Math.round(time), distanceKm: dist.toFixed(1) };
});

// 7. generateSurgePrice (Callable)
export const generateSurgePrice = functions.https.onCall(async (_data, _context) => {
  const hour = new Date().getHours();
  return { multiplier: getSurgeMultiplier(hour) };
});

// 8. updateDriverScore (Scheduled or Trigger)
// Let's make it a trigger on order completion
export const updateDriverScore = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, _context) => {
    const after = change.after.data();
    const before = change.before.data();

    if (after.status === "delivered" && before.status !== "delivered") {
      const driverId = after.driverId;
      if (!driverId) return null;

      const driverRef = db.collection("drivers").doc(driverId);
      // Simple score update logic
      await db.runTransaction(async (t) => {
        const driverDoc = await t.get(driverRef);
        const currentScore = driverDoc.data()?.score || 4.5;
        // Increment score slightly for successful delivery
        const newScore = Math.min(5.0, currentScore + 0.1);
        t.update(driverRef, { score: newScore, deliveriesCompleted: FieldValue.increment(1) });
      });
    }
    return null;
  });

// 9. storeSubscriptionHandler (Scheduled - daily)
export const storeSubscriptionHandler = functions.pubsub.schedule("every 24 hours").onRun(async (_context) => {
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
export const productEmbeddingJob = functions.firestore
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
export const chatServer = functions.firestore
  .document("messages/{messageId}")
  .onCreate(async (snap, _context) => {
    const msg = snap.data();
    if (msg.sender === "user") {
      // Auto-reply stub
      await db.collection("messages").add({
        threadId: msg.threadId,
        sender: "system",
        text: "Thanks for your message! Our support team will get back to you shortly.",
        createdAt: FieldValue.serverTimestamp(),
      });
    }
    return null;
  });
