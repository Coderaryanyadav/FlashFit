import { NextResponse } from "next/server";
import { getAdminDb } from "@/utils/firebaseAdmin";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const db = getAdminDb();
        const snapshot = await db.collection('categories').orderBy('name').get();

        const categories = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(categories);
    } catch (error: any) {
        console.error("Categories API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
