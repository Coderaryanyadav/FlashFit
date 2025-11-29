import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    getDocs,
    doc,
    getDoc,
    serverTimestamp,
    limit
} from "firebase/firestore";
import { db } from "@/utils/firebase";

export interface OrderItem {
    id: string;
    title: string;
    price: number;
    quantity: number;
    image: string;
    size?: string;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: 'pending' | 'placed' | 'confirmed' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled' | 'completed' | 'warehouse_reached' | 'returning';
    shippingAddress: any;
    paymentId?: string;
    driverId?: string;
    driverName?: string;
    driverPhone?: string;
    paymentMethod?: string;
    paymentStatus?: string;
    rating?: number;
    deliveryOtp?: string;
    createdAt: any;
}

export const OrderService = {
    // Create a new order
    createOrder: async (orderData: Omit<Order, 'id' | 'createdAt'>) => {
        try {
            const docRef = await addDoc(collection(db, "orders"), {
                ...orderData,
                createdAt: serverTimestamp(),
                status: 'pending'
            });
            return docRef.id;
        } catch (error) {
            console.error("Error creating order:", error);
            throw error;
        }
    },

    // Get a single order by ID
    getOrderById: async (orderId: string) => {
        try {
            const docRef = doc(db, "orders", orderId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                return { id: docSnap.id, ...docSnap.data() } as Order;
            }
            return null;
        } catch (error) {
            console.error("Error getting order:", error);
            throw error;
        }
    },

    // Subscribe to single order (Real-time)
    subscribeToOrder: (orderId: string, callback: (order: Order | null) => void) => {
        const docRef = doc(db, "orders", orderId);
        return onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                callback({ id: docSnap.id, ...docSnap.data() } as Order);
            } else {
                callback(null);
            }
        }, (error) => {
            console.error("Error subscribing to order:", error);
            callback(null);
        });
    },

    // Subscribe to user's orders (Real-time)
    subscribeToUserOrders: (userId: string, callback: (orders: Order[]) => void) => {
        const q = query(
            collection(db, "orders"),
            where("userId", "==", userId)
        );

        return onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            callback(orders);
        }, (error) => {
            console.error("Error subscribing to orders:", error);
            // Fallback for index errors or permission issues
            callback([]);
        });
    },

    // Get user's orders (One-time fetch)
    getUserOrders: async (userId: string) => {
        try {
            const q = query(
                collection(db, "orders"),
                where("userId", "==", userId)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
        } catch (error) {
            console.error("Error fetching user orders:", error);
            throw error;
        }
    }
};
