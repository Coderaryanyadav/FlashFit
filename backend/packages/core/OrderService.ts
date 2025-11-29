import { db } from "@/utils/firebase"; // Standardized path for all apps
import { collection, addDoc, updateDoc, doc, serverTimestamp, runTransaction, getDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Order, OrderStatus } from "../types"; // Relative import assuming structure

export const OrderService = {
    /**
     * Creates a new order in Firestore with mock location logic for demo purposes.
     */
    async createOrder(userId: string, cartItems: any[], totalAmount: number, address: any) {
        // Mock Location Logic (Near the driver for demo)
        // Driver Mock Location: 19.1663, 72.8526 (Goregaon East)
        const mockLat = 19.1663 + (Math.random() * 0.01 - 0.005);
        const mockLng = 72.8526 + (Math.random() * 0.01 - 0.005);

        const orderData = {
            userId,
            items: cartItems,
            totalAmount,
            status: 'placed',
            createdAt: serverTimestamp(),
            address,
            paymentStatus: 'pending',
            location: {
                lat: mockLat,
                lng: mockLng
            }
        };

        const docRef = await addDoc(collection(db, "orders"), orderData);
        return docRef.id;
    },

    /**
     * Updates the status of an order.
     */
    async updateStatus(orderId: string, status: OrderStatus) {
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { status });
    },

    /**
     * Assigns a driver to an order using a transaction to prevent race conditions.
     */
    /**
     * Assigns a driver to an order using a transaction to prevent race conditions.
     */
    async acceptOrder(orderId: string, driverId: string, driverName: string) {
        const orderRef = doc(db, "orders", orderId);

        await runTransaction(db, async (transaction) => {
            const orderDoc = await transaction.get(orderRef);
            if (!orderDoc.exists()) throw "Order does not exist!";

            const data = orderDoc.data();
            if (data.status !== "placed" && data.status !== "pending") {
                throw "Order is no longer available.";
            }

            transaction.update(orderRef, {
                status: "assigned",
                driverId: driverId,
                driverName: driverName,
                updatedAt: serverTimestamp()
            });
        });
    },

    async getOrderById(orderId: string): Promise<Order | null> {
        try {
            const orderDoc = await getDoc(doc(db, "orders", orderId));
            if (orderDoc.exists()) {
                return { id: orderDoc.id, ...orderDoc.data() } as Order;
            }
            return null;
        } catch (error) {
            console.error("Error fetching order:", error);
            throw error;
        }
    },

    subscribeToUserOrders(userId: string, callback: (orders: Order[]) => void) {
        const q = query(
            collection(db, "orders"),
            where("userId", "==", userId),
            orderBy("createdAt", "desc")
        );

        return onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Order[];
            callback(orders);
        });
    }
};
