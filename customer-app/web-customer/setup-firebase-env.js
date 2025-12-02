#!/usr/bin/env node

/**
 * This script reads the Firebase service account JSON and outputs the environment variables
 * that need to be added to .env.local
 */

const fs = require('fs');
const path = require('path');

// Path to service account file
const serviceAccountPath = path.join(__dirname, '../../seed-data/service-account.json');

try {
    // Check if service account file exists
    if (!fs.existsSync(serviceAccountPath)) {
        console.error('❌ Service account file not found at:', serviceAccountPath);
        console.error('\nPlease download your Firebase service account key:');
        console.error('1. Go to https://console.firebase.google.com/');
        console.error('2. Select your project');
        console.error('3. Go to Project Settings → Service Accounts');
        console.error('4. Click "Generate New Private Key"');
        console.error('5. Save the file as service-account.json in the seed-data folder');
        process.exit(1);
    }

    // Read and parse the service account file
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

    // Extract the required fields
    const privateKey = serviceAccount.private_key;
    const clientEmail = serviceAccount.client_email;
    const projectId = serviceAccount.project_id;

    if (!privateKey || !clientEmail || !projectId) {
        console.error('❌ Invalid service account file. Missing required fields.');
        process.exit(1);
    }

    // Generate the .env.local content
    console.log('\n✅ Firebase credentials found!\n');
    console.log('📋 Copy the following lines to your .env.local file:\n');
    console.log('# ========================================');
    console.log('# Firebase Admin SDK Credentials');
    console.log('# ========================================');
    console.log(`FIREBASE_PRIVATE_KEY="${privateKey}"`);
    console.log(`FIREBASE_CLIENT_EMAIL="${clientEmail}"`);
    console.log(`NEXT_PUBLIC_FIREBASE_PROJECT_ID="${projectId}"`);
    console.log('# ========================================\n');

    // Also write to a temporary file for easy copying
    const envContent = `# Firebase Admin SDK Credentials
FIREBASE_PRIVATE_KEY="${privateKey}"
FIREBASE_CLIENT_EMAIL="${clientEmail}"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="${projectId}"
`;

    const tempEnvPath = path.join(__dirname, '.env.firebase.tmp');
    fs.writeFileSync(tempEnvPath, envContent);

    console.log(`✅ Also saved to: ${tempEnvPath}`);
    console.log('\nYou can copy the content from this file to your .env.local\n');

} catch (error) {
    console.error('❌ Error reading service account file:', error.message);
    process.exit(1);
}
