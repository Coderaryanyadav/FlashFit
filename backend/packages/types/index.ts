export interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL?: string | null;
    role: 'customer' | 'admin' | 'driver';
    createdAt?: any;
}

export interface Product {
    id: string;
    title: string;
    price: number;
    category: string;
    image: string;
    stock: number;
    pincodes?: string[];
    description?: string;
    createdAt?: any;
    updatedAt?: any;
}

export interface CartItem extends Product {
    quantity: number;
    size?: string;
}

export interface OrderItem {
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    size?: string;
}

export interface Location {
    lat: number;
    lng: number;
    address?: string;
}

export type OrderStatus = 'pending' | 'placed' | 'confirmed' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled' | 'completed' | 'warehouse_reached' | 'returning';
export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Order {
    id: string;
    customerId: string;
    customerName: string;
    items: OrderItem[];
    totalAmount: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    paymentId?: string;
    deliveryAddress?: string;
    deliveryLocation?: Location;
    driverId?: string;
    driverName?: string;
    driverLocation?: Location;
    createdAt: any;
    updatedAt?: any;
}

export interface Driver {
    id: string;
    name: string;
    email: string;
    phone: string;
    status: 'online' | 'offline' | 'busy';
    location?: Location;
    currentOrderId?: string;
    lastSeen?: any;
}
