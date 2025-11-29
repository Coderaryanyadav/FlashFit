"use client";

import { useState } from "react";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseConfig } from "@/utils/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Loader2, UserPlus, Mail, Lock, User, Phone } from "lucide-react";
import { toast } from "sonner";

interface CreateDriverFormProps {
    onSuccess?: () => void;
}

export function CreateDriverForm({ onSuccess }: CreateDriverFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        phone: "",
        vehicleNumber: "",
        licenseNumber: ""
    });
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        // Phone validation
        if (name === 'phone') {
            const cleaned = value.replace(/\D/g, '');
            if (cleaned.length <= 10) {
                setFormData(prev => ({ ...prev, [name]: cleaned }));
            }
            return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCreateDriver = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name || formData.name.trim().length < 2) {
            toast.error("Please enter a valid name (minimum 2 characters)");
            return;
        }

        if (!formData.email || !formData.email.includes('@')) {
            toast.error("Please enter a valid email address");
            return;
        }

        if (!formData.password || formData.password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (!formData.phone || formData.phone.length !== 10) {
            toast.error("Please enter a valid 10-digit phone number");
            return;
        }

        if (!formData.vehicleNumber || formData.vehicleNumber.trim().length < 3) {
            toast.error("Please enter a valid vehicle number");
            return;
        }

        if (!formData.licenseNumber || formData.licenseNumber.trim().length < 5) {
            toast.error("Please enter a valid license number");
            return;
        }

        setLoading(true);

        try {
            // Save current admin user
            const currentUser = auth.currentUser;

            // Create a temporary auth instance for driver creation
            const { initializeApp, deleteApp } = await import('firebase/app');
            const { getAuth, createUserWithEmailAndPassword: createUser, updateProfile: updateProf } = await import('firebase/auth');

            // Create a secondary app instance using the shared config
            const secondaryApp = initializeApp(firebaseConfig, "Secondary");

            const secondaryAuth = getAuth(secondaryApp);

            // Create driver account using secondary auth
            const userCredential = await createUser(
                secondaryAuth,
                formData.email,
                formData.password
            );

            // Update display name
            await updateProf(userCredential.user, {
                displayName: formData.name
            });

            // Create driver document in Firestore
            await setDoc(doc(db, "drivers", userCredential.user.uid), {
                uid: userCredential.user.uid,
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                vehicleNumber: formData.vehicleNumber,
                licenseNumber: formData.licenseNumber,
                isOnline: false,
                totalDeliveries: 0,
                createdAt: serverTimestamp()
            });

            // Create user document in Firestore (for Auth)
            await setDoc(doc(db, "users", userCredential.user.uid), {
                uid: userCredential.user.uid,
                email: formData.email,
                displayName: formData.name,
                phone: formData.phone,
                role: "driver",
                createdAt: serverTimestamp(),
                createdBy: currentUser?.email || "admin"
            });

            // Sign out from secondary auth and delete the app
            await secondaryAuth.signOut();
            await deleteApp(secondaryApp);

            toast.success(`Driver account created successfully for ${formData.name}!`);
            toast.info(`Credentials: ${formData.email}`);

            // Reset form
            setFormData({
                name: "",
                email: "",
                password: "",
                phone: "",
                vehicleNumber: "",
                licenseNumber: ""
            });

            if (onSuccess) onSuccess();

        } catch (error: any) {
            console.error("Error creating driver:", error);
            const errorMessage = error.code === "auth/email-already-in-use"
                ? "This email is already registered"
                : error.code === "auth/invalid-email"
                    ? "Invalid email address"
                    : error.code === "auth/weak-password"
                        ? "Password is too weak"
                        : "Failed to create driver account. Please try again.";
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-neutral-900 border-white/10">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                    <UserPlus className="h-5 w-5 text-primary" />
                    Create New Driver Account
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleCreateDriver} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-300 flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Full Name
                            </label>
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                placeholder="John Doe"
                                className="bg-neutral-800 border-white/10 text-white"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-300 flex items-center gap-2">
                                <Mail className="h-4 w-4" />
                                Email Address
                            </label>
                            <Input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="driver@flashfit.com"
                                className="bg-neutral-800 border-white/10 text-white"
                                required
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-300 flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                Password
                            </label>
                            <Input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="••••••••"
                                className="bg-neutral-800 border-white/10 text-white"
                                required
                                minLength={6}
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-300 flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                Phone Number
                            </label>
                            <Input
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="9876543210"
                                className="bg-neutral-800 border-white/10 text-white"
                                required
                            />
                        </div>

                        {/* Vehicle Number */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-300 flex items-center gap-2">
                                <Truck className="h-4 w-4" />
                                Vehicle Number
                            </label>
                            <Input
                                name="vehicleNumber"
                                value={formData.vehicleNumber}
                                onChange={handleInputChange}
                                placeholder="MH 01 AB 1234"
                                className="bg-neutral-800 border-white/10 text-white"
                                required
                            />
                        </div>

                        {/* License Number */}
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-300 flex items-center gap-2">
                                <Lock className="h-4 w-4" />
                                License Number
                            </label>
                            <Input
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={handleInputChange}
                                placeholder="DL1234567890"
                                className="bg-neutral-800 border-white/10 text-white"
                                required
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-11"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                Creating Driver Account...
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Create Driver Account
                            </>
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
