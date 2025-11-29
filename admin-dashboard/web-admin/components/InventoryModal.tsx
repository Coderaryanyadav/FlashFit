"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface Product {
    id: string;
    title: string;
    stock: number;
    price: number;
}

interface InventoryModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function InventoryModal({ product, isOpen, onClose, onSuccess }: InventoryModalProps) {
    const [adjustmentType, setAdjustmentType] = useState<'add' | 'remove' | 'set'>('add');
    const [quantity, setQuantity] = useState(0);
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAdjust = async () => {
        if (!product) return;

        setLoading(true);
        try {
            let newStock = product.stock;

            if (adjustmentType === 'add') {
                newStock = product.stock + quantity;
            } else if (adjustmentType === 'remove') {
                newStock = Math.max(0, product.stock - quantity);
            } else {
                newStock = quantity;
            }

            await updateDoc(doc(db, "products", product.id), {
                stock: newStock,
                lastStockUpdate: new Date(),
                stockUpdateReason: reason || `${adjustmentType} ${quantity} units`
            });

            toast.success(`Stock updated: ${product.stock} → ${newStock}`);
            onSuccess();
            onClose();
            setQuantity(0);
            setReason('');
        } catch (error) {
            console.error("Error updating stock:", error);
            toast.error("Failed to update stock");
        } finally {
            setLoading(false);
        }
    };

    if (!product) return null;

    const getNewStock = () => {
        if (adjustmentType === 'add') return product.stock + quantity;
        if (adjustmentType === 'remove') return Math.max(0, product.stock - quantity);
        return quantity;
    };

    const stockChange = getNewStock() - product.stock;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-neutral-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Inventory Management</DialogTitle>
                    <p className="text-gray-400 text-sm">{product.title}</p>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-neutral-800 p-4 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Current Stock</p>
                        <p className="text-3xl font-bold text-white">{product.stock}</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-gray-300">Adjustment Type</Label>
                        <Select value={adjustmentType} onValueChange={(value: any) => setAdjustmentType(value)}>
                            <SelectTrigger className="bg-neutral-800 border-white/10 text-white">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-neutral-800 border-white/10">
                                <SelectItem value="add" className="text-white">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        Add Stock
                                    </div>
                                </SelectItem>
                                <SelectItem value="remove" className="text-white">
                                    <div className="flex items-center gap-2">
                                        <TrendingDown className="h-4 w-4 text-red-500" />
                                        Remove Stock
                                    </div>
                                </SelectItem>
                                <SelectItem value="set" className="text-white">
                                    <div className="flex items-center gap-2">
                                        <AlertCircle className="h-4 w-4 text-blue-500" />
                                        Set Stock
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="quantity" className="text-gray-300">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            placeholder="Enter quantity"
                            className="bg-neutral-800 border-white/10 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="reason" className="text-gray-300">Reason (Optional)</Label>
                        <Input
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Restock, Damaged, Sold"
                            className="bg-neutral-800 border-white/10 text-white"
                        />
                    </div>

                    {quantity > 0 && (
                        <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
                            <p className="text-sm text-gray-300 mb-2">Preview:</p>
                            <div className="flex items-center justify-between">
                                <span className="text-white font-bold">{product.stock}</span>
                                <span className="text-gray-400">→</span>
                                <span className={`text-2xl font-bold ${stockChange > 0 ? 'text-green-500' : stockChange < 0 ? 'text-red-500' : 'text-white'}`}>
                                    {getNewStock()}
                                </span>
                            </div>
                            {stockChange !== 0 && (
                                <p className={`text-xs mt-2 ${stockChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {stockChange > 0 ? '+' : ''}{stockChange} units
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleAdjust}
                        disabled={loading || quantity === 0}
                        className="w-full bg-white text-black hover:bg-gray-200"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Update Stock"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
