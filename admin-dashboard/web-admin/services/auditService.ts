import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "@/utils/firebase";

export enum AuditAction {
    UPDATE_ORDER_STATUS = "UPDATE_ORDER_STATUS",
    DELETE_ORDER = "DELETE_ORDER",
    VERIFY_PAYMENT = "VERIFY_PAYMENT",
    DELETE_REVIEW = "DELETE_REVIEW",
    APPROVE_REVIEW = "APPROVE_REVIEW",
    LOGIN = "LOGIN"
}

export const AuditService = {
    async logAction(action: AuditAction, details: any, targetId?: string) {
        try {
            const user = auth.currentUser;
            if (!user) return;

            await addDoc(collection(db, "audit_logs"), {
                action,
                details,
                targetId: targetId || null,
                performedBy: user.uid,
                performedByEmail: user.email,
                timestamp: serverTimestamp(),
                userAgent: navigator.userAgent
            });
        } catch (error) {
            console.error("Failed to log audit action:", error);
        }
    }
};
