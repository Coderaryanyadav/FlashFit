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

    // 1. Listen to Orders for Stats & Charts
    const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
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

    // 2. Listen to Driver Locations for Live Tracking
    const driversQuery = query(collection(db, 'driverLocations'), where('status', '==', 'online'));
    const unsubscribeDrivers = onSnapshot(driversQuery, (snapshot) => {
      const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActiveDriversList(drivers as any);
      setStats(prev => ({
        ...prev,
        activeDrivers: snapshot.size
      }));
    });

    // 3. Auto-refresh driver data every 10 seconds
    const refreshInterval = setInterval(() => {
      // Force re-fetch driver locations
      getDocs(driversQuery).then((snapshot) => {
        const drivers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setActiveDriversList(drivers as any);
      });
    }, 10000);

    return () => {
      unsubscribeAuth();
      unsubscribeOrders();
      unsubscribeDrivers();
      clearInterval(refreshInterval);
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDrivers}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <p className="text-xs text-muted-foreground">Online now</p>
            </div>
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
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Live Driver Tracking</CardTitle>
            <div className="text-sm text-muted-foreground">
              Real-time driver locations
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeDriversList.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No drivers online</p>
              ) : (
                activeDriversList.map((driver: any) => (
                  <div key={driver.driverId} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse absolute -top-1 -right-1" />
                        <div className="h-8 w-8 rounded-full bg-neutral-800 flex items-center justify-center border border-white/10">
                          <Activity className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{driver.driverName || "Unknown Driver"}</p>
                        <p className="text-xs text-muted-foreground">
                          {driver.latitude && driver.longitude ? `${driver.latitude.toFixed(4)}, ${driver.longitude.toFixed(4)}` : "No location"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-green-500 uppercase">{driver.status}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {driver.timestamp?.seconds ? new Date(driver.timestamp.seconds * 1000).toLocaleTimeString() : "Just now"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
