'use client'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html>
            <body className="bg-black text-white">
                <div className="flex flex-col items-center justify-center min-h-screen p-4">
                    <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                    <p className="text-red-400 mb-4">{error.message}</p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-white text-black rounded-lg font-bold"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    )
}
