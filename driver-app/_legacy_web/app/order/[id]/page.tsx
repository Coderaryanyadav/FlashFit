'use client';

import { useEffect, useState } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { useRouter } from 'next/navigation';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import Link from 'next/link';

interface Order {
  id: string;
  customerId: string;
  storeId: string;
  items: any[];
  status: string;
  address: string;
  phone: string;
  total: number;
  createdAt: number;
}

const mapContainerStyle = {
  width: '100%',
  height: '300px',
};

export default function DriverOrderDetail({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'orders', params.id), (snap) => {
      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() } as Order);
      }
    });

    return () => unsubscribe();
  }, [params.id]);

  useEffect(() => {
    if (!('geolocation' in navigator)) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const location = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setCurrentLocation(location);
      },
      (error) => console.error('GPS error:', error),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const updateStatus = async (newStatus: string) => {
    if (!order) return;
    const orderRef = doc(db, 'orders', order.id);
    await updateDoc(orderRef, { status: newStatus });
  };

  if (!order) return <div className="min-h-screen bg-gray-900 flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-900">
      <header className="bg-gray-800 p-4 flex justify-between items-center">
        <Link href="/orders" className="text-blue-500 hover:underline">← Back</Link>
        <h1 className="text-xl font-bold">Order Details</h1>
        <div></div>
      </header>

      <main className="p-4 space-y-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="mb-2">
            <span className="text-gray-400">Order ID: </span>
            <span className="font-mono">{order.id.slice(0, 8)}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400">Status: </span>
            <span className="font-bold">{order.status.toUpperCase().replace('_', ' ')}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400">Address: </span>
            <span>{order.address}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400">Phone: </span>
            <span>{order.phone}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-400">Total: </span>
            <span className="text-[#39FF14] font-bold">₹{order.total?.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="font-bold mb-2">Items</h2>
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between mb-2">
              <span>{item.name} x {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        {currentLocation && process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <div className="bg-gray-800 p-4 rounded-lg">
            <h2 className="font-bold mb-2">My Location</h2>
            <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={currentLocation}
                zoom={15}
              >
                <Marker position={currentLocation} label="You" />
              </GoogleMap>
            </LoadScript>
          </div>
        )}

        <div className="space-y-2">
          {order.status === 'assigned' && (
            <button
              onClick={() => updateStatus('picked_up')}
              className="w-full bg-green-600 text-white font-bold py-3 rounded"
            >
              Mark Picked Up
            </button>
          )}
          {order.status === 'picked_up' && (
            <button
              onClick={() => updateStatus('on_the_way')}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded"
            >
              Start Delivery
            </button>
          )}
          {order.status === 'on_the_way' && (
            <button
              onClick={() => updateStatus('delivered')}
              className="w-full bg-[#39FF14] text-black font-bold py-3 rounded"
            >
              Mark Delivered
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
