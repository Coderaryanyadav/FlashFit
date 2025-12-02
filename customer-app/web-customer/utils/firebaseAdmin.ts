import * as admin from 'firebase-admin';

function initializeFirebaseAdmin() {
    if (admin.apps.length > 0) {
        return admin.app();
    }

    try {
        const privateKey = process.env.FIREBASE_PRIVATE_KEY;
        const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
        const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

        // Validate all required environment variables
        if (!privateKey) {
            console.error("❌ FIREBASE_PRIVATE_KEY is not set");
            throw new Error("Missing FIREBASE_PRIVATE_KEY environment variable");
        }

        if (!clientEmail) {
            console.error("❌ FIREBASE_CLIENT_EMAIL is not set");
            throw new Error("Missing FIREBASE_CLIENT_EMAIL environment variable");
        }

        if (!projectId) {
            console.error("❌ NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set");
            throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID environment variable");
        }

        // Handle multiple private key formats
        let formattedKey = privateKey;

        // Check if it's escaped newlines (\\n)
        if (privateKey.includes('\\n')) {
            formattedKey = privateKey.replace(/\\n/g, '\n');
        }

        // Check if it needs to be decoded from base64
        if (!formattedKey.includes('BEGIN PRIVATE KEY')) {
            try {
                formattedKey = Buffer.from(privateKey, 'base64').toString('utf-8');
            } catch (e) {
                // Not base64, continue with current format
            }
        }

        // Validate the key format
        if (!formattedKey.includes('BEGIN PRIVATE KEY')) {
            console.error("❌ Private key doesn't appear to be in correct format");
            console.error("Key preview:", formattedKey.substring(0, 50) + "...");
            throw new Error("Invalid private key format - must contain BEGIN PRIVATE KEY");
        }

        const credential = admin.credential.cert({
            projectId: projectId,
            clientEmail: clientEmail,
            privateKey: formattedKey,
        });

        const app = admin.initializeApp({
            credential: credential,
        });

        console.log("✅ Firebase Admin initialized successfully");
        console.log("   Project ID:", projectId);
        console.log("   Client Email:", clientEmail);
        return app;
    } catch (error: any) {
        console.error("❌ Firebase Admin initialization failed:");
        console.error("   Error name:", error.name);
        console.error("   Error message:", error.message);
        if (error.code) {
            console.error("   Error code:", error.code);
        }
        console.error("   Stack:", error.stack);
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
