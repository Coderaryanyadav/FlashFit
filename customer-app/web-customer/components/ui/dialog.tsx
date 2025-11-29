// components/ui/dialog.tsx
"use client";
import { ReactNode } from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-w-md w-full relative overflow-hidden animate-in zoom-in-95 duration-200">
                <button
                    className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
                    onClick={() => onOpenChange(false)}
                >
                    <X className="h-5 w-5" />
                </button>
                {children}
            </div>
        </div>
    );
}

export function DialogContent({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("p-6", className)}>{children}</div>;
}

export function DialogHeader({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("mb-4", className)}>{children}</div>;
}

export function DialogTitle({ children, className }: { children: ReactNode; className?: string }) {
    return <h2 className={cn("text-xl font-bold text-white", className)}>{children}</h2>;
}

export function DialogFooter({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn("mt-6 flex gap-2", className)}>{children}</div>;
}

export function DialogDescription({ children, className }: { children: ReactNode; className?: string }) {
    return <p className={cn("text-sm text-zinc-400", className)}>{children}</p>;
}
