"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/utils/firebase";

interface SystemStatusState {
    api: string;
    firestore: string;
    products: number;
    error: string | null;
}

export function SystemStatus() {
    const [status, setStatus] = useState<SystemStatusState>({
        api: "checking...",
        firestore: "checking...",
        products: 0,
        error: null
    });
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const checkSystem = async () => {
            let newApiStatus = "checking...";
            let newFirestoreStatus = "checking...";
            let newProductCount = 0;
            let errorMsg: string | null = null;

            // 1. Check API
            try {
                const res = await fetch('/api/products?pincode=400059');
                if (res.ok) {
                    const data = await res.json();
                    newApiStatus = "✅ Online";
                    newProductCount = Array.isArray(data) ? data.length : 0;
                } else {
                    newApiStatus = `❌ Failed (${res.status})`;
                    errorMsg = `API Error: ${res.statusText}`;
                }
            } catch (e) {
                const message = e instanceof Error ? e.message : "Unknown error";
                newApiStatus = `❌ Error: ${message}`;
                errorMsg = message;
            }

            // 2. Check Firestore Client
            try {
                const q = query(collection(db, "products"), limit(1));
                await getDocs(q);
                newFirestoreStatus = "✅ Connected";
            } catch (e) {
                const message = e instanceof Error ? e.message : "Unknown error";
                newFirestoreStatus = `❌ Blocked: ${message}`;
                if (!errorMsg) errorMsg = message;
            }

            if (isMounted) {
                setStatus({
                    api: newApiStatus,
                    firestore: newFirestoreStatus,
                    products: newProductCount,
                    error: errorMsg
                });
            }
        };

        checkSystem();

        return () => {
            isMounted = false;
        };
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-zinc-900 border border-zinc-700 p-4 rounded-lg shadow-2xl max-w-sm transition-all animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-white text-sm">System Status</h3>
                <button
                    onClick={() => setVisible(false)}
                    className="text-gray-400 hover:text-white transition-colors p-1 rounded-md hover:bg-white/10"
                    aria-label="Close system status"
                >
                    ✕
                </button>
            </div>

            <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Server API:</span>
                    <span className={`font-medium ${status.api.includes("✅") ? "text-green-400" : "text-red-400"}`}>
                        {status.api}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Client DB:</span>
                    <span className={`font-medium ${status.firestore.includes("✅") ? "text-green-400" : "text-red-400"}`}>
                        {status.firestore}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-400">Products Found:</span>
                    <span className="text-white font-mono">{status.products}</span>
                </div>
            </div>

            {status.api.includes("❌") && (
                <div className="mt-3 text-[10px] text-red-300 bg-red-900/20 p-2 rounded border border-red-500/20">
                    <strong>Fix:</strong> Check Vercel Env Vars (FIREBASE_PRIVATE_KEY).
                </div>
            )}
        </div>
    );
}
