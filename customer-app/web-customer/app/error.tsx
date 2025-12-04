'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Application error:', error);
    }, [error]);

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
            <div className="max-w-md text-center">
                <h1 className="text-6xl font-bold mb-4">Oops!</h1>
                <h2 className="text-2xl mb-4">Something went wrong</h2>
                <p className="text-gray-400 mb-8">
                    We&apos;re sorry for the inconvenience. Our team has been notified.
                </p>
                <div className="space-y-4">
                    <Button onClick={reset} className="w-full">
                        Try Again
                    </Button>
                    <Button onClick={() => window.location.href = '/'} variant="outline" className="w-full">
                        Go Home
                    </Button>
                </div>
                {process.env.NODE_ENV === 'development' && (
                    <details className="mt-8 text-left">
                        <summary className="cursor-pointer text-sm text-gray-500">Error Details</summary>
                        <pre className="mt-2 text-xs bg-zinc-900 p-4 rounded overflow-auto">
                            {error.message}
                        </pre>
                    </details>
                )}
            </div>
        </div>
    );
}
