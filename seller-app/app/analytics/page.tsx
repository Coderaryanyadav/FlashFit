"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    TrendingDown,
    Users,
    Package,
    DollarSign,
    ShoppingBag,
    Star,
    Truck,
    Clock,
} from "lucide-react";

interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalDrivers: number;
    avgOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
    topProducts: Array<{ name: string; sales: number; revenue: number }>;
    revenueByCategory: Array<{ category: string; revenue: number }>;
    ordersByStatus: Record<string, number>;
    avgDeliveryTime: number;
    avgRating: number;
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalDrivers: 0,
        avgOrderValue: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        topProducts: [],
        revenueByCategory: [],
        ordersByStatus: {},
        avgDeliveryTime: 0,
        avgRating: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            // Fetch all data in parallel
            const [ordersSnapshot, usersSnapshot, driversSnapshot, reviewsSnapshot] = await Promise.all([
                getDocs(collection(db, "orders")),
                getDocs(collection(db, "users")),
                getDocs(collection(db, "drivers")),
                getDocs(collection(db, "reviews"))
            ]);

            const orders = ordersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            const totalCustomers = usersSnapshot.docs.filter((doc) => doc.data().role === "customer").length;
            const totalDrivers = driversSnapshot.size;

            // Calculate metrics
            const totalRevenue = orders.reduce((sum, order: any) => sum + (order.totalAmount || 0), 0);
            const totalOrders = orders.length;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Calculate growth (comparing last 7 days vs previous 7 days)
            const now = new Date();
            const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const prev7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

            const recentOrders = orders.filter(
                (o: any) => o.createdAt?.toDate && o.createdAt.toDate() >= last7Days
            );
            const previousOrders = orders.filter(
                (o: any) =>
                    o.createdAt?.toDate &&
                    o.createdAt.toDate() >= prev7Days &&
                    o.createdAt.toDate() < last7Days
            );

            const recentRevenue = recentOrders.reduce((sum, o: any) => sum + (o.totalAmount || 0), 0);
            const previousRevenue = previousOrders.reduce((sum, o: any) => sum + (o.totalAmount || 0), 0);

            const revenueGrowth =
                previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
            const ordersGrowth =
                previousOrders.length > 0
                    ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100
                    : 0;

            // Orders by status
            const ordersByStatus: Record<string, number> = {};
            orders.forEach((order: any) => {
                const status = order.status || "unknown";
                ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
            });

            // Calculate average rating from reviews
            let avgRating = 0;
            if (reviewsSnapshot) {
                const approvedReviews = reviewsSnapshot.docs.filter(doc => doc.data().approved === true);
                if (approvedReviews.length > 0) {
                    const totalRating = approvedReviews.reduce((sum, doc) => sum + (doc.data().rating || 0), 0);
                    avgRating = totalRating / approvedReviews.length;
                }
            }

            // Calculate average delivery time from completed orders
            let avgDeliveryMinutes = 0;
            const deliveredOrders = orders.filter((o: any) => o.status === 'delivered' || o.status === 'completed');
            if (deliveredOrders.length > 0) {
                const totalMinutes = deliveredOrders.reduce((sum, order: any) => {
                    if (order.createdAt && order.deliveredAt) {
                        const diff = (order.deliveredAt.toDate().getTime() - order.createdAt.toDate().getTime()) / 1000 / 60;
                        return sum + diff;
                    }
                    return sum;
                }, 0);
                avgDeliveryMinutes = Math.round(totalMinutes / deliveredOrders.length);
            }

            // Get top products by counting order items
            const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};
            orders.forEach((order: any) => {
                if (order.items && Array.isArray(order.items)) {
                    order.items.forEach((item: any) => {
                        if (!productSales[item.id]) {
                            productSales[item.id] = { name: item.title || 'Unknown Product', sales: 0, revenue: 0 };
                        }
                        productSales[item.id].sales += item.quantity || 1;
                        productSales[item.id].revenue += (item.price || 0) * (item.quantity || 1);
                    });
                }
            });

            const topProducts = Object.values(productSales)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5);

            setAnalytics({
                totalRevenue,
                totalOrders,
                totalCustomers,
                totalDrivers,
                avgOrderValue,
                revenueGrowth,
                ordersGrowth,
                topProducts,
                revenueByCategory: [], // Would need category data from orders
                ordersByStatus,
                avgDeliveryTime: avgDeliveryMinutes,
                avgRating,
            });
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-white p-8">Loading analytics...</div>;
    }

    return (
        <div className="p-8 space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
                <p className="text-gray-400">Comprehensive business insights and metrics</p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-green-900/20 to-green-950/20 border-green-500/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                            Total Revenue
                            <DollarSign className="h-4 w-4 text-green-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-green-400">
                            ₹{analytics.totalRevenue.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1 text-xs mt-2">
                            {analytics.revenueGrowth >= 0 ? (
                                <>
                                    <TrendingUp className="h-3 w-3 text-green-400" />
                                    <span className="text-green-400">+{analytics.revenueGrowth.toFixed(1)}%</span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="h-3 w-3 text-red-400" />
                                    <span className="text-red-400">{analytics.revenueGrowth.toFixed(1)}%</span>
                                </>
                            )}
                            <span className="text-gray-500">vs last week</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-blue-900/20 to-blue-950/20 border-blue-500/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                            Total Orders
                            <ShoppingBag className="h-4 w-4 text-blue-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-blue-400">{analytics.totalOrders}</div>
                        <div className="flex items-center gap-1 text-xs mt-2">
                            {analytics.ordersGrowth >= 0 ? (
                                <>
                                    <TrendingUp className="h-3 w-3 text-blue-400" />
                                    <span className="text-blue-400">+{analytics.ordersGrowth.toFixed(1)}%</span>
                                </>
                            ) : (
                                <>
                                    <TrendingDown className="h-3 w-3 text-red-400" />
                                    <span className="text-red-400">{analytics.ordersGrowth.toFixed(1)}%</span>
                                </>
                            )}
                            <span className="text-gray-500">vs last week</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-900/20 to-purple-950/20 border-purple-500/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                            Total Customers
                            <Users className="h-4 w-4 text-purple-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-purple-400">{analytics.totalCustomers}</div>
                        <div className="text-xs text-gray-500 mt-2">Registered users</div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-950/20 border-yellow-500/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                            Avg Order Value
                            <Package className="h-4 w-4 text-yellow-400" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-yellow-400">
                            ₹{analytics.avgOrderValue.toFixed(0)}
                        </div>
                        <div className="text-xs text-gray-500 mt-2">Per order</div>
                    </CardContent>
                </Card>
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-neutral-900 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Truck className="h-5 w-5 text-primary" />
                            Active Drivers
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white">{analytics.totalDrivers}</div>
                        <p className="text-sm text-gray-400 mt-2">Total registered drivers</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Avg Delivery Time
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white">{analytics.avgDeliveryTime} min</div>
                        <p className="text-sm text-gray-400 mt-2">Average delivery duration</p>
                    </CardContent>
                </Card>

                <Card className="bg-neutral-900 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary" />
                            Customer Satisfaction
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold text-white">{analytics.avgRating.toFixed(1)}</div>
                        <p className="text-sm text-gray-400 mt-2">Average rating</p>
                    </CardContent>
                </Card>
            </div>

            {/* Orders by Status */}
            <Card className="bg-neutral-900 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Orders by Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(analytics.ordersByStatus).map(([status, count]) => (
                            <div key={status} className="bg-neutral-800 p-4 rounded-lg">
                                <p className="text-sm text-gray-400 capitalize mb-1">{status}</p>
                                <p className="text-2xl font-bold text-white">{count}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Top Products */}
            <Card className="bg-neutral-900 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Top Selling Products</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {analytics.topProducts.map((product, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-neutral-800 rounded-lg">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                                        <span className="text-primary font-bold">#{index + 1}</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">{product.name}</p>
                                        <p className="text-sm text-gray-400">{product.sales} sales</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-green-400">₹{product.revenue.toLocaleString()}</p>
                                    <p className="text-xs text-gray-400">Revenue</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
