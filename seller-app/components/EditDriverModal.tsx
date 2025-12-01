"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Driver {
    uid: string;
    name: string;
    email: string;
    phone: string;
    isOnline?: boolean;
    totalDeliveries?: number;
    rating?: number;
}

interface EditDriverModalProps {
    driver: Driver | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditDriverModal({ driver, isOpen, onClose, onSuccess }: EditDriverModalProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (driver) {
            setName(driver.name || "");
            setPhone(driver.phone || "");
        }
    }, [driver]);

    const handleSave = async () => {
        if (!driver) return;

        setLoading(true);
        try {
            // Update both drivers and users collections
            await updateDoc(doc(db, "drivers", driver.uid), {
                name,
                phone,
                updatedAt: new Date()
            });

            await updateDoc(doc(db, "users", driver.uid), {
                displayName: name,
                phoneNumber: phone,
                updatedAt: new Date()
            });

            toast.success("Driver updated successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating driver:", error);
            toast.error("Failed to update driver");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!driver) return;
        if (!confirm("Are you sure you want to delete this driver? This action cannot be undone.")) return;

        setLoading(true);
        try {
            await deleteDoc(doc(db, "drivers", driver.uid));
            await deleteDoc(doc(db, "users", driver.uid));
            toast.success("Driver deleted successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error deleting driver:", error);
            toast.error("Failed to delete driver");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async () => {
        if (!driver) return;

        setLoading(true);
        try {
            const newStatus = !driver.isOnline;
            await updateDoc(doc(db, "drivers", driver.uid), {
                isOnline: newStatus,
                status: newStatus ? 'online' : 'offline'
            });

            toast.success(`Driver is now ${newStatus ? 'online' : 'offline'}`);
            onSuccess();
        } catch (error) {
            console.error("Error toggling status:", error);
            toast.error("Failed to update status");
        } finally {
            setLoading(false);
        }
    };

    if (!driver) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-neutral-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Edit Driver</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Email (Read-only)</Label>
                        <Input
                            id="email"
                            value={driver.email}
                            disabled
                            className="bg-neutral-800 border-white/10 text-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">Driver Name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter driver name"
                            className="bg-neutral-800 border-white/10 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone" className="text-gray-300">Phone Number</Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+91 XXXXX XXXXX"
                            className="bg-neutral-800 border-white/10 text-white"
                        />
                    </div>

                    <div className="bg-neutral-800 p-4 rounded-lg space-y-2">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-400">Status:</p>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${driver.isOnline ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                                {driver.isOnline ? 'ONLINE' : 'OFFLINE'}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-sm text-gray-400">Total Deliveries:</p>
                            <p className="text-white font-bold">{driver.totalDeliveries || 0}</p>
                        </div>
                        <div className="flex justify-between">
                            <p className="text-sm text-gray-400">Rating:</p>
                            <p className="text-white font-bold">{driver.rating || 0} ⭐</p>
                        </div>
                    </div>

                    <Button
                        onClick={handleToggleStatus}
                        variant="outline"
                        className="w-full border-white/10 hover:bg-white/10"
                        disabled={loading}
                    >
                        {driver.isOnline ? 'Set Offline' : 'Set Online'}
                    </Button>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Delete Driver"}
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 bg-white text-black hover:bg-gray-200"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
