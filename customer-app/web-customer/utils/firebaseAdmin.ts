import * as admin from 'firebase-admin';

// Initialize Firebase Admin with service account
if (!admin.apps.length) {
    try {
        // For Vercel deployment, we'll use individual env vars
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;

        if (!privateKey) {
            console.error("FIREBASE_PRIVATE_KEY is not set");
            throw new Error("Missing Firebase credentials");
        }

        // Handle both escaped and unescaped newlines
        const formattedKey = privateKey.includes('\\n')
            ? privateKey.replace(/\\n/g, '\n')
            : privateKey;

        const credential = admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "studio-847805730-4f392",
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL || "firebase-adminsdk-fbsvc@studio-847805730-4f392.iam.gserviceaccount.com",
            privateKey: formattedKey,
        });

        admin.initializeApp({
            credential: credential,
        });

        console.log("✅ Firebase Admin initialized successfully");
    } catch (error: any) {
        console.error("❌ Firebase Admin initialization failed:", error.message);
        console.error("Stack:", error.stack);
    }
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
