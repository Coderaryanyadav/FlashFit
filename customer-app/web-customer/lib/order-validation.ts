import { ORDER_LIMITS, DELIVERY_ZONES } from '@/config/business-rules';
import { ValidationError } from '@/lib/errors';

const SERVICEABLE_PINCODES = DELIVERY_ZONES.MUMBAI_GOREGAON.pincodes as readonly string[];
const MUMBAI_BOUNDS = DELIVERY_ZONES.MUMBAI_GOREGAON.bounds;

export interface OrderRequest {
    items: Array<{
        id: string;
        title: string;
        price: number;
        quantity: number;
        size?: string;
    }>;
    address: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        location: {
            lat: number;
            lng: number;
        };
    };
    storeId: string;
    totalAmount: number;
    userId: string;
}

export function validatePincode(pincode: string): void {
    if (!pincode || typeof pincode !== 'string') {
        throw new ValidationError('Invalid pincode format');
    }

    const cleanPincode = pincode.trim();
    if (!SERVICEABLE_PINCODES.includes(cleanPincode)) {
        throw new ValidationError(
            'Sorry, we don\'t deliver to pincode ' + cleanPincode + '. Currently serving: ' + SERVICEABLE_PINCODES.join(', ')
        );
    }
}

export function validateLocation(lat: number, lng: number): void {
    if (typeof lat !== 'number' || typeof lng !== 'number') {
        throw new ValidationError('Invalid location coordinates');
    }

    if (lat < MUMBAI_BOUNDS.lat.min || lat > MUMBAI_BOUNDS.lat.max ||
        lng < MUMBAI_BOUNDS.lng.min || lng > MUMBAI_BOUNDS.lng.max) {
        throw new ValidationError('Delivery location is outside our service area (Mumbai region only)');
    }
}

export function validateAddress(address: OrderRequest['address']): void {
    const requiredFields = ['street', 'city', 'state', 'pincode'];
    for (const field of requiredFields) {
        if (!address[field as keyof typeof address] || typeof address[field as keyof typeof address] !== 'string') {
            throw new ValidationError(`Missing or invalid address field: ${field}`);
        }

        const value = address[field as keyof typeof address] as string;
        if (value.length > 200) {
            throw new ValidationError(`Address field ${field} is too long (max 200 characters)`);
        }

        // Basic XSS prevention
        if (/<script|javascript:|onerror=/i.test(value)) {
            throw new ValidationError(`Invalid characters in address field: ${field}`);
        }
    }

    validatePincode(address.pincode);
    validateLocation(address.location.lat, address.location.lng);
}

export function validateItems(items: OrderRequest['items']): void {
    if (!Array.isArray(items) || items.length === 0) {
        throw new ValidationError('Order must contain at least one item');
    }

    if (items.length > ORDER_LIMITS.MAX_ITEMS_PER_ORDER) {
        throw new ValidationError(`Order cannot contain more than ${ORDER_LIMITS.MAX_ITEMS_PER_ORDER} items`);
    }

    for (const item of items) {
        if (!item.id || !item.title || typeof item.price !== 'number' || typeof item.quantity !== 'number') {
            throw new ValidationError('Invalid item format');
        }

        if (item.quantity <= 0 || item.quantity > ORDER_LIMITS.MAX_QUANTITY_PER_ITEM) {
            throw new ValidationError(
                `Item quantity must be between 1 and ${ORDER_LIMITS.MAX_QUANTITY_PER_ITEM}`
            );
        }

        if (item.price < 0) {
            throw new ValidationError('Item price cannot be negative');
        }
    }
}

export function validateTotalAmount(totalAmount: number, items: OrderRequest['items']): void {
    if (typeof totalAmount !== 'number' || totalAmount < 0) {
        throw new ValidationError('Invalid total amount');
    }

    if (totalAmount < ORDER_LIMITS.MIN_ORDER_AMOUNT) {
        throw new ValidationError(`Minimum order amount is ₹${ORDER_LIMITS.MIN_ORDER_AMOUNT}`);
    }

    if (totalAmount > ORDER_LIMITS.MAX_ORDER_AMOUNT) {
        throw new ValidationError(`Maximum order amount is ₹${ORDER_LIMITS.MAX_ORDER_AMOUNT}`);
    }

    // Validate total matches sum of items
    const calculatedTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (Math.abs(calculatedTotal - totalAmount) > 0.01) {
        throw new ValidationError('Total amount does not match sum of items');
    }
}

export function validateOrderRequest(data: OrderRequest): void {
    validateItems(data.items);
    validateAddress(data.address);
    validateTotalAmount(data.totalAmount, data.items);

    if (!data.storeId || typeof data.storeId !== 'string') {
        throw new ValidationError('Invalid store ID');
    }

    if (!data.userId || typeof data.userId !== 'string') {
        throw new ValidationError('Invalid user ID');
    }
}
