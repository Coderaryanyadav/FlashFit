"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/features/cart/store/useCartStore";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Separator } from "@/shared/ui/separator";
import { MapPin, CheckCircle2, Truck, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { db, auth } from "@/shared/infrastructure/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Header } from "@/components/Header";
import { OrderService } from "@/services/orderService";

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

  // Load saved form data from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("checkout_form_data");
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved checkout data");
      }
    }
  }, []);

  // Save form data to localStorage on change
  useEffect(() => {
    localStorage.setItem("checkout_form_data", JSON.stringify(formData));
  }, [formData]);

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
    const specialCharRegex = /[^a-zA-Z0-9\s,.-]/;

    if (!formData.fullName || formData.fullName.trim().length < 2) {
      toast.error("Please enter a valid name (minimum 2 characters)");
      return false;
    }
    if (specialCharRegex.test(formData.fullName)) {
      toast.error("Name contains invalid characters");
      return false;
    }

    if (!formData.phone || formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }

    if (!formData.address || formData.address.trim().length < 5) {
      toast.error("Please enter a complete address (minimum 5 characters)");
      return false;
    }
    // Address can have some special chars like # or / so we use a looser regex or skip strict check
    // But let's prevent dangerous script tags or similar
    if (/[<>]/.test(formData.address)) {
      toast.error("Address contains invalid characters");
      return false;
    }

    if (!formData.city || formData.city.trim().length < 2) {
      toast.error("Please enter a valid city name");
      return false;
    }
    if (specialCharRegex.test(formData.city)) {
      toast.error("City contains invalid characters");
      return false;
    }

    if (!formData.pincode || formData.pincode.length !== 6) {
      toast.error("Please enter a valid 6-digit pincode");
      return false;
    }

    return true;
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0 && !orderSuccess) {
      router.push("/cart");
    }
  }, [items, router, orderSuccess]);

  // Enforce Login
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        toast.error("Please login to place an order");
        router.push("/login?redirect=/checkout");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    setLoading(true);
    try {
      const userId = auth.currentUser ? auth.currentUser.uid : "guest";

      // Email Verification Check
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        toast.error("Please verify your email address to place an order.", {
          action: {
            label: "Resend Email",
            onClick: async () => {
              if (auth.currentUser) {
                await import("firebase/auth").then(({ sendEmailVerification }) =>
                  sendEmailVerification(auth.currentUser!)
                );
                toast.success("Verification email sent!");
              }
            }
          }
        });
        setLoading(false);
        return;
      }

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

      // Use the storeId from the first item, or a default
      // In a multi-vendor app, we might need to split orders, but for now we assume one store or handle it in backend
      const storeId = (items[0] as any).storeId || "default_store";

      // Timeout Promise
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Request timed out. Please check your internet connection.")), 15000)
      );

      const orderId = await Promise.race([
        OrderService.createOrder({
          userId,
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            size: item.size,
            price: item.price,
            title: item.title,
            image: item.image
          })),
          totalAmount: total(),
          storeId,
          shippingAddress: {
            name: formData.fullName,
            phone: formData.phone,
            street: formData.address,
            city: formData.city,
            pincode: formData.pincode,
            location: { lat: formData.lat, lng: formData.lng }
          }
        }),
        timeoutPromise
      ]) as string;
      // Order created successfully

      clearCart();
      setPlacedOrderId(orderId);
      setOrderSuccess(true);
    } catch (error: any) {
      console.error("Error placing order: ", error);
      // Extract specific error message if available
      const errorMessage = error?.message || "Failed to place order. Please try again.";
      // Clean up Firebase error prefix if present
      const cleanMessage = errorMessage.replace("INTERNAL: ", "").replace("INVALID_ARGUMENT: ", "").replace("FAILED_PRECONDITION: ", "");
      toast.error(cleanMessage);
    } finally {
      setLoading(false);
    }
  };

  // Enforce Login
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        toast.error("Please login to place an order");
        router.push("/login?redirect=/checkout");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // ... (existing render logic for empty cart)

  return (
    <div className="min-h-screen bg-neutral-950 text-foreground">
      <Header />

      {step === 1 ? (
        // Step 1: Address & Details - Clean Form Layout
        <div className="container mx-auto px-4 max-w-2xl py-12">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/cart" className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Delivery Details</h1>
          </div>

          {/* Saved Addresses */}
          {savedAddresses.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-bold text-gray-400 mb-4 uppercase tracking-wider">Saved Addresses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedAddresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => handleSavedAddressClick(addr)}
                    className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 cursor-pointer hover:border-primary/50 transition-all hover:bg-zinc-800/50"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-bold text-white">{addr.name}</span>
                    </div>
                    <p className="text-sm text-gray-400 mb-1">{addr.address}</p>
                    <p className="text-xs text-gray-500">{addr.city} - {addr.pincode}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Address Form */}
          <div className="bg-neutral-900/50 p-8 rounded-2xl border border-white/10 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Full Name *</label>
              <Input
                name="fullName"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleInputChange}
                className="bg-neutral-800 border-white/10 text-white h-12 focus:border-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Phone Number *</label>
              <Input
                name="phone"
                type="tel"
                inputMode="numeric"
                placeholder="10-digit mobile number"
                value={formData.phone}
                onChange={handleInputChange}
                maxLength={10}
                className="bg-neutral-800 border-white/10 text-white h-12 focus:border-primary"
              />
              <p className="text-xs text-gray-500">We&apos;ll use this to contact you about your order</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-neutral-300">Complete Address *</label>
              <Input
                name="address"
                placeholder="Flat/House No., Building Name, Street, Area"
                value={formData.address}
                onChange={handleInputChange}
                className="bg-neutral-800 border-white/10 text-white h-12 focus:border-primary"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">City *</label>
                <Input
                  name="city"
                  placeholder="Mumbai"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="bg-neutral-800 border-white/10 text-white h-12 focus:border-primary"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-300">Pincode *</label>
                <Input
                  name="pincode"
                  type="tel"
                  inputMode="numeric"
                  placeholder="400001"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  maxLength={6}
                  className="bg-neutral-800 border-white/10 text-white h-12 focus:border-primary"
                />
              </div>
            </div>

            {/* Save Address Checkbox */}
            <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-xl">
              <input
                type="checkbox"
                id="saveAddress"
                checked={saveAddress}
                onChange={(e) => setSaveAddress(e.target.checked)}
                className="h-5 w-5 rounded border-gray-600 text-primary focus:ring-primary bg-neutral-700"
              />
              <label htmlFor="saveAddress" className="text-sm text-gray-300 cursor-pointer select-none">
                Save this address for future orders
              </label>
            </div>

            {/* Total and CTA */}
            <div className="pt-6 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg text-gray-400">Total Amount</span>
                <span className="text-3xl font-bold text-primary">₹{total()}</span>
              </div>
              <Button
                onClick={() => {
                  if (validateStep1()) setStep(2);
                }}
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-14 text-lg rounded-xl"
              >
                Proceed to Payment
              </Button>
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
                        {item.image ? (
                          <Image src={item.image} alt={item.title} fill className="object-cover" />
                        ) : (
                          <div className="w-full h-full bg-neutral-800" />
                        )}
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
