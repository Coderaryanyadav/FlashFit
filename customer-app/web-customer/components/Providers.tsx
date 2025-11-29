"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { LoginModal } from "@/components/LoginModal";
import { useUIStore } from "@/store/useUIStore";

import { AuthSync } from "@/components/AuthSync";

export function Providers({ children }: { children: React.ReactNode }) {
    const { isLoginOpen, closeLogin } = useUIStore();

    return (
        <ErrorBoundary>
            <AuthSync />
            {children}
            <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
            <Toaster />
        </ErrorBoundary>
    );
}
