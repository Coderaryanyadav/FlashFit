import { NextResponse } from "next/server";
import { getAdminDb } from "@/utils/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = getAdminDb();

        // Strict Timeout (8 seconds)
        let timeoutId: NodeJS.Timeout | undefined;
        const timeoutPromise = new Promise<never>((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error("Firestore Operation Timed Out")), 8000);
        });

        try {
            const snapshot: any = await Promise.race([
                db.collection('categories').orderBy('name').get(),
                timeoutPromise
            ]);

            clearTimeout(timeoutId); // Clear timeout on success

            const categories = snapshot.docs.map((doc: any) => ({
                id: doc.id,
                ...doc.data()
            }));

            return NextResponse.json(categories);
        } catch (raceError: any) {
            clearTimeout(timeoutId!); // Clear timeout on error
            throw raceError; // Re-throw to outer catch
        }
    } catch (error: any) {
        console.error("Categories API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
