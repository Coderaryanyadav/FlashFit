"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/sonner";
import { LoginModal } from "@/components/LoginModal";
import { useUIStore } from "@/store/useUIStore";

import { AuthSync } from "@/components/AuthSync";
import { CartSync } from "@/components/CartSync";

import { OfflineIndicator } from "@/components/OfflineIndicator";

export function Providers({ children }: { children: React.ReactNode }) {
    const { isLoginOpen, closeLogin } = useUIStore();

    return (
        <ErrorBoundary>
            <AuthSync />
            <CartSync />
            <OfflineIndicator />
            {children}
            <LoginModal isOpen={isLoginOpen} onClose={closeLogin} />
            <Toaster />
        </ErrorBoundary>
    );
}
