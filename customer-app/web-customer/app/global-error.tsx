'use client';

import { useEffect } from 'react';
import { Button } from '@/shared/ui/button';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global Error:', error);
    }, [error]);

    return (
        <html>
            <body className="bg-black text-white">
                <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
                    <h2 className="text-3xl font-black mb-4">Critical System Error</h2>
                    <p className="text-gray-400 mb-8 max-w-md">
                        A critical error occurred that prevented the application from loading.
                    </p>
                    <Button
                        onClick={() => window.location.reload()}
                        className="bg-white text-black font-bold"
                    >
                        Reload Application
                    </Button>
                </div>
            </body>
        </html>
    );
}
