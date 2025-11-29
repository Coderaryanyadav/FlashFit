"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Plus, MoreHorizontal, Pencil, Trash, Package } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductDialog } from "@/components/ProductDialog";
import { InventoryModal } from "@/components/InventoryModal";

// Type Definition
export type Product = {
    id: string;
    title: string;
    price: number;
    category: string;
    image: string;
    stock: number;
    createdAt: any;
    discount?: number;
    colors?: string[];
};

export default function ProductsPage() {
    const [data, setData] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const handleDelete = async (id: string) => {
        if (confirm("Are you sure you want to delete this product?")) {
            try {
                await deleteDoc(doc(db, "products", id));
            } catch (error) {
                console.error("Error deleting product:", error);
                alert("Failed to delete product");
            }
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setDialogOpen(true);
    };

    const handleAddNew = () => {
        setEditingProduct(undefined);
        setDialogOpen(true);
    };

    const handleManageInventory = (product: Product) => {
        setSelectedProduct(product);
        setInventoryModalOpen(true);
    };

    // Column Definitions
    const columns: ColumnDef<Product>[] = [
        {
            accessorKey: "image",
            header: "Image",
            cell: ({ row }) => {
                return (
                    <div className="h-12 w-12 relative rounded-lg overflow-hidden bg-zinc-800 border border-zinc-700">
                        <img src={row.original.image} alt={row.original.title} className="object-cover h-full w-full" />
                    </div>
                )
            }
        },
        {
            accessorKey: "title",
            header: "Name",
            cell: ({ row }) => <div className="font-medium text-white">{row.getValue("title")}</div>
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => {
                const category = row.getValue("category") as string;
                const formatted = category.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
                return <div className="text-zinc-400">{formatted}</div>;
            }
        },
        {
            accessorKey: "price",
            header: "Price",
            cell: ({ row }) => {
                const amount = parseFloat(row.getValue("price"));
                const formatted = new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                }).format(amount);
                return <div className="font-medium text-white">{formatted}</div>;
            },
        },
        {
            accessorKey: "stock",
            header: "Stock",
            cell: ({ row }) => {
                const stock = row.getValue("stock") as number;
                return (
                    <div className={`font-bold ${stock < 10 ? "text-red-400" : "text-green-400"}`}>
                        {stock}
                    </div>
                );
            }
        },
        {
            accessorKey: "discount",
            header: "Discount",
            cell: ({ row }) => {
                const discount = row.original.discount;
                return discount ? (
                    <div className="font-bold text-yellow-400">{discount}%</div>
                ) : (
                    <div className="text-zinc-500">-</div>
                );
            }
        },
        {
            accessorKey: "colors",
            header: "Colors",
            cell: ({ row }) => {
                const colors = row.original.colors;
                return colors && colors.length > 0 ? (
                    <div className="flex gap-1 flex-wrap max-w-[150px]">
                        {colors.map((c, i) => (
                            <div key={i} className="h-4 w-4 rounded-full border border-white/20" style={{ backgroundColor: c.toLowerCase() }} title={c} />
                        ))}
                    </div>
                ) : (
                    <div className="text-zinc-500">-</div>
                );
            }
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const product = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(product.id)}>
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleManageInventory(product)}>
                                <Package className="mr-2 h-4 w-4" /> Manage Inventory
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(product)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(product.id)}>
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    useEffect(() => {
        // Real-time listener for products
        const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const products = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Product[];
            setData(products);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Products</h2>
                    <p className="text-muted-foreground mt-1">Manage your product inventory</p>
                </div>
                <div className="flex items-center space-x-2">
                    <Button onClick={handleAddNew} className="bg-white text-black hover:bg-gray-200 font-bold transition-all">
                        <Plus className="mr-2 h-4 w-4" /> Add New
                    </Button>
                </div>
            </div>

            <div className="bg-zinc-900 rounded-xl border border-zinc-800 shadow-sm p-6">
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                    </div>
                ) : (
                    <DataTable columns={columns} data={data} searchKey="title" />
                )}
            </div>

            <ProductDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                productToEdit={editingProduct}
            />

            <InventoryModal
                product={selectedProduct}
                isOpen={inventoryModalOpen}
                onClose={() => setInventoryModalOpen(false)}
                onSuccess={() => {
                    // Products will auto-update via real-time listener
                }}
            />
        </div>
    );
}
