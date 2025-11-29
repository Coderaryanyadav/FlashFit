import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { OrderService } from '../../backend/packages/core/OrderService';
import { Order } from '../../backend/packages/types';

export default function DriverApp() {
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        // Example of using shared logic in Mobile App
        console.log("Mobile App: Initializing Order Service...");
    }, []);

    const handleAccept = async (orderId: string) => {
        try {
            await OrderService.acceptOrder(orderId, "driver-123", "John Doe");
            alert("Order Accepted!");
        } catch (error) {
            alert("Failed to accept order: " + error);
        }
    };

    return (
        <View>
            <Text>FlashFit Driver App (Mobile)</Text>
            <Text>Active Orders: {orders.length}</Text>
        </View>
    );
}
