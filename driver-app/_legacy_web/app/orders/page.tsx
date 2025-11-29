'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase/client';

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  address: {
    name: string;
    phone: string;
    street: string;
    city: string;
    pincode: string;
  };
  driverId?: string;
  createdAt: any;
}

interface Driver {
  id: string;
  isOnline: boolean;
  currentOrderId?: string;
}

export default function DriverOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [driver, setDriver] = useState<Driver | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Listen to Driver Status
  useEffect(() => {
    if (!userId) return;
    const driverRef = doc(db, 'drivers', userId);
    const unsubscribe = onSnapshot(driverRef, (doc) => {
      if (doc.exists()) {
        setDriver({ id: doc.id, ...doc.data() } as Driver);
      }
    });
    return () => unsubscribe();
  }, [userId]);

  // Listen to Orders
  useEffect(() => {
    if (!userId) return;

    // 1. Packed orders (ready for pickup)
    const packedOrdersQuery = query(
      collection(db, 'orders'),
      where('status', '==', 'packed')
    );

    // 2. My assigned orders
    const myOrdersQuery = query(
      collection(db, 'orders'),
      where('driverId', '==', userId)
    );

    const unsubscribePacked = onSnapshot(packedOrdersQuery, (packedSnap) => {
      const packedOrders = packedSnap.docs
        .filter(doc => !doc.data().driverId)
        .map(doc => ({ id: doc.id, ...doc.data() } as Order));

      const unsubscribeMy = onSnapshot(myOrdersQuery, (mySnap) => {
        const myOrders = mySnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

        // Combine and sort
        const allOrders = [...packedOrders, ...myOrders].sort((a, b) => {
          // Sort by creation time (newest first)
          return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
        });

        setOrders(allOrders);
      });

      return () => unsubscribeMy();
    });

    return () => unsubscribePacked();
  }, [userId]);

  const toggleOnline = async () => {
    if (!userId) return;
    const driverRef = doc(db, 'drivers', userId);
    await updateDoc(driverRef, {
      isOnline: !driver?.isOnline,
      updatedAt: Date.now(),
    });
  };

  const startGPS = () => {
    if (!userId || !('geolocation' in navigator)) return;
    navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const driverRef = doc(db, 'drivers', userId);
        await updateDoc(driverRef, {
          currentLocation: { lat: latitude, lng: longitude },
          updatedAt: Date.now(),
        });
      },
      (error) => console.error(error),
      { enableHighAccuracy: true }
    );
    alert('GPS Tracking Started');
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!userId) return;
    const orderRef = doc(db, 'orders', orderId);
    await updateDoc(orderRef, { status: newStatus });

    if (newStatus === 'delivered') {
      const driverRef = doc(db, 'drivers', userId);
      await updateDoc(driverRef, { currentOrderId: null });
    }
  };

  const handleDelivery = async (order: Order) => {
    if (confirm('Confirm delivery? Any returned items should be marked in the next step (Coming Soon).')) {
      await updateOrderStatus(order.id, 'delivered');
    }
  };

  const acceptOrder = async (order: Order) => {
    if (!userId) return;
    const orderRef = doc(db, 'orders', order.id);
    await updateDoc(orderRef, {
      driverId: userId,
      status: 'assigned',
      assignedAt: Date.now()
    });
    const driverRef = doc(db, 'drivers', userId);
    await updateDoc(driverRef, { currentOrderId: order.id });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 p-4 flex justify-between items-center border-b border-gray-700">
        <h1 className="text-xl font-bold">FlashFit Driver</h1>
        <div className="flex gap-2">
          <button
            onClick={toggleOnline}
            className={`px-4 py-2 rounded font-bold transition-colors ${driver?.isOnline ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
              }`}
          >
            {driver?.isOnline ? 'Online' : 'Offline'}
          </button>
          <button
            onClick={() => signOut(auth)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="p-4 max-w-md mx-auto">
        <button
          onClick={startGPS}
          className="mb-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          📍 Start GPS Tracking
        </button>

        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          📦 My Orders
          <span className="text-sm font-normal bg-gray-700 px-2 py-1 rounded-full text-gray-300">
            {orders.length}
          </span>
        </h2>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-xl border border-gray-700 border-dashed">
            <p className="text-gray-400">No orders available</p>
            <p className="text-sm text-gray-500 mt-2">Go online to receive new orders</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-lg">
                <div className="flex justify-between mb-3">
                  <span className="font-mono text-sm text-gray-400">#{order.id.slice(0, 8)}</span>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${order.status === 'assigned' ? 'bg-yellow-500/20 text-yellow-500' :
                      order.status === 'picked_up' ? 'bg-blue-500/20 text-blue-500' :
                        order.status === 'on_the_way' ? 'bg-purple-500/20 text-purple-500' :
                          order.status === 'packed' ? 'bg-green-500/20 text-green-500' :
                            'bg-gray-600'
                    }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Customer</span>
                    <span className="font-medium">{order.address?.name || 'Unknown'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Amount</span>
                    <span className="font-bold text-green-400">₹{order.totalAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div className="text-sm text-gray-400 bg-gray-900/50 p-3 rounded-lg mt-2">
                    {order.address?.street || 'No Address'}, {order.address?.city} - {order.address?.pincode}
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-700">
                  {(!order.driverId && order.status === 'packed') && (
                    <button
                      onClick={() => acceptOrder(order)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors"
                    >
                      Accept Order
                    </button>
                  )}

                  {order.status === 'assigned' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'picked_up')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition-colors"
                    >
                      Mark Picked Up
                    </button>
                  )}

                  {order.status === 'picked_up' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'on_the_way')}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold transition-colors"
                    >
                      Start Delivery
                    </button>
                  )}

                  {order.status === 'on_the_way' && (
                    <button
                      onClick={() => handleDelivery(order)}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors"
                    >
                      Complete Delivery
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
