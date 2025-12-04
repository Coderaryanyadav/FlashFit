// User Types
export type UserRole = 'customer' | 'driver' | 'admin';

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
    photoURL?: string;
    role: UserRole;
    createdAt: Date;
    lastLogin?: Date;
}

export interface DriverProfile extends UserProfile {
    isOnline: boolean;
    vehicleType?: string;
    licenseNumber?: string;
    currentOrderId?: string | null;
    rating?: number;
    totalDeliveries?: number;
}

export interface SellerProfile extends UserProfile {
    storeName: string;
    storeDescription?: string;
    storeAddress?: Address;
    gstNumber?: string;
    isVerified: boolean;
    rating?: number;
    totalSales?: number;
}

// Product Types
export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    stock: number | Record<string, number>; // Number or Size Map
    storeId: string;
    isActive: boolean;
}

export interface CartItem {
    id: string;
    productId: string;
    quantity: number;
    size?: string;
    price: number; // Snapshot of price at time of add
    title: string;
    image?: string;
}

// Order Types
export type OrderStatus =
    | 'placed'
    | 'confirmed'
    | 'assigned'
    | 'picked_up'
    | 'delivered'
    | 'returning'
    | 'warehouse_reached'
    | 'cancelled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface Address {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    location?: { lat: number; lng: number };
    phone?: string;
    name?: string;
}

export interface Order {
    id: string;
    userId: string; // Customer ID
    storeId: string;
    storeName?: string;
    pickupAddress?: Address | string;
    driverId?: string;
    driverName?: string;
    driverPhone?: string;

    items: CartItem[];
    totalAmount: number;
    shippingAddress: Address;

    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentId?: string;

    createdAt: any; // Firestore Timestamp
    updatedAt?: any;
    deliveredAt?: any;

    deliveryOtp?: string;
    tracking?: {
        status: OrderStatus;
        logs: Array<{ status: OrderStatus; timestamp: any; description?: string }>;
    };
}

// API Responses
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
