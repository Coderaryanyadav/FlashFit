import { NextResponse } from "next/server";
import { getAdminDb } from "@/utils/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pincode = searchParams.get("pincode") || "400059";

        const db = getAdminDb();

        // Strict Timeout for Firestore (8 seconds)
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firestore Operation Timed Out")), 8000)
        );

        // Fetch all products (limit 100 for safety)
        const snapshot: any = await Promise.race([
            db.collection('products').limit(100).get(),
            timeoutPromise
        ]);

        const products = snapshot.docs
            .map((doc: any) => ({ id: doc.id, ...doc.data() }))
            .filter((p: any) => {
                // Robust filtering for pincode (string or number)
                if (!p.pincodes) return false;
                return Array.isArray(p.pincodes) && p.pincodes.some((pin: any) => String(pin) === pincode);
            });

        return NextResponse.json(products);
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
