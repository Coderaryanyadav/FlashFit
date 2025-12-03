// Business Rules Configuration
export const ORDER_LIMITS = {
    MAX_ITEMS_PER_ORDER: 50,
    MAX_QUANTITY_PER_ITEM: 10,
    MAX_ORDER_AMOUNT: 500_000,
    MIN_ORDER_AMOUNT: 100,
} as const;

export const DELIVERY_ZONES = {
    MUMBAI_GOREGAON: {
        pincodes: ["400059", "400060", "400062", "400063", "400064", "400065", "400066", "400067", "400068", "400069"],
        bounds: {
            lat: { min: 18.90, max: 19.30 },
            lng: { min: 72.75, max: 72.95 }
        }
    }
} as const;

export const CACHE_DURATION = {
    PRODUCTS: 2 * 60 * 1000, // 2 minutes
    CATEGORIES: 5 * 60 * 1000, // 5 minutes
} as const;

export const TRANSACTION_TIMEOUT = 25000; // 25 seconds
