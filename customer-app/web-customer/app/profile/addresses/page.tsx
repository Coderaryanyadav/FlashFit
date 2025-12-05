"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/shared/ui/button";
import { Plus, MapPin, Trash2, Home, Briefcase, ArrowLeft } from "lucide-react";
import { auth, db } from "@/shared/infrastructure/firebase";
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { toast } from "sonner";
import Link from "next/link";

export default function AddressesPage() {
    const [user, setUser] = useState<any>(null);
    const [addresses, setAddresses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddOpen, setIsAddOpen] = useState(false);

    // New Address State
    const [newAddress, setNewAddress] = useState({
        label: "Home",
        line1: "",
        city: "Mumbai",
        pincode: "",
        phone: ""
    });

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (u) => {
            if (u) {
                setUser(u);
                const docRef = doc(db, "users", u.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setAddresses(docSnap.data().addresses || []);
                }
            }
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const handleAddAddress = async () => {
        if (!newAddress.line1 || !newAddress.pincode) {
            toast.error("Please fill required fields");
            return;
        }

        try {
            const addressToAdd = { ...newAddress, id: Date.now().toString() };
            const userRef = doc(db, "users", user.uid);

            await setDoc(userRef, {
                addresses: arrayUnion(addressToAdd)
            }, { merge: true });

            setAddresses([...addresses, addressToAdd]);
            setIsAddOpen(false);
            setNewAddress({ label: "Home", line1: "", city: "Mumbai", pincode: "", phone: "" });
            toast.success("Address added successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to add address");
        }
    };

    const handleDelete = async (address: any) => {
        try {
            const userRef = doc(db, "users", user.uid);
            await setDoc(userRef, {
                addresses: arrayRemove(address)
            }, { merge: true });
            setAddresses(addresses.filter(a => a.id !== address.id));
            toast.success("Address removed");
        } catch (error) {
            toast.error("Failed to remove address");
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Header />
            <div className="container mx-auto px-4 pt-24 max-w-2xl">
                <Link href="/profile" className="mb-4 inline-flex items-center text-gray-400 hover:text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
                </Link>
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-black italic">SAVED ADDRESSES</h1>
                    <Button
                        className="bg-white text-black hover:bg-gray-200 font-bold"
                        onClick={() => setIsAddOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Add New
                    </Button>
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogContent className="bg-zinc-900 border-zinc-800 text-white">
                            <DialogHeader>
                                <DialogTitle>Add New Address</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        variant={newAddress.label === 'Home' ? 'default' : 'outline'}
                                        onClick={() => setNewAddress({ ...newAddress, label: 'Home' })}
                                        className={newAddress.label === 'Home' ? 'bg-white text-black' : 'bg-transparent border-zinc-700'}
                                    >
                                        <Home className="h-4 w-4 mr-2" /> Home
                                    </Button>
                                    <Button
                                        variant={newAddress.label === 'Work' ? 'default' : 'outline'}
                                        onClick={() => setNewAddress({ ...newAddress, label: 'Work' })}
                                        className={newAddress.label === 'Work' ? 'bg-white text-black' : 'bg-transparent border-zinc-700'}
                                    >
                                        <Briefcase className="h-4 w-4 mr-2" /> Work
                                    </Button>
                                </div>
                                <Input
                                    placeholder="Flat / House No / Building"
                                    value={newAddress.line1}
                                    onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                                    className="bg-black border-zinc-700"
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        placeholder="Pincode"
                                        value={newAddress.pincode}
                                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                        className="bg-black border-zinc-700"
                                    />
                                    <Input
                                        placeholder="City"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                        className="bg-black border-zinc-700"
                                    />
                                </div>
                                <Input
                                    placeholder="Phone Number (Optional)"
                                    value={newAddress.phone}
                                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                                    className="bg-black border-zinc-700"
                                />
                                <Button onClick={handleAddAddress} className="w-full bg-primary text-black font-bold">
                                    Save Address
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                {addresses.length === 0 ? (
                    <div className="text-center py-20 bg-zinc-900/50 rounded-2xl border border-dashed border-white/10">
                        <MapPin className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">No saved addresses found.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {addresses.map((addr) => (
                            <div key={addr.id} className="p-6 bg-zinc-900 rounded-xl border border-white/5 flex justify-between items-start group hover:border-white/20 transition-colors">
                                <div className="flex gap-4">
                                    <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center">
                                        {addr.label === 'Work' ? <Briefcase className="h-5 w-5 text-gray-400" /> : <Home className="h-5 w-5 text-gray-400" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-white">{addr.label}</h3>
                                            {addr.phone && <span className="text-xs text-gray-500">• {addr.phone}</span>}
                                        </div>
                                        <p className="text-sm text-gray-400 mt-1">{addr.line1}</p>
                                        <p className="text-sm text-gray-400">{addr.city} - {addr.pincode}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(addr)}
                                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                                >
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
