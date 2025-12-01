"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, limit } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, CheckCircle, Truck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { OrderDetailsModal } from "@/components/OrderDetailsModal";

import { Order } from "@flashfit/types";

// Type Definition removed as it is now imported

export default function OrdersPage() {
    const [data, setData] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [limitCount, setLimitCount] = useState(20);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsDetailsModalOpen(true);
    };

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        try {
            const { httpsCallable, getFunctions } = await import("firebase/functions");
            const { app } = await import("@/utils/firebase");
            const functions = getFunctions(app);

            const updateOrderStatusFn = httpsCallable(functions, 'updateOrderStatus');
            await updateOrderStatusFn({
                orderId: id,
                status: newStatus,
                description: `Status updated to ${newStatus} by admin`
            });
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    // Column Definitions
    const columns: ColumnDef<Order>[] = [
        {
            accessorKey: "id",
            header: "Order ID",
            cell: ({ row }) => <span className="font-mono text-xs">{row.original.id.slice(0, 8)}...</span>
        },
        {
            accessorKey: "totalAmount",
            header: "Amount",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("totalAmount"));
                return <div className="font-bold">₹{amount}</div>;
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.getValue("status") as string;
                let color = "bg-gray-500";
                if (status === "delivered") color = "bg-green-500";
                if (status === "pending") color = "bg-yellow-500";
                if (status === "assigned") color = "bg-blue-500";
                if (status === "cancelled") color = "bg-red-500";
                if (status === "returning") color = "bg-red-600 animate-pulse"; // Added returning status
                if (status === "warehouse_reached") color = "bg-purple-500 animate-pulse";
                if (status === "completed") color = "bg-emerald-600";

                return (
                    <Badge className={`${color} hover:${color} text-white capitalize`}>
                        {status.replace("_", " ")}
                    </Badge>
                );
            },
        },
        {
            accessorKey: "paymentStatus",
            header: "Payment",
            cell: ({ row }) => {
                const status = row.getValue("paymentStatus") as string;
                let colorClass = 'text-orange-500';
                if (status === 'paid') colorClass = 'text-green-600';
                if (status === 'cancelled') colorClass = 'text-red-500';

                return (
                    <span className={`text-xs font-bold uppercase ${colorClass}`}>
                        {status || 'pending'}
                    </span>
                )
            }
        },
        {
            id: "paymentVerification",
            header: "Verification",
            cell: ({ row }) => {
                const order = row.original;
                // If order is returned or cancelled, show "Returned" status and disable verification
                if ((order.status as string) === 'returning' || (order.status as string) === 'cancelled') {
                    return (
                        <span className="text-[10px] text-red-500 font-bold uppercase flex items-center gap-1">
                            <XCircle className="h-3 w-3" /> Returned
                        </span>
                    );
                }

                if (order.paymentStatus === 'paid') {
                    return (
                        <div className="flex flex-col">
                            <span className="text-[10px] text-green-500 font-bold uppercase flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Verified
                            </span>
                            {(order as any).paymentVerifiedBy && (
                                <span className="text-[10px] text-gray-500">by {(order as any).paymentVerifiedBy}</span>
                            )}
                        </div>
                    );
                }
                return (
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        onClick={async () => {
                            if (confirm("Confirm payment received for this order?")) {
                                try {
                                    await updateDoc(doc(db, "orders", order.id), {
                                        paymentStatus: 'paid',
                                        paymentVerifiedAt: new Date(),
                                        paymentVerifiedBy: 'admin'
                                    });
                                } catch (error) {
                                    console.error("Error verifying payment:", error);
                                    alert("Failed to verify payment");
                                }
                            }
                        }}
                    >
                        Verify
                    </Button>
                );
            }
        },
        {
            accessorKey: "createdAt",
            header: "Date",
            cell: ({ row }) => {
                // Handle Firestore Timestamp
                const date = row.original.createdAt?.toDate ? row.original.createdAt.toDate() : new Date();
                return <span className="text-xs text-muted-foreground">{date.toLocaleDateString()}</span>
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const order = row.original;
                return (
                    <div className="flex items-center gap-2">
                        {(order.status as string) === 'warehouse_reached' && (
                            <Button
                                size="sm"
                                onClick={() => {
                                    if (confirm("Mark this order as completed?")) {
                                        handleStatusUpdate(order.id, "completed");
                                    }
                                }}
                                className="h-8 bg-green-600 hover:bg-green-700 text-white"
                            >
                                <CheckCircle className="h-4 w-4 mr-1" /> Complete
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => handleViewDetails(order)}>
                                    <Eye className="mr-2 h-4 w-4" /> View Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuSub>
                                    <DropdownMenuSubTrigger>Update Status</DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent>
                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "pending")}>
                                            Pending
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "assigned")}>
                                            Assigned
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "delivered")}>
                                            Delivered
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "warehouse_reached")}>
                                            Warehouse Reached
                                        </DropdownMenuItem>

                                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "cancelled")}>
                                            <XCircle className="mr-2 h-4 w-4" /> Cancelled
                                        </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                                <DropdownMenuSeparator />
                                {order.paymentStatus !== 'paid' && (order.status as string) !== 'returning' && (order.status as string) !== 'cancelled' && (
                                    <DropdownMenuItem onClick={async () => {
                                        if (confirm("Confirm payment received for this order?")) {
                                            try {
                                                await updateDoc(doc(db, "orders", order.id), {
                                                    paymentStatus: 'paid',
                                                    paymentVerifiedAt: new Date(),
                                                    paymentVerifiedBy: 'admin'
                                                });
                                            } catch (error) {
                                                console.error("Error verifying payment:", error);
                                                alert("Failed to verify payment");
                                            }
                                        }
                                    }} className="text-blue-400 font-bold">
                                        <CheckCircle className="mr-2 h-4 w-4" /> Verify Payment
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem
                                    onClick={async () => {
                                        if (confirm('Are you sure you want to delete this order?')) {
                                            try {
                                                await deleteDoc(doc(db, "orders", order.id));
                                            } catch (error) {
                                                console.error("Error deleting order:", error);
                                                alert("Failed to delete order");
                                            }
                                        }
                                    }}
                                    className="text-red-600"
                                >
                                    <XCircle className="mr-2 h-4 w-4" /> Delete Order
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            },
        },
    ];

    useEffect(() => {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"), limit(limitCount));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orders = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Order[];
            setData(orders);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [limitCount]);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Orders</h2>
            </div>
            <div className="bg-neutral-900 rounded-xl border border-white/10 shadow-sm p-4">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        <DataTable columns={columns} data={data} searchKey="id" />
                        <div className="mt-4 flex justify-center">
                            <Button
                                variant="outline"
                                onClick={() => setLimitCount(prev => prev + 20)}
                                className="text-white border-white/20 hover:bg-white/10"
                            >
                                Load More Orders
                            </Button>
                        </div>
                    </>
                )}
            </div>

            <OrderDetailsModal
                order={selectedOrder}
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
            />
        </div>
    );
}
