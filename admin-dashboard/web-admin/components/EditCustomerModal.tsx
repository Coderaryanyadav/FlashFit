"use client";

import { useState } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Customer {
    id: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
    totalOrders?: number;
}

interface EditCustomerModalProps {
    customer: Customer | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditCustomerModal({ customer, isOpen, onClose, onSuccess }: EditCustomerModalProps) {
    const [displayName, setDisplayName] = useState(customer?.displayName || "");
    const [phoneNumber, setPhoneNumber] = useState(customer?.phoneNumber || "");
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        if (!customer) return;

        setLoading(true);
        try {
            await updateDoc(doc(db, "users", customer.id), {
                displayName,
                phoneNumber,
                updatedAt: new Date()
            });

            toast.success("Customer updated successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating customer:", error);
            toast.error("Failed to update customer");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!customer) return;
        if (!confirm("Are you sure you want to delete this customer? This action cannot be undone.")) return;

        setLoading(true);
        try {
            await deleteDoc(doc(db, "users", customer.id));
            toast.success("Customer deleted successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error deleting customer:", error);
            toast.error("Failed to delete customer");
        } finally {
            setLoading(false);
        }
    };

    if (!customer) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-neutral-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Edit Customer</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">Email (Read-only)</Label>
                        <Input
                            id="email"
                            value={customer.email}
                            disabled
                            className="bg-neutral-800 border-white/10 text-gray-400"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
                        <Input
                            id="displayName"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            placeholder="Enter customer name"
                            className="bg-neutral-800 border-white/10 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phoneNumber" className="text-gray-300">Phone Number</Label>
                        <Input
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+91 XXXXX XXXXX"
                            className="bg-neutral-800 border-white/10 text-white"
                        />
                    </div>

                    <div className="bg-neutral-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">Total Orders: <span className="text-white font-bold">{customer.totalOrders || 0}</span></p>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Delete Customer"}
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
