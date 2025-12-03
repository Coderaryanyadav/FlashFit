"use client";

import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/utils/firebase";

export default function DebugPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Fetch ALL products without filter
                const snapshot = await getDocs(collection(db, "products"));
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProducts(data);
            } catch (err: any) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    return (
        <div className="p-8 bg-black text-white min-h-screen">
            <h1 className="text-3xl font-bold mb-4">Debug Console</h1>

            {loading && <p>Loading raw data...</p>}

            {error && (
                <div className="p-4 bg-red-900 border border-red-500 rounded mb-4">
                    <h2 className="font-bold">Error Fetching Data:</h2>
                    <pre>{error}</pre>
                    <p className="mt-2 text-sm">If this says "Missing or insufficient permissions", check Firestore Rules.</p>
                </div>
            )}

            {!loading && !error && (
                <div>
                    <h2 className="text-xl font-bold mb-2">Total Products: {products.length}</h2>
                    <div className="grid gap-4">
                        {products.map(p => (
                            <div key={p.id} className="p-4 border border-zinc-700 rounded">
                                <h3 className="font-bold">{p.title}</h3>
                                <p className="text-sm text-gray-400">ID: {p.id}</p>
                                <div className="mt-2">
                                    <span className="font-bold">Pincodes: </span>
                                    {p.pincodes ? (
                                        <span className="bg-green-900 px-2 py-1 rounded text-xs">
                                            {JSON.stringify(p.pincodes)}
                                        </span>
                                    ) : (
                                        <span className="bg-red-900 px-2 py-1 rounded text-xs">MISSING</span>
                                    )}
                                </div>
                                <div className="mt-1">
                                    <span className="font-bold">Price: </span> {p.price}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
