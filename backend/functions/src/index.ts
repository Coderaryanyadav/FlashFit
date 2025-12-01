import { createOrder, completeOrder, updateOrderStatus } from "./v1/orders/controller";
import { autoAssignDriver, updateDriverScore } from "./v1/orders/triggers";
import { onDriverLocationUpdate } from "./v1/drivers/triggers";

// Export v1 functions
export {
    createOrder,
    completeOrder,
    updateOrderStatus,
    autoAssignDriver,
    updateDriverScore,
    onDriverLocationUpdate
};

// Re-export legacy functions (temporarily until migrated)
// Note: We are NOT exporting the old monolithic index.ts content directly.
// We are selectively exporting the new modular functions.
// If there are other functions in the old index.ts that we haven't migrated yet (like Razorpay, AI),
// we should migrate them or temporarily import them.

// For this step, I will only export what I have migrated to ensure the build works for these parts.
// I will need to migrate the rest in subsequent steps or turns.
