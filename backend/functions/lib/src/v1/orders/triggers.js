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
exports.updateDriverScore = exports.autoAssignDriver = void 0;
const functions = __importStar(require("firebase-functions"));
const db_1 = require("../../common/db");
const utils_1 = require("../../common/utils");
const firestore_1 = require("firebase-admin/firestore");
exports.autoAssignDriver = functions.firestore
    .document("orders/{orderId}")
    .onUpdate(async (change, context) => {
    var _a, _b, _c, _d;
    const after = change.after.data();
    const shouldAssign = ((after.status === "pending" && !after.driverId) &&
        (after.paymentStatus === "pending" || after.paymentStatus === "paid"));
    if (shouldAssign) {
        const driversSnap = await db_1.db.collection("drivers")
            .where("isOnline", "==", true)
            .where("currentOrderId", "==", null)
            .get();
        let nearestDriver = null;
        let minDistance = Infinity;
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
            await db_1.db.collection("drivers").doc(nearestDriver.id).update({
                currentOrderId: context.params.orderId,
            });
            console.log(`Assigned driver ${nearestDriver.id} to order ${context.params.orderId}`);
        }
        else {
            console.log("No drivers available");
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
exports.updateDriverScore = functions.firestore
    .document("orders/{orderId}")
    .onUpdate(async (change, context) => {
    const after = change.after.data();
    const before = change.before.data();
    if (after.status === "delivered" && before.status !== "delivered") {
        const driverId = after.driverId;
        if (!driverId)
            return null;
        const driverRef = db_1.db.collection("drivers").doc(driverId);
        await db_1.db.runTransaction(async (t) => {
            var _a;
            const driverDoc = await t.get(driverRef);
            const currentScore = ((_a = driverDoc.data()) === null || _a === void 0 ? void 0 : _a.score) || 4.5;
            const newScore = Math.min(5.0, currentScore + 0.1);
            t.update(driverRef, { score: newScore, deliveriesCompleted: firestore_1.FieldValue.increment(1) });
        });
    }
    return null;
});
//# sourceMappingURL=triggers.js.map