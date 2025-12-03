import { NextResponse } from "next/server";
import { getAdminDb } from "@/utils/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pincode = searchParams.get("pincode") || "400059";

        const db = getAdminDb();

        // Fetch all products (limit 100 for safety)
        const snapshot = await db.collection('products').limit(100).get();

        const products = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
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
