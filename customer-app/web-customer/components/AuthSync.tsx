"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/utils/firebase";

export function AuthSync() {
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const userRef = doc(db, "users", user.uid);
                    const userSnap = await getDoc(userRef);

                    if (!userSnap.exists()) {
                        console.log("User document missing, creating sync for:", user.email);
                        await setDoc(userRef, {
                            uid: user.uid,
                            email: user.email,
                            displayName: user.displayName || user.email?.split('@')[0] || "User",
                            createdAt: serverTimestamp(),
                            role: "customer",
                            totalOrders: 0,
                            emailVerified: user.emailVerified
                        });
                        console.log("User document synced to Firestore.");
                    }
                } catch (error) {
                    console.error("Error syncing user to Firestore:", error);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return null;
}
