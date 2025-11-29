"use client";

import { Toaster as Sonner } from "sonner";

export function Toaster() {
    return (
        <Sonner
            position="top-center"
            toastOptions={{
                style: {
                    background: "#18181b",
                    border: "1px solid #27272a",
                    color: "white",
                },
                className: "class",
            }}
        />
    );
}
