"use client";

import { useEffect, useRef } from "react";
import { auth } from "@/utils/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

export function SessionTimeout() {
    const router = useRouter();
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleActivity = () => {
            if (timerRef.current) clearTimeout(timerRef.current);

            if (auth.currentUser) {
                timerRef.current = setTimeout(() => {
                    signOut(auth).then(() => {
                        toast.info("Session timed out due to inactivity.");
                        router.push("/login");
                    });
                }, TIMEOUT_MS);
            }
        };

        // Listen for events
        window.addEventListener("mousemove", handleActivity);
        window.addEventListener("keydown", handleActivity);
        window.addEventListener("click", handleActivity);
        window.addEventListener("scroll", handleActivity);

        // Init timer
        handleActivity();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            window.removeEventListener("mousemove", handleActivity);
            window.removeEventListener("keydown", handleActivity);
            window.removeEventListener("click", handleActivity);
            window.removeEventListener("scroll", handleActivity);
        };
    }, [router]);

    return null;
}
