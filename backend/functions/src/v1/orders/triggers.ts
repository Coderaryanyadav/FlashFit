import * as functions from "firebase-functions";
import { db } from "../../common/db";
import { calculateDistance } from "../../common/utils";
import { FieldValue } from "firebase-admin/firestore";

export const autoAssignDriver = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const after = change.after.data();

    const shouldAssign = (
      (after.status === "pending" && !after.driverId) &&
            (after.paymentStatus === "pending" || after.paymentStatus === "paid")
    );

    if (shouldAssign) {
      const driversSnap = await db.collection("drivers")
        .where("isOnline", "==", true)
        .where("currentOrderId", "==", null)
        .get();

      let nearestDriver: any = null;
      let minDistance = Infinity;

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

export const updateDriverScore = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();

    if (after.status === "delivered" && before.status !== "delivered") {
      const driverId = after.driverId;
      if (!driverId) return null;

      const driverRef = db.collection("drivers").doc(driverId);
      await db.runTransaction(async (t) => {
        const driverDoc = await t.get(driverRef);
        const currentScore = driverDoc.data()?.score || 4.5;
        const newScore = Math.min(5.0, currentScore + 0.1);
        t.update(driverRef, { score: newScore, deliveriesCompleted: FieldValue.increment(1) });
      });
    }
    return null;
  });
