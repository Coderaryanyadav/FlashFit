"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/utils/firebase";

export function SystemStatus() {
    const [status, setStatus] = useState<any>({
        api: "checking...",
        firestore: "checking...",
        products: 0,
        error: null
    });
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const checkSystem = async () => {
            const result: any = { ...status };

            // 1. Check API
            try {
                const res = await fetch('/api/products?pincode=400059');
                if (res.ok) {
                    const data = await res.json();
                    result.api = "✅ Online";
                    result.products = data.length;
                } else {
                    result.api = `❌ Failed (${res.status})`;
                }
            } catch (e: any) {
                result.api = `❌ Error: ${e.message}`;
            }

            // 2. Check Firestore Client
            try {
                const q = query(collection(db, "products"), limit(1));
                await getDocs(q);
                result.firestore = "✅ Connected";
            } catch (e: any) {
                result.firestore = `❌ Blocked: ${e.message}`;
            }

            setStatus(result);
        };

        checkSystem();
    }, []);

    if (!visible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 bg-zinc-900 border border-zinc-700 p-4 rounded-lg shadow-2xl max-w-sm">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-white">System Status</h3>
                <button onClick={() => setVisible(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-400">Server API:</span>
                    <span className={status.api.includes("✅") ? "text-green-400" : "text-red-400"}>{status.api}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Client DB:</span>
                    <span className={status.firestore.includes("✅") ? "text-green-400" : "text-red-400"}>{status.firestore}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Products Found:</span>
                    <span className="text-white font-mono">{status.products}</span>
                </div>
            </div>

            {status.api.includes("❌") && (
                <div className="mt-3 text-xs text-red-300 bg-red-900/20 p-2 rounded">
                    <strong>Fix:</strong> Check Vercel Env Vars (FIREBASE_PRIVATE_KEY).
                </div>
            )}
        </div>
    );
}
