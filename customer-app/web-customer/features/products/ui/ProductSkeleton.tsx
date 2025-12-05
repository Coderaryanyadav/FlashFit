export function ProductSkeleton() {
    return (
        <div className="space-y-3">
            <div className="aspect-[3/4] w-full bg-zinc-900 rounded-2xl animate-pulse" />
            <div className="space-y-2 px-1">
                <div className="flex justify-between">
                    <div className="h-4 bg-zinc-900 rounded w-2/3 animate-pulse" />
                    <div className="h-4 bg-zinc-900 rounded w-1/4 animate-pulse" />
                </div>
                <div className="h-3 bg-zinc-900 rounded w-1/3 animate-pulse" />
                <div className="h-10 bg-zinc-900 rounded-xl w-full mt-2 animate-pulse" />
            </div>
        </div>
    );
}
