'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Application Error:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center">
            <div className="bg-zinc-900 p-8 rounded-2xl border border-white/10 max-w-md w-full space-y-6 shadow-2xl">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-red-500/10 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-red-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight">Something went wrong!</h2>
                    <p className="text-gray-400">
                        We apologize for the inconvenience. An unexpected error has occurred.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <Button
                        onClick={reset}
                        className="w-full bg-white text-black hover:bg-gray-200 font-bold"
                    >
                        Try again
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => window.location.href = '/'}
                        className="w-full border-white/10 hover:bg-white/5"
                    >
                        Go back home
                    </Button>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 p-4 bg-black/50 rounded text-left overflow-auto max-h-40 text-xs font-mono text-red-400">
                        {error.message}
                        {error.digest && <div className="mt-1 text-gray-500">Digest: {error.digest}</div>}
                    </div>
                )}
            </div>
        </div>
    );
}
