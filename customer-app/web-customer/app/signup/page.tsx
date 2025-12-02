"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to login page (which now handles both login and signup)
        router.replace("/login");
    }, [router]);

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
            <div className="text-white">Redirecting...</div>
        </div>
    );
}
