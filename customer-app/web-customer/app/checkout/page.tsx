"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MapPin, CreditCard, CheckCircle2, Truck, ShieldCheck, Loader2, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, auth } from "@/utils/firebase";
import { collection, addDoc, serverTimestamp, doc, getDoc, updateDoc } from "firebase/firestore";
import { Header } from "@/components/Header";
import { motion } from "framer-motion";
import { OrderService } from "@/services/orderService";
import dynamic from "next/dynamic";
const AddressMap = dynamic(() => import("@/components/AddressMap").then((mod) => mod.AddressMap), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-zinc-900 rounded-xl">
      <Loader2 className="animate-spin text-white" />
    </div>
  ),
});

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [saveAddress, setSaveAddress] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const router = useRouter();

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    pincode: "",
    lat: 0,
    lng: 0
  });

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!auth.currentUser) return;
      try {
        const { getDocs } = await import("firebase/firestore");
        const q = collection(db, "users", auth.currentUser.uid, "addresses");
        const snap = await getDocs(q);
        setSavedAddresses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (error) {
        console.error("Error fetching addresses:", error);
      }
    };
    fetchAddresses();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Phone validation - only allow digits and limit to 10
    if (name === 'phone') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 10) {
        setFormData(prev => ({ ...prev, [name]: cleaned }));
      }
      return;
    }

    // Pincode validation - only allow digits and limit to 6
    if (name === 'pincode') {
      const cleaned = value.replace(/\D/g, '');
      if (cleaned.length <= 6) {
        setFormData(prev => ({ ...prev, [name]: cleaned }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (addressData: any) => {
    setFormData(prev => ({
      ...prev,
      address: addressData.address,
      city: addressData.city || prev.city,
      pincode: addressData.pincode || prev.pincode,
      lat: addressData.lat,
      lng: addressData.lng
    }));
  };

  const handleSavedAddressClick = (addr: any) => {
    setFormData({
      fullName: addr.name || "",
      phone: addr.phone || "",
      address: addr.address || "",
      city: addr.city || "",
      pincode: addr.pincode || "",
      lat: addr.lat || 0,
      lng: addr.lng || 0
    });
  };

  const validateStep1 = () => {
    if (!formData.fullName || formData.fullName.trim().length < 2) {
      alert("Please enter a valid name (minimum 2 characters)");
      return false;
    }

    if (!formData.phone || formData.phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number");
      return false;
    }

    if (!formData.address || formData.address.trim().length < 5) {
      alert("Please enter a complete address (minimum 5 characters)");
      return false;
    }

    if (!formData.city || formData.city.trim().length < 2) {
      alert("Please enter a valid city name");
      return false;
    }

    if (!formData.pincode || formData.pincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode");
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const userId = auth.currentUser ? auth.currentUser.uid : "guest";

      // Save address if requested
      if (saveAddress && auth.currentUser) {
        try {
          await addDoc(collection(db, "users", auth.currentUser.uid, "addresses"), {
            name: formData.fullName,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            lat: formData.lat,
            lng: formData.lng,
            createdAt: serverTimestamp()
          });
        } catch (err) {
          console.error("Error saving address:", err);
        }
      }

      const orderId = await OrderService.createOrder({
        userId,
        items,
        totalAmount: total(),
        status: 'pending',
        shippingAddress: {
          name: formData.fullName,
          phone: formData.phone,
          street: formData.address,
          city: formData.city,
          pincode: formData.pincode,
          location: { lat: formData.lat, lng: formData.lng }
        }
      });
      console.log("Order created with ID: ", orderId);

      // Decrease product stock for each item
      for (const item of items) {
        try {
          const productRef = doc(db, "products", item.id);
          const productSnap = await getDoc(productRef);

          if (productSnap.exists()) {
            const currentStock = productSnap.data().stock || 0;
            const newStock = Math.max(0, currentStock - item.quantity);

            await updateDoc(productRef, {
              stock: newStock
            });
          }
        } catch (stockError) {
          console.error(`Failed to update stock for product ${item.id}:`, stockError);
        }
      }

      clearCart();
      setPlacedOrderId(orderId);
      setOrderSuccess(true);
      // Removed alert and router.push here, handled by modal
    } catch (error) {
      console.error("Error placing order: ", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ... (existing render logic for empty cart)

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground">
      <Header />

      {step === 1 ? (
        // ... (existing Step 1 JSX)
        <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
          {/* Left: Map (70%) */}
          <div className="w-full lg:w-[70%] h-[50vh] lg:h-full relative">
            <AddressMap onAddressSelect={handleAddressSelect} />
          </div>

          {/* Right: Form (30%) */}
          <div className="w-full lg:w-[30%] h-full overflow-y-auto bg-neutral-900 border-l border-white/10 p-6">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/cart" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <ArrowLeft className="w-6 h-6 text-white" />
              </Link>
              <h1 className="text-2xl font-bold text-white">Delivery Details</h1>
            </div>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-400 mb-3 uppercase tracking-wider">Saved Addresses</h3>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                  {savedAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => handleSavedAddressClick(addr)}
                      className="min-w-[200px] bg-zinc-800 p-3 rounded-xl border border-zinc-700 cursor-pointer hover:border-white/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="h-3 w-3 text-primary" />
                        <span className="font-bold text-sm text-white truncate">{addr.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 line-clamp-2">{addr.address}</p>
                      <p className="text-xs text-gray-500 mt-1">{addr.city} - {addr.pincode}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">Full Name</label>
                <Input
                  name="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="bg-neutral-800 border-white/10 text-white h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">Phone Number</label>
                <Input
                  name="phone"
                  placeholder="10-digit number"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="bg-neutral-800 border-white/10 text-white h-12"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">Address</label>
                <Input
                  name="address"
                  placeholder="Flat, Building, Street"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="bg-neutral-800 border-white/10 text-white h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-400">City</label>
                  <Input
                    name="city"
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="bg-neutral-800 border-white/10 text-white h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-neutral-400">Pincode</label>
                  <Input
                    name="pincode"
                    placeholder="400001"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="bg-neutral-800 border-white/10 text-white h-12"
                  />
                </div>
              </div>

              {/* Save Address Checkbox */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="saveAddress"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary bg-neutral-800"
                />
                <label htmlFor="saveAddress" className="text-sm text-gray-300 cursor-pointer select-none">
                  Save this address for future orders
                </label>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between text-lg font-bold text-white mb-6">
                  <span>Total To Pay:</span>
                  <span className="text-primary">₹{total()}</span>
                </div>
                <Button
                  onClick={() => {
                    if (validateStep1()) setStep(2);
                  }}
                  className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-14 text-lg"
                >
                  Proceed to Payment
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ... (existing Step 2 JSX)
        <div className="container mx-auto px-4 max-w-4xl py-12">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" onClick={() => setStep(1)} className="p-2 hover:bg-white/5 rounded-full">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Button>
            <h1 className="text-3xl font-bold text-white">Review & Pay</h1>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              {/* Address Summary */}
              <div className="bg-neutral-900/50 p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-2">Delivery To</h3>
                <p className="text-neutral-300">{formData.fullName}</p>
                <p className="text-neutral-400">{formData.address}</p>
                <p className="text-neutral-400">{formData.city} - {formData.pincode}</p>
                <p className="text-neutral-400">Phone: {formData.phone}</p>
              </div>

              {/* Payment Method */}
              <div className="bg-neutral-900/50 p-6 rounded-2xl border border-primary/50">
                <h3 className="text-lg font-bold text-white mb-4">Payment Method</h3>
                <div className="flex items-center gap-4 p-4 bg-primary/10 rounded-xl border border-primary/20">
                  <Truck className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-bold text-white">Cash on Delivery</p>
                    <p className="text-sm text-neutral-400">Pay when you receive</p>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-primary ml-auto" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Order Summary */}
              <div className="bg-neutral-900 p-6 rounded-2xl border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">Order Summary</h3>
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-neutral-800">
                        <Image src={item.image} alt={item.title} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-white line-clamp-1">{item.title}</p>
                        <p className="text-sm text-neutral-400">Qty: {item.quantity}</p>
                        <p className="font-bold text-primary">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                  <Separator className="bg-white/10" />
                  <div className="flex justify-between text-lg font-bold text-white">
                    <span>Total:</span>
                    <span className="text-primary">₹{total()}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full mt-6 bg-primary hover:bg-primary/90 text-black font-bold h-14 text-lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      <Dialog open={orderSuccess} onOpenChange={() => { }}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md text-center p-8">
          <div className="flex justify-center mb-6">
            <div className="h-24 w-24 bg-green-500/20 rounded-full flex items-center justify-center animate-bounce">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </div>
          </div>
          <DialogHeader>
            <DialogTitle className="text-3xl font-black text-center mb-2">ORDER PLACED!</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mb-8">
            <p className="text-gray-400">
              Thank you for your purchase. Your order has been successfully placed and is being processed.
            </p>
            <div className="bg-black/40 p-4 rounded-xl border border-white/5">
              <p className="text-sm text-gray-500 uppercase font-bold tracking-wider mb-1">Order ID</p>
              <p className="font-mono text-lg text-primary">{placedOrderId}</p>
            </div>
          </div>
          <Button
            onClick={() => router.push(`/order/${placedOrderId}`)}
            className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-12 text-lg"
          >
            Track Order
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
