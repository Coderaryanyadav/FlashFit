"use client";

import { useEffect, useState } from "react";
import { auth } from "@/utils/firebase";
import { OrderService, Order } from "@/services/orderService";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Package, ChevronRight, Clock, ShoppingBag } from "lucide-react";
import { Header } from "@/components/Header";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) setLoading(false);
    });
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    const unsub = OrderService.subscribeToUserOrders(user.uid, (ordersData) => {
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center text-center p-4">
        <Header />
        <div className="bg-neutral-900/50 p-8 rounded-2xl border border-white/10 backdrop-blur-sm max-w-md w-full">
          <ShoppingBag className="h-16 w-16 text-neutral-700 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-2">Please Login</h1>
          <p className="text-neutral-400 mb-8">You need to be logged in to view your orders.</p>
          <Link href="/login" className="w-full block">
            <Button className="w-full h-12 text-lg font-bold bg-primary text-black hover:bg-primary/90">Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground">
      <Header />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Your Orders</h1>
            <p className="text-neutral-400">Track and manage your recent purchases</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">Continue Shopping</Button>
          </Link>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-32 bg-neutral-900/30 rounded-3xl border border-dashed border-white/10">
            <div className="w-20 h-20 bg-neutral-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Package className="h-10 w-10 text-neutral-600" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No orders yet</h3>
            <p className="text-neutral-400 mb-8">Looks like you haven't placed any orders yet.</p>
            <Link href="/">
              <Button className="bg-primary text-black font-bold hover:bg-primary/90">Start Shopping</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-neutral-900/50 p-6 rounded-2xl border border-white/5 hover:border-primary/50 hover:bg-neutral-900 transition-all group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary/10 p-3 rounded-full group-hover:bg-primary/20 transition-colors">
                      <Package className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-white group-hover:text-primary transition-colors">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-neutral-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : "Just now"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <div className="text-right">
                      <p className="font-bold text-lg text-white">₹{order.totalAmount}</p>
                      <p className="text-xs text-neutral-500">{order.items.length} Items</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${order.status === 'delivered' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                      order.status === 'cancelled' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      }`}>
                      {order.status || 'Processing'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm text-neutral-400 border-t border-white/5 pt-4 mt-4">
                  <div className="flex -space-x-2 overflow-hidden">
                    {/* Preview of items if available, otherwise generic */}
                    {order.items.slice(0, 3).map((item: any, i: number) => (
                      <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-neutral-900 bg-neutral-800 flex items-center justify-center text-xs font-bold text-white overflow-hidden">
                        {item.image ? <img src={item.image} alt="" className="h-full w-full object-cover" /> : item.title[0]}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="inline-block h-8 w-8 rounded-full ring-2 ring-neutral-900 bg-neutral-800 flex items-center justify-center text-xs font-bold text-white">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {order.status !== 'delivered' && order.status !== 'cancelled' && (
                      <Link href={`/order/${order.id}`}>
                        <Button size="sm" className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20">
                          Track Order
                        </Button>
                      </Link>
                    )}
                    <Link href={`/order/${order.id}`}>
                      <div className="flex items-center gap-1 text-primary font-medium group-hover:translate-x-1 transition-transform cursor-pointer">
                        View Details <ChevronRight className="h-4 w-4" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
