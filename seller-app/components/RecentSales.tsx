"use client";

interface RecentSalesProps {
    orders: any[];
}

export function RecentSales({ orders }: RecentSalesProps) {
    return (
        <div className="space-y-8">
            {orders.map((order) => (
                <div key={order.id} className="flex items-center">
                    <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold">
                        {order.address?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">{order.address?.name || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">
                            {order.address?.city || 'No City'}
                        </p>
                    </div>
                    <div className="ml-auto font-medium">+₹{order.totalAmount?.toFixed(2)}</div>
                </div>
            ))}
        </div>
    );
}
