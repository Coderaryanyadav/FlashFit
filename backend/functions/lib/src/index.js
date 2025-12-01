"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDriverLocationUpdate = exports.updateDriverScore = exports.autoAssignDriver = exports.updateOrderStatus = exports.completeOrder = exports.createOrder = void 0;
const controller_1 = require("./v1/orders/controller");
Object.defineProperty(exports, "createOrder", { enumerable: true, get: function () { return controller_1.createOrder; } });
Object.defineProperty(exports, "completeOrder", { enumerable: true, get: function () { return controller_1.completeOrder; } });
Object.defineProperty(exports, "updateOrderStatus", { enumerable: true, get: function () { return controller_1.updateOrderStatus; } });
const triggers_1 = require("./v1/orders/triggers");
Object.defineProperty(exports, "autoAssignDriver", { enumerable: true, get: function () { return triggers_1.autoAssignDriver; } });
Object.defineProperty(exports, "updateDriverScore", { enumerable: true, get: function () { return triggers_1.updateDriverScore; } });
const triggers_2 = require("./v1/drivers/triggers");
Object.defineProperty(exports, "onDriverLocationUpdate", { enumerable: true, get: function () { return triggers_2.onDriverLocationUpdate; } });
// Re-export legacy functions (temporarily until migrated)
// Note: We are NOT exporting the old monolithic index.ts content directly.
// We are selectively exporting the new modular functions.
// If there are other functions in the old index.ts that we haven't migrated yet (like Razorpay, AI),
// we should migrate them or temporarily import them.
// For this step, I will only export what I have migrated to ensure the build works for these parts.
// I will need to migrate the rest in subsequent steps or turns.
//# sourceMappingURL=index.js.map