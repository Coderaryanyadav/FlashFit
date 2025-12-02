import { NextResponse } from "next/server";

export async function GET() {
    const envVars = Object.keys(process.env);
    const hasKey = !!process.env.FIREBASE_PRIVATE_KEY;
    const keyLength = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.length : 0;
    const keyStart = process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.substring(0, 20) : "N/A";

    return NextResponse.json({
        message: "Debug Environment Variables",
        nodeEnv: process.env.NODE_ENV,
        hasPrivateKey: hasKey,
        keyLength: keyLength,
        keyStart: keyStart, // Show first 20 chars to verify format
        allKeys: envVars.sort(), // List all keys to see what IS available
    });
}
