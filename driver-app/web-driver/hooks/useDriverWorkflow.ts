import { useState, useEffect } from "react";
import { db } from "@/utils/firebase";
import { doc, updateDoc, serverTimestamp, onSnapshot, query, collection, where } from "firebase/firestore";

export function useDriverWorkflow(user: any) {
    const [activeOrder, setActiveOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, "orders"),
            where("driverId", "==", user.uid),
            where("status", "in", ["assigned", "picked_up", "delivered", "returning", "warehouse_reached"])
        );

        const unsub = onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
                const orderDoc = snapshot.docs[0];
                setActiveOrder({ id: orderDoc.id, ...orderDoc.data() });
            } else {
                setActiveOrder(null);
            }
            setLoading(false);
        });

        return () => unsub();
    }, [user]);

    const updateStatus = async (newStatus: string) => {
        if (!activeOrder || !user) return;
        try {
            await updateDoc(doc(db, "orders", activeOrder.id), {
                status: newStatus,
                lastUpdated: serverTimestamp()
            });
        } catch (error) {
            console.error("Error updating status:", error);
            throw error;
        }
    };

    return { activeOrder, loading, updateStatus };
}
