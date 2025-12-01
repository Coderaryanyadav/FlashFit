'use client';

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, ShoppingBag, Activity, Package as PackageIcon } from "lucide-react";
import { Overview } from "@/components/Overview";
import { RecentSales } from "@/components/RecentSales";
import { collection, query, where, onSnapshot, orderBy, getDocs } from "firebase/firestore";
import { db, auth } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [activeDriversList, setActiveDriversList] = useState([]);
  const [overviewData, setOverviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) router.push('/login');
    });

    // 1. Listen to Orders for Stats & Charts (Filtered by Store)
    // For now, we assume the logged-in user's UID is the storeId or we fetch the storeId from their profile
    // In a real app, we'd fetch the seller profile first.

    const ordersQuery = query(
      collection(db, 'orders'),
      where('storeId', '==', auth.currentUser?.uid), // Assuming seller UID is storeId for MVP
      orderBy('createdAt', 'desc')
    );

    const unsubscribeOrders = onSnapshot(ordersQuery, (snapshot) => {
      let revenue = 0;
      let pending = 0;
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const monthlyTotals: Record<string, number> = {};
      months.forEach(m => monthlyTotals[m] = 0);

      const ordersData = snapshot.docs.map(doc => {
        const data = doc.data();
        revenue += data.totalAmount || 0;
        if (['placed', 'pending', 'packed'].includes(data.status)) pending++;

        // Chart Data
        if (data.createdAt) {
          const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
          const month = months[date.getMonth()];
          monthlyTotals[month] += data.totalAmount || 0;
        }

        return { id: doc.id, ...data };
      });

      const chartData = months.map(name => ({
        name,
        total: monthlyTotals[name]
      }));

      setOverviewData(chartData as any);
      setRecentOrders(ordersData.slice(0, 5) as any);
      setStats(prev => ({
        ...prev,
        totalOrders: snapshot.size,
        totalRevenue: revenue,
        pendingOrders: pending
      }));
      setLoading(false);
    });

    // Driver tracking removed for seller dashboard

    return () => {
      unsubscribeAuth();
      unsubscribeOrders();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Real-time revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All time orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <PackageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Waiting for processing</p>
          </CardContent>
        </Card>

      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={overviewData} />
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
