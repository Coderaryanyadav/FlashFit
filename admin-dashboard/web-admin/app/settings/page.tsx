"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon, Bell, Shield, Database } from "lucide-react";
import { auth } from "@/utils/firebase";

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-white">Settings</h2>
                <p className="text-muted-foreground mt-1">Manage your admin panel preferences</p>
            </div>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Shield className="h-5 w-5 text-primary" />
                            <CardTitle>Security</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Admin Email</Label>
                            <Input id="email" type="email" value={auth.currentUser?.email || "admin@flashfit.com"} disabled className="bg-muted" />
                            <p className="text-xs text-muted-foreground">Only this email can access the admin panel</p>
                        </div>
                        <Button variant="outline" disabled>Change Password</Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            <CardTitle>Notifications</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-white">New Order Alerts</p>
                                <p className="text-sm text-muted-foreground">Get notified when new orders are placed</p>
                            </div>
                            <Button variant="outline" size="sm">Enabled</Button>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-white">Driver Status Updates</p>
                                <p className="text-sm text-muted-foreground">Receive updates when drivers go online/offline</p>
                            </div>
                            <Button variant="outline" size="sm">Enabled</Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Database className="h-5 w-5 text-primary" />
                            <CardTitle>System</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium text-white">Platform Status</p>
                                <p className="text-sm text-muted-foreground">FlashFit is currently operational</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                </span>
                                <span className="text-sm font-semibold text-green-500">Online</span>
                            </div>
                        </div>
                        <div className="pt-4 border-t border-border">
                            <Button variant="destructive" className="w-full" onClick={() => alert("This is a demo. Data clearing is disabled.")}>
                                Clear All Data (Danger)
                            </Button>
                            <p className="text-xs text-muted-foreground mt-2 text-center">This action cannot be undone</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
