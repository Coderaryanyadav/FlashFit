"use client";

import { useEffect, useState } from "react";
import { collection, query, getDocs, where, Timestamp } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, Package, DollarSign, ShoppingBag, TrendingDown } from "lucide-react";

interface AnalyticsData {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    avgOrderValue: number;
    revenueGrowth: number;
    ordersGrowth: number;
    topProducts: Array<{ name: string; sales: number }>;
    revenueByCategory: Array<{ category: string; revenue: number }>;
}

export function EnhancedAnalytics() {
    const [analytics, setAnalytics] = useState<AnalyticsData>({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        avgOrderValue: 0,
        revenueGrowth: 0,
        ordersGrowth: 0,
        topProducts: [],
        revenueByCategory: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAnalytics();
    }, []);

    const fetchAnalytics = async () => {
        try {
            // Fetch all orders
            const ordersSnapshot = await getDocs(collection(db, "orders"));
            const orders = ordersSnapshot.docs.map(doc => doc.data());

            // Fetch all users
            const usersSnapshot = await getDocs(collection(db, "users"));
            const totalCustomers = usersSnapshot.docs.filter(doc => doc.data().role === "customer").length;

            // Calculate metrics
            const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            const totalOrders = orders.length;
            const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Calculate growth (comparing last 7 days vs previous 7 days)
            const now = new Date();
            const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            const prev7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

            const recentOrders = orders.filter(o => o.createdAt?.toDate && o.createdAt.toDate() >= last7Days);
            const previousOrders = orders.filter(o => o.createdAt?.toDate && o.createdAt.toDate() >= prev7Days && o.createdAt.toDate() < last7Days);

            const recentRevenue = recentOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
            const previousRevenue = previousOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

            const revenueGrowth = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;
            const ordersGrowth = previousOrders.length > 0 ? ((recentOrders.length - previousOrders.length) / previousOrders.length) * 100 : 0;

            setAnalytics({
                totalRevenue,
                totalOrders,
                totalCustomers,
                avgOrderValue,
                revenueGrowth,
                ordersGrowth,
                topProducts: [],
                revenueByCategory: []
            });
        } catch (error) {
            console.error("Error fetching analytics:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-white">Loading analytics...</div>;
    }

    return (
        <div className="space-y-6">
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
                        <div className="text-3xl font-bold text-green-400">₹{analytics.totalRevenue.toLocaleString()}</div>
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

                <Card className="bg-gradient-to-br from-gray-900/20 to-gray-950/20 border-gray-500/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-400 flex items-center justify-between">
                            Avg Order Value
                            <Package className="h-4 w-4 text-white" />
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-white">₹{analytics.avgOrderValue.toFixed(0)}</div>
                        <div className="text-xs text-gray-500 mt-2">Per order</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
