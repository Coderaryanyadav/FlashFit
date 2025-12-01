import * as admin from 'firebase-admin';

function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    try {
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

        const app = admin.initializeApp({
            credential: credential,
        });

        console.log("✅ Firebase Admin initialized successfully");
        return app;
    } catch (error: any) {
        console.error("❌ Firebase Admin initialization failed:", error.message);
        console.error("Stack:", error.stack);
        throw error;
    }
}

// Lazy getters that initialize on first access
export function getAdminDb(): admin.firestore.Firestore {
    const app = initializeFirebaseAdmin();
    return app.firestore();
}

export function getAdminAuth(): admin.auth.Auth {
    const app = initializeFirebaseAdmin();
    return app.auth();
}
