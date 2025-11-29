"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/utils/firebase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Mail, Phone, Calendar, Edit } from "lucide-react";
import { EditCustomerModal } from "@/components/EditCustomerModal";

interface Customer {
    id: string;
    email: string;
    displayName?: string;
    phoneNumber?: string;
    createdAt?: any;
    totalOrders?: number;
}

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const fetchCustomers = () => {
        const q = query(collection(db, "users"), where("role", "==", "customer"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const customersData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Customer[];
            setCustomers(customersData);
            setLoading(false);
        });

        return unsubscribe;
    };

    useEffect(() => {
        const unsubscribe = fetchCustomers();
        return () => unsubscribe();
    }, []);

    const handleEdit = (customer: Customer) => {
        setSelectedCustomer(customer);
        setIsEditModalOpen(true);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-white">Customers</h2>
                    <p className="text-muted-foreground mt-1">View and manage your customer base</p>
                </div>
                <div className="bg-card border border-border rounded-xl px-6 py-3">
                    <p className="text-sm text-muted-foreground">Total Customers</p>
                    <p className="text-3xl font-bold text-white">{customers.length}</p>
                </div>
            </div>

            {customers.length === 0 ? (
                <Card className="border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <Users className="h-16 w-16 text-muted-foreground mb-4" />
                        <p className="text-lg font-semibold text-white mb-2">No customers yet</p>
                        <p className="text-sm text-muted-foreground">Customers will appear here after registration</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {customers.map((customer) => (
                        <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-black font-bold text-xl shadow-lg">
                                            {customer.displayName?.charAt(0).toUpperCase() || customer.email?.charAt(0).toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{customer.displayName || "Anonymous User"}</h3>
                                            <div className="flex items-center gap-4 mt-1">
                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Mail className="h-4 w-4" />
                                                    <span>{customer.email}</span>
                                                </div>
                                                {customer.phoneNumber && (
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Phone className="h-4 w-4" />
                                                        <span>{customer.phoneNumber}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        {customer.createdAt && (
                                            <div className="text-right">
                                                <p className="text-xs text-muted-foreground">Joined</p>
                                                <div className="flex items-center gap-2 text-sm text-white font-semibold">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(customer.createdAt.toDate ? customer.createdAt.toDate() : customer.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                        )}
                                        <div className="text-right">
                                            <p className="text-xs text-muted-foreground">Total Orders</p>
                                            <p className="text-2xl font-bold text-primary">{customer.totalOrders || 0}</p>
                                        </div>
                                        <Button
                                            onClick={() => handleEdit(customer)}
                                            variant="outline"
                                            size="sm"
                                            className="border-white/10 hover:bg-white/10"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <EditCustomerModal
                customer={selectedCustomer}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={fetchCustomers}
            />
        </div>
    );
}
