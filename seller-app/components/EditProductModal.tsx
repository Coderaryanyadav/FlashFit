"use client";

import { useState, useEffect } from "react";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Product {
    id: string;
    title: string;
    description?: string;
    price: number;
    stock: number;
    category: string;
    image: string;
    discount?: number;
    colors?: string[];
}

interface EditProductModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditProductModal({ product, isOpen, onClose, onSuccess }: EditProductModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState(0);
    const [stock, setStock] = useState(0);
    const [image, setImage] = useState("");
    const [discount, setDiscount] = useState(0);
    const [colors, setColors] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (product) {
            setTitle(product.title || "");
            setDescription(product.description || "");
            setPrice(product.price || 0);
            setStock(product.stock || 0);
            setImage(product.image || "");
            setDiscount(product.discount || 0);
            setColors(product.colors ? product.colors.join(", ") : "");
        }
    }, [product]);

    const handleSave = async () => {
        if (!product) return;

        setLoading(true);
        try {
            const colorsArray = colors.split(",").map(c => c.trim()).filter(c => c !== "");

            await updateDoc(doc(db, "products", product.id), {
                title,
                description,
                price: Number(price),
                stock: Number(stock),
                image,
                discount: Number(discount),
                colors: colorsArray,
                updatedAt: new Date()
            });

            toast.success("Product updated successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error updating product:", error);
            toast.error("Failed to update product");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!product) return;
        if (!confirm("Are you sure you want to delete this product? This action cannot be undone.")) return;

        setLoading(true);
        try {
            await deleteDoc(doc(db, "products", product.id));
            toast.success("Product deleted successfully");
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error deleting product:", error);
            toast.error("Failed to delete product");
        } finally {
            setLoading(false);
        }
    };

    if (!product) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl bg-neutral-900 border-white/10 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Edit Product</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="title" className="text-gray-300">Product Title</Label>
                        <Input
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter product title"
                            className="bg-neutral-800 border-white/10 text-white"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description" className="text-gray-300">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Enter product description"
                            className="bg-neutral-800 border-white/10 text-white min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="price" className="text-gray-300">Price (₹)</Label>
                            <Input
                                id="price"
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                placeholder="0"
                                className="bg-neutral-800 border-white/10 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="stock" className="text-gray-300">Stock</Label>
                            <Input
                                id="stock"
                                type="number"
                                value={stock}
                                onChange={(e) => setStock(Number(e.target.value))}
                                placeholder="0"
                                className="bg-neutral-800 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="discount" className="text-gray-300">Discount %</Label>
                            <Input
                                id="discount"
                                type="number"
                                value={discount}
                                onChange={(e) => setDiscount(Number(e.target.value))}
                                placeholder="0"
                                className="bg-neutral-800 border-white/10 text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="colors" className="text-gray-300">Colors (comma separated)</Label>
                            <Input
                                id="colors"
                                value={colors}
                                onChange={(e) => setColors(e.target.value)}
                                placeholder="Red, Blue, Green"
                                className="bg-neutral-800 border-white/10 text-white"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="image" className="text-gray-300">Image URL</Label>
                        <Input
                            id="image"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="https://..."
                            className="bg-neutral-800 border-white/10 text-white"
                        />
                    </div>

                    {image && (
                        <div className="space-y-2">
                            <Label className="text-gray-300">Image Preview</Label>
                            <div className="bg-neutral-800 p-4 rounded-lg">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={image}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded"
                                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = "https://via.placeholder.com/400x300?text=Invalid+Image";
                                    }}
                                />
                            </div>
                        </div>
                    )}

                    <div className="bg-neutral-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-400">Category: <span className="text-white font-bold">{product.category}</span></p>
                    </div>
                </div>

                <DialogFooter className="flex gap-2">
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={loading}
                        className="flex-1"
                    >
                        {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Delete Product"}
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
