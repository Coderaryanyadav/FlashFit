export interface Product {
    id: string;
    title: string;
    price: number;
    image: string;
    description?: string;
    category?: string;
    rating?: number;
    reviews?: number;
    sizes?: string[];
    colors?: string[];
}

export interface CartItem extends Product {
    quantity: number;
    size?: string;
    color?: string;
}

export interface Address {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
}

export type OrderStatus = 'placed' | 'confirmed' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled' | 'warehouse_reached' | 'returning' | 'completed';

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    totalAmount: number;
    status: OrderStatus;
    createdAt: any; // Firebase Timestamp
    address: Address;
    driverId?: string;
    driverName?: string;
    driverPhone?: string;
    paymentId?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    paymentVerifiedBy?: string;
    paymentVerifiedAt?: Date;
}

export interface UserProfile {
    uid: string;
    email: string;
    displayName?: string;
    photoURL?: string;
    phone?: string;
    role: 'customer' | 'admin' | 'driver';
    addresses?: Address[];
    createdAt: any;
}
