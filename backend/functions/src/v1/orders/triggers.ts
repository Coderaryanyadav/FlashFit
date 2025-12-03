import * as functions from "firebase-functions";
import { db } from "../../common/db";
import { calculateDistance } from "../../common/utils";
import { FieldValue } from "firebase-admin/firestore";

export const autoAssignDriver = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();

    // Prevent infinite loops
    if (after.driverSearchFailed && after.status === "pending") {
      // Already tried and failed, don't retry immediately or loop
      return null;
    }

    const shouldAssign = (
      (after.status === "pending" && !after.driverId) &&
      (after.paymentStatus === "pending" || after.paymentStatus === "paid")
    );

    if (shouldAssign) {
      const storeLat = after.storeLocation?.lat || 28.6139;
      const storeLng = after.storeLocation?.lng || 77.2090;

      await db.runTransaction(async (t) => {
        // 1. Find available drivers
        const driversSnap = await t.get(
          db.collection("drivers")
            .where("isOnline", "==", true)
            .where("currentOrderId", "==", null)
        );

        let nearestDriver: any = null;
        let minDistance = Infinity;

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
          // 2. Assign driver (Atomic update)
          t.update(change.after.ref, {
            driverId: nearestDriver.id,
            status: "assigned",
            assignedAt: FieldValue.serverTimestamp(),
            tracking: {
              status: "assigned",
              logs: FieldValue.arrayUnion({
                status: "assigned",
                timestamp: new Date(),
                driverId: nearestDriver.id
              }),
            },
          });

          t.update(nearestDriver.ref, {
            currentOrderId: context.params.orderId,
          });

          // Note: We can't log to console inside transaction easily, but it's fine.
        } else {
          // 3. Mark as failed (Atomic update)
          t.update(change.after.ref, {
            // Keep status pending so admin can see it, but mark failed to stop loop
            driverSearchFailed: true,
            tracking: {
              status: "searching_driver",
              logs: FieldValue.arrayUnion({
                status: "no_driver_available",
                timestamp: new Date()
              }),
            },
          });
        }
      });
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
