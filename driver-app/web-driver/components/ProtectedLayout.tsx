"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/utils/firebase";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "sonner";

export default function DriverRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [isDriver, setIsDriver] = useState(false);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) {
                if (pathname !== "/login") {
                    router.push("/login");
                }
                setLoading(false);
                return;
            }

            // Verify driver role
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (!userDoc.exists() || userDoc.data().role !== "driver") {
                await auth.signOut();
                router.push("/login");
                setLoading(false);
                return;
            }

            setIsDriver(true);
            if (pathname === "/login") {
                router.push("/");
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router, pathname]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <>
            {children}
            <Toaster position="top-right" richColors />
        </>
    );
}
