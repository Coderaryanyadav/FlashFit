import * as functions from "firebase-functions";
import { db } from "../../common/db";

export const onDriverLocationUpdate = functions.firestore
    .document("drivers/{driverId}")
    .onUpdate(async (change, context) => {
        const after = change.after.data();
        const before = change.before.data();

        if (!after.location || !after.currentOrderId) return null;

        if (before.location &&
            before.location.lat === after.location.lat &&
            before.location.lng === after.location.lng) {
            return null;
        }

        await db.collection("orders").doc(after.currentOrderId).update({
            "driverLocation": after.location,
        });

        return null;
    });
