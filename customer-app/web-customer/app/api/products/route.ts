import { NextResponse } from "next/server";
import { getAdminDb } from "@/shared/infrastructure/firebaseAdmin";
import { handleApiError } from "@/lib/api-error-handler";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const pincode = searchParams.get("pincode") || "400059";

        const db = getAdminDb();

        // Strict Timeout for Firestore (8 seconds)
        let timeoutId: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error("Firestore Operation Timed Out")), 8000);
        });

        try {
            // Fetch all products (limit 100 for safety)
            const snapshot: any = await Promise.race([
                db.collection('products').limit(100).get(),
                timeoutPromise
            ]);

            clearTimeout(timeoutId); // Clear timeout on success

            const products = snapshot.docs
                .map((doc: any) => ({ id: doc.id, ...doc.data() }))
                .filter((p: any) => {
                    // Robust filtering for pincode (string or number)
                    if (!p.pincodes) return false;
                    return Array.isArray(p.pincodes) && p.pincodes.some((pin: any) => String(pin) === pincode);
                });

            return NextResponse.json(products);
        } catch (raceError: any) {
            clearTimeout(timeoutId!); // Clear timeout on error
            throw raceError; // Re-throw to outer catch
        }
    } catch (error: any) {
        return handleApiError(error);
    }
}
