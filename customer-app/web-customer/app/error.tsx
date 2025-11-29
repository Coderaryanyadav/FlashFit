'use client'

import { useEffect } from 'react'

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error(error)
    }, [error])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-red-400 mb-4 bg-red-900/20 p-4 rounded-lg border border-red-500/20 max-w-md text-center">
                {error.message || "An unexpected error occurred"}
            </p>
            <button
                onClick={() => reset()}
                className="px-6 py-3 bg-white text-black rounded-full font-bold hover:bg-gray-200 transition-colors"
            >
                Try again
            </button>
        </div>
    )
}
