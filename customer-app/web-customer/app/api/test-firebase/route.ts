import { NextResponse } from "next/server";

export async function GET() {
    try {
        const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
        const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
        const hasProjectId = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        const privateKeyLength = process.env.FIREBASE_PRIVATE_KEY?.length || 0;
        const privateKeyStart = process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50) || "NOT SET";

        return NextResponse.json({
            status: "Environment Check",
            hasPrivateKey,
            hasClientEmail,
            hasProjectId,
            privateKeyLength,
            privateKeyStart,
            nodeEnv: process.env.NODE_ENV,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
