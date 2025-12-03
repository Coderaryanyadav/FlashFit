import { NextResponse } from "next/server";
import { getAdminDb } from "@/utils/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = getAdminDb();

        // Strict Timeout (8 seconds)
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Firestore Operation Timed Out")), 8000)
        );

        const snapshot: any = await Promise.race([
            db.collection('categories').orderBy('name').get(),
            timeoutPromise
        ]);

        const categories = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(categories);
    } catch (error: any) {
        console.error("Categories API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
