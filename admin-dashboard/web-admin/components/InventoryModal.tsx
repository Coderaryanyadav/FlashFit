"use client";

import { useState, useEffect } from "react";
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
    category?: string;
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
    const [selectedSize, setSelectedSize] = useState<string>('default');
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset state when modal opens or product changes
    useEffect(() => {
        if (isOpen) {
            setQuantity(0);
            setReason('');
            setAdjustmentType('add');
            // Default to first size if available, else 'default'
            if (product && typeof product.stock === 'object') {
                const sizes = Object.keys(product.stock);
                if (sizes.length > 0) setSelectedSize(sizes[0]);
                else setSelectedSize('default');
            } else {
                setSelectedSize('default');
            }
        }
    }, [isOpen, product]);

    if (!product) return null;

    const isSizeBased = typeof product.stock === 'object' ||
        (product.category === 'men' || product.category === 'women' || product.category === 'kids' || product.category === 'urban-style');

    const availableSizes = isSizeBased
        ? (typeof product.stock === 'object' ? Object.keys(product.stock) : ["S", "M", "L", "XL", "XXL"])
        : [];

    // Ensure we have a valid size selection if it's size-based
    if (isSizeBased && selectedSize === 'default' && availableSizes.length > 0) {
        // This might cause a render loop if not careful, but useEffect handles init.
        // We'll just use the first available size for calculation if 'default' is selected.
    }

    const currentStockVal = (size: string) => {
        if (typeof product.stock === 'number') return product.stock;
        return (product.stock as Record<string, number>)[size] || 0;
    };

    const targetSize = isSizeBased && selectedSize !== 'default' ? selectedSize : (availableSizes.length > 0 ? availableSizes[0] : 'default');
    const currentStock = isSizeBased ? currentStockVal(targetSize) : (typeof product.stock === 'number' ? product.stock : 0);

    const getNewStock = () => {
        if (adjustmentType === 'add') return currentStock + quantity;
        if (adjustmentType === 'remove') return Math.max(0, currentStock - quantity);
        return quantity;
    };

    const stockChange = getNewStock() - currentStock;

    const handleAdjust = async () => {
        setLoading(true);
        try {
            const newStockVal = getNewStock();
            let updateData: any = {
                lastStockUpdate: new Date(),
                stockUpdateReason: reason || `${adjustmentType} ${quantity} units`
            };

            if (isSizeBased) {
                // Update specific size in the map
                // We need to construct the update path: "stock.Size"
                // Firestore update with dot notation works for nested fields
                updateData[`stock.${targetSize}`] = newStockVal;

                // If the product was previously number-based, we might need to initialize it as object first?
                // updateDoc handles dot notation merging. But if stock is a number, we can't merge "stock.S".
                // We might need to check and convert.
                if (typeof product.stock === 'number') {
                    // Convert to object
                    const newStockObj = { [targetSize]: newStockVal };
                    updateData = {
                        stock: newStockObj,
                        lastStockUpdate: new Date(),
                        stockUpdateReason: reason
                    };
                }
            } else {
                updateData.stock = newStockVal;
            }

            await updateDoc(doc(db, "products", product.id), updateData);

            toast.success(`Stock updated for ${isSizeBased ? targetSize : 'Global'}: ${currentStock} → ${newStockVal}`);
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating stock:", error);
            toast.error("Failed to update stock");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-neutral-900 border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Inventory Management</DialogTitle>
                    <p className="text-gray-400 text-sm">{product.title}</p>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="bg-neutral-800 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <p className="text-xs text-gray-400 mb-1">Current Stock {isSizeBased && `(${targetSize})`}</p>
                            <p className="text-3xl font-bold text-white">{currentStock}</p>
                        </div>
                        {isSizeBased && (
                            <div className="text-right">
                                <p className="text-xs text-gray-400 mb-1">Total Stock</p>
                                <p className="text-xl font-bold text-gray-300">
                                    {typeof product.stock === 'number' ? product.stock : Object.values(product.stock).reduce((a, b) => a + b, 0)}
                                </p>
                            </div>
                        )}
                    </div>

                    {isSizeBased && (
                        <div className="space-y-2">
                            <Label className="text-gray-300">Select Size</Label>
                            <Select value={selectedSize} onValueChange={setSelectedSize}>
                                <SelectTrigger className="bg-neutral-800 border-white/10 text-white">
                                    <SelectValue placeholder="Select Size" />
                                </SelectTrigger>
                                <SelectContent className="bg-neutral-800 border-white/10">
                                    {availableSizes.length > 0 ? availableSizes.map(s => (
                                        <SelectItem key={s} value={s} className="text-white">{s}</SelectItem>
                                    )) : (
                                        <SelectItem value="default" className="text-white">Default</SelectItem>
                                    )}
                                    {/* Allow adding new size if needed? For now, stick to predefined or existing */}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

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
