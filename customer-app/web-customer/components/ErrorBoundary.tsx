"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex h-screen w-full flex-col items-center justify-center bg-neutral-950 p-4 text-center text-white">
                    <div className="mb-4 rounded-full bg-red-500/20 p-4">
                        <AlertTriangle className="h-10 w-10 text-red-500" />
                    </div>
                    <h1 className="mb-2 text-2xl font-bold">Something went wrong</h1>
                    <p className="mb-6 max-w-md text-gray-400">
                        We apologize for the inconvenience. An unexpected error has occurred.
                    </p>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-white text-black hover:bg-gray-200"
                        >
                            Reload Page
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => (window.location.href = "/")}
                            className="border-white/20 hover:bg-white/10"
                        >
                            Go Home
                        </Button>
                    </div>
                    {process.env.NODE_ENV === "development" && this.state.error && (
                        <div className="mt-8 w-full max-w-2xl overflow-auto rounded-lg bg-black/50 p-4 text-left font-mono text-xs text-red-400">
                            {this.state.error.toString()}
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
