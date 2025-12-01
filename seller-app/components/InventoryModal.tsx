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
    stock: number | Record<string, number>;
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
    const [selectedSize, setSelectedSize] = useState<string>('default');

    // Helper to get current stock for selected size (or global)
    const getCurrentStock = () => {
        if (!product) return 0;
        if (typeof product.stock === 'number') return product.stock;
        return product.stock[selectedSize] || 0;
    };

    const handleAdjust = async () => {
        if (!product) return;

        setLoading(true);
        try {
            let newStockValue = getCurrentStock();

            if (adjustmentType === 'add') {
                newStockValue += quantity;
            } else if (adjustmentType === 'remove') {
                newStockValue = Math.max(0, newStockValue - quantity);
            } else {
                newStockValue = quantity;
            }

            let updateData: any = {};

            if (typeof product.stock === 'number' && selectedSize === 'default') {
                updateData = { stock: newStockValue };
            } else {
                // It's size based or converting to size based
                updateData = { [`stock.${selectedSize}`]: newStockValue };
            }

            await updateDoc(doc(db, "products", product.id), {
                ...updateData,
                lastStockUpdate: new Date(),
                stockUpdateReason: reason || `${adjustmentType} ${quantity} units`
            });

            toast.success(`Stock updated`);
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

    const currentStock = getCurrentStock();
    const isSizeBased = typeof product.stock !== 'number';
    const availableSizes = isSizeBased ? Object.keys(product.stock as Record<string, number>) : [];
    // Add common sizes if not present to allow adding new sizes
    const commonSizes = ["S", "M", "L", "XL", "XXL"];
    const allSizes = Array.from(new Set([...availableSizes, ...commonSizes]));

    const getNewStock = () => {
        if (adjustmentType === 'add') return currentStock + quantity;
        if (adjustmentType === 'remove') return Math.max(0, currentStock - quantity);
        return quantity;
    };

    const stockChange = getNewStock() - currentStock;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-neutral-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Inventory Management</DialogTitle>
                    <p className="text-gray-400 text-sm">{product.title}</p>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Size Selector if applicable */}
                    {isSizeBased || selectedSize !== 'default' ? (
                        <div className="space-y-2">
                            <Label className="text-gray-300">Size</Label>
                            <Select value={selectedSize} onValueChange={setSelectedSize}>
                                <SelectTrigger className="bg-neutral-800 border-white/10 text-white">
                                    <SelectValue placeholder="Select Size" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-800 border-white/10">
                                    {allSizes.map(size => (
                                        <SelectItem key={size} value={size} className="text-white">
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    ) : null}

                    <div className="bg-neutral-800 p-4 rounded-lg">
                        <p className="text-xs text-gray-400 mb-1">Current Stock {selectedSize !== 'default' ? `(${selectedSize})` : ''}</p>
                        <p className="text-3xl font-bold text-white">{currentStock}</p>
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
                                <span className="text-white font-bold">{currentStock}</span>
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
