#!/usr/bin/env node

/**
 * This script formats the Firebase private key for Vercel deployment
 * Run this and copy the output to Vercel's FIREBASE_PRIVATE_KEY environment variable
 */

const fs = require('fs');
const path = require('path');

// Read the service account file
const serviceAccountPath = path.join(__dirname, '../../seed-data/service-account.json');

try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    const privateKey = serviceAccount.private_key;

    console.log('\n='.repeat(80));
    console.log('VERCEL ENVIRONMENT VARIABLE FORMAT');
    console.log('='.repeat(80));
    console.log('\n📋 Copy the value below EXACTLY as shown (including quotes):\n');
    console.log('Variable Name: FIREBASE_PRIVATE_KEY');
    console.log('Variable Value:\n');

    // For Vercel, we need to keep the actual newlines in the string
    // Vercel will handle them correctly when you paste the multi-line value
    console.log(privateKey);

    console.log('\n' + '='.repeat(80));
    console.log('IMPORTANT INSTRUCTIONS FOR VERCEL:');
    console.log('='.repeat(80));
    console.log(`
1. Go to your Vercel project settings
2. Navigate to Environment Variables
3. Edit the FIREBASE_PRIVATE_KEY variable
4. PASTE THE ENTIRE KEY INCLUDING:
   - The opening quote "
   - -----BEGIN PRIVATE KEY-----
   - All the key content (with actual line breaks)
   - -----END PRIVATE KEY-----
   - The closing quote "

5. Make sure it's set for: Production, Preview, and Development
6. Click Save
7. Redeploy your application

NOTE: The key should look like this in Vercel:
"-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASC...
...more lines...
-----END PRIVATE KEY-----"

DO NOT escape the newlines manually - Vercel handles multi-line values correctly.
`);
    console.log('='.repeat(80) + '\n');

} catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\nMake sure the service account file exists at:');
    console.error(serviceAccountPath);
}
