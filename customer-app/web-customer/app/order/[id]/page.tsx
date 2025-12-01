"use client";

import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { CheckCircle2, Package, Truck, MapPin, ChevronLeft, ShoppingBag, CreditCard, Clock, AlertTriangle, Star, XCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EnhancedTrackingMap } from "@/components/EnhancedTrackingMap";
import { Order } from "@/services/orderService";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { runTransaction } from "firebase/firestore";

const STEPS = [
  { id: "placed", label: "Order Placed", icon: CheckCircle2 },
  { id: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { id: "assigned", label: "Driver Assigned", icon: Truck },
  { id: "picked_up", label: "Out for Delivery", icon: Truck },
  { id: "delivered", label: "Delivered", icon: MapPin },
];

// Simple Confetti Component
const Confetti = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -20, x: Math.random() * window.innerWidth, rotate: 0 }}
          animate={{ y: window.innerHeight + 20, rotate: 360 }}
          transition={{ duration: Math.random() * 2 + 2, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
          className="absolute w-3 h-3 rounded-sm"
          style={{
            backgroundColor: ['#22c55e', '#3b82f6', '#eab308', '#ef4444'][Math.floor(Math.random() * 4)],
            left: 0
          }}
        />
      ))}
    </div>
  );
};

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [prevStatus, setPrevStatus] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "orders", params.id), (doc) => {
      if (doc.exists()) {
        const data = { id: doc.id, ...doc.data() } as Order;
        setOrder(data);

        // Haptic feedback on status change
        if (prevStatus && prevStatus !== data.status) {
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
          }
        }
        setPrevStatus(data.status);

        // Check if order is effectively returned
        const isReturned = data.status === 'returning' ||
          (data.status === 'cancelled') ||
          (data.items && data.items.length > 0 && data.items.every((i: any) => i.status === 'returned'));

        // Show rating modal if delivered, NOT returned, and not rated
        if (data.status === 'delivered' && !isReturned && !data.rating && !localStorage.getItem(`rated_${data.id}`)) {
          setTimeout(() => setShowRatingModal(true), 2000);
        }
      }
      setLoading(false);
    });
    return () => unsub();
  }, [params.id, prevStatus]);

  const handleRatingSubmit = async () => {
    if (!order || rating === 0) return;
    setIsSubmittingRating(true);
    try {
      if (!order.driverId) {
        throw new Error("No driver assigned to this order");
      }

      await runTransaction(db, async (transaction) => {
        const orderRef = doc(db, "orders", order.id);
        const driverRef = doc(db, "drivers", order.driverId!);

        // Update Order
        transaction.update(orderRef, { rating: rating });

        // Update Driver Stats
        const driverDoc = await transaction.get(driverRef);
        if (driverDoc.exists()) {
          const driverData = driverDoc.data();
          const currentRating = driverData.rating || 0;
          const totalRatings = driverData.totalRatings || 0;
          const newTotalRatings = totalRatings + 1;
          const newRating = ((currentRating * totalRatings) + rating) / newTotalRatings;

          transaction.update(driverRef, {
            rating: newRating,
            totalRatings: newTotalRatings
          });
        }
      });
      localStorage.setItem(`rated_${order.id}`, 'true');
      setShowRatingModal(false);
      alert("Thank you for your feedback!");
    } catch (error: any) {
      console.error("Error submitting rating:", error);
      alert(`Failed to submit rating: ${error.message}`);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (order?.status === 'delivered') {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [order?.status]);

  if (loading) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 animate-pulse">Loading order details...</p>
      </div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
          <Package className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-white">Order not found</h2>
        <Link href="/">
          <Button variant="outline" className="mt-4 border-white/10 text-white hover:bg-white/5">Return Home</Button>
        </Link>
      </div>
    </div>
  );

  const currentStepIndex = STEPS.findIndex((s) => s.id === order.status);

  // Handle derived statuses
  let activeStepIndex = currentStepIndex;
  if (currentStepIndex === -1) {
    if (order.status === 'completed' || order.status === 'warehouse_reached' || order.status === 'returning') {
      activeStepIndex = STEPS.length - 1; // Set to Delivered
    } else {
      activeStepIndex = 0;
    }
  }



  // Calculate if order is returned
  const isReturned = order.status === 'returning' ||
    (order.status === 'cancelled') ||
    (order.items && order.items.length > 0 && order.items.every((i: any) => i.status === 'returned'));

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-20 relative overflow-x-hidden">
      {showConfetti && <Confetti />}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-neutral-950/80 backdrop-blur-md border-b border-white/5">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/orders">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/5">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-lg">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
              <p className="text-xs text-gray-400">
                {order.createdAt?.toDate ? new Date(order.createdAt.toDate()).toLocaleDateString() : 'Just now'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={order.status}
              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${order.status === 'delivered' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
              {order.status.replace('_', ' ')}
            </motion.span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left Column: Map & Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Live Tracking Map - Only show if active */}
            {!['delivered', 'completed', 'warehouse_reached', 'returning'].includes(order.status) && (
              <EnhancedTrackingMap order={order} />
            )}

            {/* Timeline */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Order Timeline
                </h3>
                <span className="text-xs font-mono text-gray-500">ID: {order.id.slice(0, 8).toUpperCase()}</span>
              </div>

              <div className="relative">
                {/* Vertical Line for Mobile */}
                <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-neutral-800 md:hidden" />

                {/* Horizontal Line for Desktop */}
                <div className="hidden md:block absolute top-5 left-0 w-full h-0.5 bg-neutral-800" />
                <div
                  className="hidden md:block absolute top-5 left-0 h-0.5 bg-primary transition-all duration-1000 ease-out"
                  style={{ width: `${(activeStepIndex / (STEPS.length - 1)) * 100}%` }}
                />

                <div className="flex flex-col md:flex-row justify-between relative gap-6 md:gap-0">
                  {STEPS.map((step, index) => {
                    const isCompleted = index <= activeStepIndex;
                    const isCurrent = index === activeStepIndex;
                    const Icon = step.icon;

                    // Override label for Delivered step if returned
                    const label = (step.id === 'delivered' && isReturned) ? "Returned" : step.label;

                    return (
                      <div key={step.id} className="flex md:flex-col items-center gap-4 md:gap-2 relative z-10">
                        <div
                          className={`h-8 w-8 md:h-10 md:w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${isCompleted
                            ? isReturned && step.id === 'delivered'
                              ? "bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]" // Red for returned
                              : "bg-primary border-primary text-black shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                            : "bg-neutral-900 border-neutral-700 text-neutral-500"
                            }`}
                        >
                          <Icon className="h-4 w-4 md:h-5 md:w-5" />
                        </div>
                        <div className="flex-1 md:text-center">
                          <p className={`text-sm font-bold ${isCompleted ? "text-white" : "text-gray-500"}`}>
                            {label}
                          </p>
                          {isCurrent && !['completed', 'delivered', 'returning', 'cancelled'].includes(order.status) && (
                            <p className="text-xs text-primary animate-pulse font-medium md:hidden">
                              In Progress
                            </p>
                          )}
                          {step.id === 'delivered' && (order.status === 'completed' || order.status === 'delivered') && !isReturned && (
                            <p className="text-[10px] text-green-500 font-bold uppercase md:mt-1">
                              Completed
                            </p>
                          )}
                          {step.id === 'delivered' && isReturned && (
                            <p className="text-[10px] text-red-500 font-bold uppercase md:mt-1 animate-pulse">
                              Returned
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Order Details */}
          <div className="space-y-6">
            {/* Items List */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Order Items
              </h3>
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {order.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex gap-4 p-3 bg-neutral-800/30 rounded-xl border border-white/5 hover:bg-neutral-800/50 transition-colors">
                    <div className="relative h-16 w-16 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-500">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{item.title}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Size: <span className="text-white">{item.size || 'N/A'}</span> • Qty: <span className="text-white">{item.quantity}</span>
                      </p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-bold text-white">₹{item.price * item.quantity}</p>
                      {item.status === 'returned' && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-bold uppercase rounded-full">
                          <AlertTriangle className="h-3 w-3" /> Returned
                        </span>
                      )}
                      {item.status === 'delivered' && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500 text-[10px] font-bold uppercase rounded-full">
                          <CheckCircle2 className="h-3 w-3" /> Delivered
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Subtotal</span>
                  <span>₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Delivery Fee</span>
                  <span className="text-green-400">Free</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg pt-2">
                  <span>Total</span>
                  <span>₹{order.totalAmount}</span>
                </div>
              </div>
            </motion.div>

            {/* Delivery Details */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Delivery Details
              </h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{order.shippingAddress?.name || "Customer"}</p>
                    <p className="text-sm text-gray-400 leading-relaxed mt-1">
                      {order.shippingAddress?.street}
                      <br />
                      {order.shippingAddress?.city} - {order.shippingAddress?.pincode}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Phone: {order.shippingAddress?.phone}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Delivery OTP - Show when driver is assigned or picked up */}
            {['assigned', 'picked_up', 'placed', 'confirmed'].includes(order.status) && order.deliveryOtp && (
              <motion.div
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="bg-green-500/10 border border-green-500/20 rounded-2xl p-6"
              >
                <h3 className="font-bold text-lg mb-2 flex items-center gap-2 text-green-400">
                  <CheckCircle2 className="h-5 w-5" />
                  Delivery OTP
                </h3>
                <p className="text-sm text-gray-400 mb-4">
                  Share this code with the driver to verify your delivery.
                </p>
                <div className="bg-black/40 border border-green-500/30 rounded-xl p-4 text-center">
                  <span className="text-3xl font-black tracking-[1em] text-white pl-4">
                    {order.deliveryOtp}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Payment Info */}
            <motion.div
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6"
            >
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Payment Information
              </h3>
              <div className="flex items-center justify-between p-3 bg-neutral-800/30 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isReturned ? 'bg-red-500/10' :
                    order.paymentStatus === 'paid' ? 'bg-green-500/10' :
                      order.paymentStatus === 'cancelled' ? 'bg-red-500/10' : 'bg-yellow-500/10'
                    }`}>
                    {isReturned ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : order.paymentStatus === 'paid' ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : order.paymentStatus === 'cancelled' ? (
                      <XCircle className="w-5 h-5 text-red-500" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-white uppercase">{order.paymentMethod || 'Online'}</p>
                    <p className={`text-xs ${isReturned ? 'text-red-400' :
                      order.paymentStatus === 'paid' ? 'text-green-400' :
                        order.paymentStatus === 'cancelled' ? 'text-red-400' : 'text-yellow-400'
                      }`}>
                      {isReturned ? 'Order Returned' :
                        order.paymentStatus === 'paid' ? 'Payment Successful' :
                          order.paymentStatus === 'cancelled' ? 'Order Returned' : 'Payment Pending'}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-white">₹{order.totalAmount}</span>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Driver Rating Modal */}
      <Dialog open={showRatingModal} onOpenChange={setShowRatingModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md text-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-center">Rate Your Driver</DialogTitle>
            <DialogDescription className="text-center text-gray-400">
              How was your delivery experience with {order.driverName || "the driver"}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setRating(star)}
                className={`p-2 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-500' : 'text-zinc-700'}`}
              >
                <Star className={`h-8 w-8 ${rating >= star ? 'fill-current' : ''}`} />
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button
              onClick={handleRatingSubmit}
              disabled={rating === 0 || isSubmittingRating}
              className="w-full bg-primary text-black font-bold hover:bg-primary/90"
            >
              {isSubmittingRating ? "Submitting..." : "Submit Rating"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
