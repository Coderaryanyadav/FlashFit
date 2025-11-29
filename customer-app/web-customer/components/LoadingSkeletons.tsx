// Loading skeleton components for better UX

export function ProductCardSkeleton() {
    return (
        <div className="bg-neutral-900/50 rounded-2xl border border-white/5 overflow-hidden animate-pulse">
            <div className="h-64 bg-neutral-800"></div>
            <div className="p-4 space-y-3">
                <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
                <div className="h-4 bg-neutral-800 rounded w-1/2"></div>
                <div className="h-8 bg-neutral-800 rounded"></div>
            </div>
        </div>
    );
}

export function OrderCardSkeleton() {
    return (
        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5 animate-pulse">
            <div className="flex items-center justify-between mb-4">
                <div className="space-y-2">
                    <div className="h-4 bg-neutral-800 rounded w-32"></div>
                    <div className="h-3 bg-neutral-800 rounded w-24"></div>
                </div>
                <div className="h-6 bg-neutral-800 rounded w-20"></div>
            </div>
            <div className="h-4 bg-neutral-800 rounded w-full"></div>
        </div>
    );
}

export function StatCardSkeleton() {
    return (
        <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5 animate-pulse">
            <div className="h-4 bg-neutral-800 rounded w-24 mb-4"></div>
            <div className="h-8 bg-neutral-800 rounded w-16"></div>
        </div>
    );
}

export function PageLoader() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-gray-400">Loading...</p>
            </div>
        </div>
    );
}
