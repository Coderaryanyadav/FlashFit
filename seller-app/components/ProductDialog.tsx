"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { db, auth } from "@/utils/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { Loader2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productToEdit?: any; // If null, it's add mode
}

const SERVICEABLE_PINCODE = "400059"; // Mumbai - Goregaon (Only pincode we serve)

export function ProductDialog({ open, onOpenChange, productToEdit }: ProductDialogProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        price: "",
        stock: "",
        category: "",
        image: "",
        pincodes: [] as string[],
        discount: "",
        colors: "",
    });

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                title: productToEdit.title,
                price: productToEdit.price.toString(),
                stock: typeof productToEdit.stock === 'number'
                    ? productToEdit.stock.toString()
                    : Object.values(productToEdit.stock).reduce((a: number, b: any) => a + b, 0).toString(),
                category: productToEdit.category,
                image: productToEdit.image,
                pincodes: [SERVICEABLE_PINCODE],
                discount: productToEdit.discount ? productToEdit.discount.toString() : "",
                colors: productToEdit.colors ? productToEdit.colors.join(", ") : "",
            });
        } else {
            setFormData({
                title: "",
                price: "",
                stock: "",
                category: "",
                image: "",
                pincodes: [SERVICEABLE_PINCODE],
                discount: "",
                colors: "",
            });
        }
    }, [productToEdit, open]);

    const togglePincode = (pincode: string) => {
        setFormData(prev => ({
            ...prev,
            pincodes: prev.pincodes.includes(pincode)
                ? prev.pincodes.filter(p => p !== pincode)
                : [...prev.pincodes, pincode]
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { currentUser } = auth;
            if (!currentUser) {
                alert("You must be logged in to save a product");
                return;
            }

            const data = {
                title: formData.title,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock), // Initial global stock
                category: formData.category,
                image: formData.image,
                pincodes: formData.pincodes,
                discount: formData.discount ? parseInt(formData.discount) : 0,
                colors: formData.colors ? formData.colors.split(",").map(c => c.trim()).filter(c => c) : [],
                updatedAt: serverTimestamp(),
                storeId: currentUser.uid, // Attach Store ID
            };

            if (productToEdit) {
                // Edit Mode
                // If stock was an object, this overwrite will reset it to a number. 
                // This is acceptable for MVP "Edit" form, as "Inventory Management" modal handles complex stock.
                await updateDoc(doc(db, "products", productToEdit.id), data);
            } else {
                // Add Mode
                await addDoc(collection(db, "products"), {
                    ...data,
                    createdAt: serverTimestamp(),
                });
            }

            onOpenChange(false);
        } catch (error) {
            console.error("Error saving product:", error);
            alert("Failed to save product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{productToEdit ? "Edit Product" : "Add New Product"}</DialogTitle>
                    <DialogDescription>
                        {productToEdit ? "Make changes to the product here." : "Add a new product to your inventory."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="price" className="text-right">
                            Price
                        </Label>
                        <Input
                            id="price"
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="stock" className="text-right">
                            Stock
                        </Label>
                        <Input
                            id="stock"
                            type="number"
                            value={formData.stock}
                            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">
                            Category
                        </Label>
                        <Select
                            value={formData.category}
                            onValueChange={(value: string) => setFormData({ ...formData, category: value })}
                            required
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="women">Women</SelectItem>
                                <SelectItem value="men">Men</SelectItem>
                                <SelectItem value="kids">Kids</SelectItem>
                                <SelectItem value="urban-style">Urban Style</SelectItem>
                                <SelectItem value="accessories">Accessories</SelectItem>
                                <SelectItem value="everyday">Everyday</SelectItem>
                                <SelectItem value="last-minute">Last Minute</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="image" className="text-right">
                            Image URL
                        </Label>
                        <Input
                            id="image"
                            value={formData.image}
                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            className="col-span-3"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="discount" className="text-right">
                            Discount %
                        </Label>
                        <Input
                            id="discount"
                            type="number"
                            min="0"
                            max="100"
                            value={formData.discount}
                            onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                            className="col-span-3"
                            placeholder="e.g. 20"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="colors" className="text-right">
                            Colors
                        </Label>
                        <Input
                            id="colors"
                            value={formData.colors}
                            onChange={(e) => setFormData({ ...formData, colors: e.target.value })}
                            className="col-span-3"
                            placeholder="Comma separated (e.g. Red, Blue, Black)"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label className="text-right pt-2">
                            Pincode
                        </Label>
                        <div className="col-span-3 space-y-2">
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800 font-medium">Service Area:</p>
                                <p className="text-lg font-bold text-blue-900">{SERVICEABLE_PINCODE} - Goregaon, Mumbai</p>
                                <p className="text-xs text-blue-600 mt-1">All products will be available in this area</p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save changes
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
