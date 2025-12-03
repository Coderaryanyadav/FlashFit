"use client";

import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { Toaster } from "sonner";
import { Loader2 } from "lucide-react";

export function ClientLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<any>(null);

    const isLoginPage = pathname === "/login";

    useEffect(() => {
        // Safety timeout
        const timeout = setTimeout(() => {
            setLoading(false);
        }, 5000);

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Check role in Firestore
                    const { doc, getDoc } = await import("firebase/firestore");
                    const { db } = await import("@/utils/firebase");
                    const userDoc = await getDoc(doc(db, "users", user.uid));

                    if (userDoc.exists() && userDoc.data().role === "admin") {
                        setUser(user);
                        if (isLoginPage) {
                            router.push("/");
                        }
                    } else {
                        // Not an admin
                        console.error("Access denied: User is not an admin");
                        await auth.signOut();
                        setUser(null);
                        router.push("/login");
                    }
                } catch (error) {
                    console.error("Error verifying admin role:", error);
                    await auth.signOut();
                    setUser(null);
                    router.push("/login");
                }
            } else {
                setUser(null);
                if (!isLoginPage) {
                    router.push("/login");
                }
            }
            setLoading(false);
            clearTimeout(timeout);
        });

        return () => {
            unsubscribe();
            clearTimeout(timeout);
        };
    }, [pathname, isLoginPage, router]);

    // If on login page, render immediately to avoid "Loading..." flash
    if (isLoginPage) {
        return (
            <>
                {children}
                <Toaster position="top-right" richColors />
            </>
        );
    }

    // If loading (and not login page), show spinner
    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-black text-white flex-col gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <p className="text-gray-400 animate-pulse">Loading Admin Portal...</p>
            </div>
        );
    }

    // If not loading and no user (and not login page), don't render content (redirecting)
    if (!user) {
        return null;
    }

    // Authenticated state
    return (
        <>
            <div className="h-full relative">
                <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                    <Sidebar />
                </div>
                <main className="md:pl-72 h-full bg-secondary/20 min-h-screen flex flex-col">
                    <Header />
                    <div className="flex-1 p-8">
                        {children}
                    </div>
                </main>
            </div>
            <Toaster position="top-right" richColors />
        </>
    );
}
