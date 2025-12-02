import { NextResponse } from "next/server";
import { getAdminDb, getAdminAuth } from "@/utils/firebaseAdmin";

export async function GET() {
    try {
        console.log("🔍 Testing Firebase Admin initialization...");

        // Test 1: Check environment variables
        const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;
        const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
        const hasProjectId = !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        console.log("Environment variables check:");
        console.log("  - FIREBASE_PRIVATE_KEY:", hasPrivateKey ? "✅ Set" : "❌ Missing");
        console.log("  - FIREBASE_CLIENT_EMAIL:", hasClientEmail ? "✅ Set" : "❌ Missing");
        console.log("  - NEXT_PUBLIC_FIREBASE_PROJECT_ID:", hasProjectId ? "✅ Set" : "❌ Missing");

        if (!hasPrivateKey || !hasClientEmail || !hasProjectId) {
            return NextResponse.json({
                success: false,
                error: "Missing required environment variables",
                details: {
                    hasPrivateKey,
                    hasClientEmail,
                    hasProjectId,
                }
            }, { status: 500 });
        }

        // Test 2: Initialize Admin DB
        console.log("Attempting to initialize Admin DB...");
        const adminDb = getAdminDb();

        if (!adminDb) {
            return NextResponse.json({
                success: false,
                error: "Failed to initialize Admin DB"
            }, { status: 500 });
        }

        console.log("✅ Admin DB initialized successfully");

        // Test 3: Try a simple read operation
        console.log("Testing Firestore read operation...");
        const testCollection = await adminDb.collection("users").limit(1).get();
        console.log("✅ Firestore read successful, docs count:", testCollection.size);

        // Test 4: Initialize Admin Auth
        console.log("Attempting to initialize Admin Auth...");
        const adminAuth = getAdminAuth();
        console.log("✅ Admin Auth initialized successfully");

        return NextResponse.json({
            success: true,
            message: "Firebase Admin is working correctly!",
            tests: {
                environmentVariables: "✅ All set",
                adminDbInitialization: "✅ Success",
                firestoreRead: `✅ Success (${testCollection.size} docs)`,
                adminAuthInitialization: "✅ Success"
            },
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        });

    } catch (error: any) {
        console.error("❌ Firebase Admin test failed:");
        console.error("   Error name:", error?.name);
        console.error("   Error message:", error?.message);
        console.error("   Error code:", error?.code);
        console.error("   Error stack:", error?.stack);

        return NextResponse.json({
            success: false,
            error: error.message || "Unknown error",
            errorName: error?.name,
            errorCode: error?.code,
            stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
        }, { status: 500 });
    }
}
