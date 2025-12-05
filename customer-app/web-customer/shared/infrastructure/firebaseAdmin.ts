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

        // 1. Handle escaped newlines (common in Vercel/Env vars)
        if (formattedKey.includes('\\n')) {
            formattedKey = formattedKey.replace(/\\n/g, '\n');
        }

        // 2. Check if it's Base64 encoded (only if it doesn't look like a PEM key yet)
        if (!formattedKey.includes('BEGIN PRIVATE KEY')) {
            try {
                const decoded = Buffer.from(formattedKey, 'base64').toString('utf-8');
                if (decoded.includes('BEGIN PRIVATE KEY')) {
                    formattedKey = decoded;
                }
            } catch (e) {
                // Not base64 or failed to decode, keep original
                console.warn("Failed to decode potential base64 key, using raw value.");
            }
        }

        // 3. Final Validation
        if (!formattedKey.includes('BEGIN PRIVATE KEY')) {
            // Attempt to wrap it if it's just the body (rare edge case)
            if (!formattedKey.includes('-----')) {
                formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;
            } else {
                console.error("❌ Private key missing PEM headers");
                throw new Error("Invalid private key format - missing BEGIN PRIVATE KEY");
            }
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
