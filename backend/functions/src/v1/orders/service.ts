import { db } from "../../common/db";
import { getSurgeMultiplier, generateOtp } from "../../common/utils";
import { FieldValue } from "firebase-admin/firestore";
import * as functions from "firebase-functions";

export class OrderService {
  async createOrder(userId: string, data: any) {
    const { items, address, storeId, totalAmount } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new functions.https.HttpsError("invalid-argument", "Order must contain at least one item");
    }

    // Calculate surge
    const hour = new Date().getHours();
    const surgeMultiplier = getSurgeMultiplier(hour);
    const finalAmount = totalAmount * surgeMultiplier;

    const orderRef = db.collection("orders").doc();
    const deliveryOtp = generateOtp();
    let maxDeliveryDays = 2;

    // Transaction to handle inventory and order creation
    await db.runTransaction(async (t) => {
      // 1. READS: Fetch all necessary data first
      const productRefs = items.map((item: any) => db.collection("products").doc(item.productId));
      const productDocs = await t.getAll(...productRefs);

      let storeDoc: FirebaseFirestore.DocumentSnapshot | null = null;
      if (storeId) {
        storeDoc = await t.get(db.collection("users").doc(storeId));
      }

      // 2. LOGIC & VALIDATION
      const productUpdates: { ref: FirebaseFirestore.DocumentReference; data: any }[] = [];

      items.forEach((item: any, index: number) => {
        const productDoc = productDocs[index];

        if (!productDoc.exists) {
          throw new functions.https.HttpsError("not-found", `Product ${item.productId} not found`);
        }

        const productData = productDoc.data();

        // Handle stock validation
        if (productData?.stock && typeof productData.stock === "object") {
          // Size-based stock
          if (!item.size) {
            throw new functions.https.HttpsError(
              "invalid-argument",
              `Size selection is required for ${productData.title}`
            );
          }
          const currentStock = productData.stock[item.size] || 0;
          if (currentStock < item.quantity) {
            throw new functions.https.HttpsError(
              "failed-precondition",
              `Insufficient stock for ${productData.title} size ${item.size}`
            );
          }
          // Prepare update
          productUpdates.push({
            ref: productDoc.ref,
            data: { [`stock.${item.size}`]: currentStock - item.quantity }
          });
        } else {
          // Global stock (number)
          const currentStock = typeof productData?.stock === "number" ? productData.stock : 0;
          if (currentStock < item.quantity) {
            throw new functions.https.HttpsError("failed-precondition", `Insufficient stock for ${productData?.title}`);
          }
          // Only update if it's a number
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

      const expectedDeliveryDate = new Date();
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + maxDeliveryDays);

      // Fetch store details from pre-fetched doc
      let storeName = "FlashFit Store";
      let pickupAddress = "Goregaon, Mumbai";

      if (storeDoc && storeDoc.exists) {
        const storeData = storeDoc.data();
        storeName = storeData?.storeName || storeData?.displayName || storeName;
        pickupAddress = storeData?.storeAddress || pickupAddress;
      }

      // 3. WRITES: Perform all updates and sets

      // Update products
      for (const update of productUpdates) {
        t.update(update.ref, update.data);
      }

      // Create Order
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
        paymentMethod: "COD", // Enforce COD
        totalAmount: finalAmount,
        surgeMultiplier,
        deliveryOtp,
        estimatedDeliveryAt: expectedDeliveryDate,
        createdAt: FieldValue.serverTimestamp(),
        tracking: {
          status: "placed",
          // logs: [] // Moved to subcollection
        },
      };

      t.set(orderRef, orderData);

      // Add initial log to subcollection
      const logRef = orderRef.collection("logs").doc();
      t.set(logRef, {
        status: "placed",
        timestamp: FieldValue.serverTimestamp(),
        description: "Order placed successfully",
      });
    });

    return { orderId: orderRef.id, finalAmount };
  }

  async completeOrder(callerId: string, orderId: string, deliveredItemIds: string[], otp?: string) {
    const orderRef = db.collection("orders").doc(orderId);

    await db.runTransaction(async (t) => {
      const orderDoc = await t.get(orderRef);
      if (!orderDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Order not found");
      }

      const orderData = orderDoc.data();

      // Security Check: Ensure caller is the assigned driver
      if (orderData?.driverId !== callerId) {
        throw new functions.https.HttpsError("permission-denied", "You are not authorized to complete this order");
      }

      // Verify OTP
      if (orderData?.deliveryOtp && orderData.deliveryOtp !== otp) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid OTP");
      }

      const items = orderData?.items || [];

      const updatedItems = items.map((item: any) => {
        const itemId = item.id || item.productId;
        const isDelivered = deliveredItemIds.includes(itemId);
        return {
          ...item,
          status: isDelivered ? "delivered" : "returned",
        };
      });

      const returnedItems = items.filter((item: any) => {
        const itemId = item.id || item.productId;
        return !deliveredItemIds.includes(itemId);
      });

      const deliveredItems = items.filter((item: any) => {
        const itemId = item.id || item.productId;
        return deliveredItemIds.includes(itemId);
      });

      // PRE-FETCH returned products
      const returnedProductRefs = returnedItems.map((item: any) => {
        const productId = item.productId || item.id;
        return productId ? db.collection("products").doc(productId) : null;
      }).filter((ref: any) => ref !== null);

      let returnedProductDocs: FirebaseFirestore.DocumentSnapshot[] = [];
      if (returnedProductRefs.length > 0) {
        returnedProductDocs = await t.getAll(...returnedProductRefs);
      }

      // Recalculate Total Amount based on delivered items
      const surgeMultiplier = orderData?.surgeMultiplier || 1;
      const newTotalBase = deliveredItems.reduce(
        (sum: number, item: any) => sum + (item.price * (item.quantity || 1)),
        0
      );
      const newFinalAmount = newTotalBase * surgeMultiplier;


      // Prepare product updates
      const productUpdates: { ref: FirebaseFirestore.DocumentReference; data: any }[] = [];

      returnedItems.forEach((item: any) => {
        const productId = item.productId || item.id;
        if (productId) {
          // Find the doc
          const productDoc = returnedProductDocs.find(d => d.id === productId);
          if (productDoc && productDoc.exists) {
            const productData = productDoc.data();
            if (item.size && productData?.stock && typeof productData.stock === "object") {
              const currentStock = productData.stock[item.size] || 0;
              productUpdates.push({
                ref: productDoc.ref,
                data: { [`stock.${item.size}`]: currentStock + (item.quantity || 1) }
              });
            } else {
              const currentStock = typeof productData?.stock === "number" ? productData.stock : 0;
              if (typeof productData?.stock === "number") {
                productUpdates.push({
                  ref: productDoc.ref,
                  data: { stock: currentStock + (item.quantity || 1) }
                });
              }
            }
          }
        }
      });

      const allReturned = deliveredItemIds.length === 0;
      const newStatus = allReturned ? "returning" : "delivered";
      const currentPaymentStatus = orderData?.paymentStatus || "pending";

      // If COD, payment is collected now. If Online, it was already paid.
      // If partial return on Online order -> Refund needed (Manual for now).
      // If partial return on COD -> Collect newFinalAmount.
      // For MVP, if delivered, we assume payment is collected/verified.
      const newPaymentStatus = allReturned ? "cancelled" : (
        orderData?.paymentMethod === "COD" ? "paid" : currentPaymentStatus
      );

      // WRITES START HERE

      // Update products
      for (const update of productUpdates) {
        t.update(update.ref, update.data);
      }

      // Credit Driver Earnings (Flat fee for MVP)
      const DELIVERY_FEE = 50;
      if (newStatus === "delivered" && orderData?.driverId) {
        const driverRef = db.collection("drivers").doc(orderData.driverId);
        t.update(driverRef, {
          totalEarnings: FieldValue.increment(DELIVERY_FEE),
          totalDeliveries: FieldValue.increment(1),
        });
      }

      t.update(orderRef, {
        status: newStatus,
        items: updatedItems,
        totalAmount: newFinalAmount, // Update total amount to reflect actual delivery
        deliveredAt: FieldValue.serverTimestamp(),
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
        timestamp: FieldValue.serverTimestamp(),
        description: allReturned ? "Order returned" : `Order delivered. Amount: ${newFinalAmount}`,
      });
    });

    return { success: true };
  }

  async updateOrderStatus(callerId: string, orderId: string, status: string, description?: string) {
    const orderRef = db.collection("orders").doc(orderId);

    await db.runTransaction(async (t) => {
      const orderDoc = await t.get(orderRef);
      if (!orderDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Order not found");
      }

      const orderData = orderDoc.data();

      // Security Check: Ensure caller is the assigned driver or admin
      let isAdmin = false;
      if (orderData?.driverId !== callerId) {
        const userRef = db.collection("users").doc(callerId);
        const userDoc = await t.get(userRef);
        const userData = userDoc.data();
        if (userData?.role === "admin") {
          isAdmin = true;
        } else {
          throw new functions.https.HttpsError(
            "permission-denied",
            "You are not authorized to update this order"
          );
        }
      }

      // Determine if we need to restore stock (Read Phase)
      const shouldRestoreStock = status === "cancelled" && orderData?.status !== "cancelled" && orderData?.status !== "returned";
      const items = orderData?.items || [];
      const productUpdates: { ref: FirebaseFirestore.DocumentReference; data: any }[] = [];

      if (shouldRestoreStock) {
        const productRefs = items.map((item: any) => {
          const productId = item.productId || item.id;
          return productId ? db.collection("products").doc(productId) : null;
        }).filter((ref: any) => ref !== null);

        if (productRefs.length > 0) {
          const productDocs = await t.getAll(...productRefs);

          items.forEach((item: any) => {
            const productId = item.productId || item.id;
            if (productId) {
              const productDoc = productDocs.find(d => d.id === productId);
              if (productDoc && productDoc.exists) {
                const productData = productDoc.data() as any;
                if (item.size && productData?.stock && typeof productData.stock === "object") {
                  const currentStock = productData.stock[item.size] || 0;
                  productUpdates.push({
                    ref: productDoc.ref as FirebaseFirestore.DocumentReference,
                    data: { [`stock.${item.size}`]: currentStock + (item.quantity || 1) }
                  });
                } else {
                  const currentStock = typeof productData?.stock === "number" ? productData.stock : 0;
                  if (typeof productData?.stock === "number") {
                    productUpdates.push({
                      ref: productDoc.ref as FirebaseFirestore.DocumentReference,
                      data: { stock: currentStock + (item.quantity || 1) }
                    });
                  }
                }
              }
            }
          });
        }
      }

      // WRITES START HERE

      // 1. Update Order
      t.update(orderRef, {
        status,
        updatedAt: FieldValue.serverTimestamp(),
        ...(status === "delivered" ? { deliveredAt: FieldValue.serverTimestamp() } : {}),
        tracking: {
          status: status,
          logs: FieldValue.arrayUnion({
            status,
            timestamp: new Date(),
            description: description || `Order status updated to ${status}`,
          }),
        },
      });

      // 2. Restore Stock if needed
      for (const update of productUpdates) {
        t.update(update.ref, update.data);
      }
    });

    return { success: true };
  }

  async submitRating(callerId: string, orderId: string, rating: number, review?: string): Promise<any> {
    const orderRef = db.collection("orders").doc(orderId);

    await db.runTransaction(async (t) => {
      const orderDoc = await t.get(orderRef);
      if (!orderDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Order not found");
      }

      const orderData = orderDoc.data();
      if (orderData?.userId !== callerId) {
        throw new functions.https.HttpsError("permission-denied", "You can only rate your own orders");
      }

      if (orderData?.status !== "delivered" && orderData?.status !== "completed") {
        throw new functions.https.HttpsError("failed-precondition", "Order must be delivered to submit a rating");
      }

      if (orderData?.rating) {
        throw new functions.https.HttpsError("already-exists", "Order already rated");
      }

      if (!orderData?.driverId) {
        throw new functions.https.HttpsError("failed-precondition", "No driver assigned to this order");
      }

      const driverRef = db.collection("drivers").doc(orderData.driverId);
      const driverDoc = await t.get(driverRef);

      if (!driverDoc.exists) {
        throw new functions.https.HttpsError("not-found", "Driver not found");
      }

      const driverData = driverDoc.data();
      const currentRating = driverData?.rating || 0;
      const totalRatings = driverData?.totalRatings || 0;

      const newTotalRatings = totalRatings + 1;
      const newRating = ((currentRating * totalRatings) + rating) / newTotalRatings;

      t.update(orderRef, {
        rating: rating,
        review: review || null,
        ratedAt: FieldValue.serverTimestamp(),
      });

      t.update(driverRef, {
        rating: newRating,
        totalRatings: newTotalRatings,
      });
    });

    return { success: true };
  }
}
