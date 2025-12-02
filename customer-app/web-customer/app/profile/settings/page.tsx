"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell, Lock, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="min-h-screen bg-black text-white pb-20">
            <Header />
            <div className="container mx-auto px-4 pt-24 max-w-2xl">
                <Link href="/profile" className="mb-4 inline-flex items-center text-gray-400 hover:text-white">
                    <ArrowLeft className="h-4 w-4 mr-2" /> Back to Profile
                </Link>
                <h1 className="text-3xl font-black italic mb-8">SETTINGS</h1>

                <div className="space-y-6">
                    {/* Notifications */}
                    <div className="bg-zinc-900 rounded-xl p-6 border border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center">
                                    <Bell className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Push Notifications</h3>
                                    <p className="text-sm text-gray-400">Receive updates about your orders and drops</p>
                                </div>
                            </div>
                            <Switch checked={notifications} onCheckedChange={setNotifications} />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="bg-zinc-900 rounded-xl p-6 border border-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-black flex items-center justify-center">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white">Change Password</h3>
                                    <p className="text-sm text-gray-400">Update your account security</p>
                                </div>
                            </div>
                            <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-800">
                                Update
                            </Button>
                        </div>
                    </div>

                    {/* Delete Account */}
                    <div className="bg-red-900/10 rounded-xl p-6 border border-red-900/20">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-red-900/20 flex items-center justify-center">
                                    <Trash2 className="h-5 w-5 text-red-500" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-red-500">Delete Account</h3>
                                    <p className="text-sm text-red-400/70">Permanently remove your data</p>
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => toast.error("Please contact support to delete your account")}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
