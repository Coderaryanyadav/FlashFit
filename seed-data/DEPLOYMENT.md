# FlashFit Deployment Guide

This guide covers how to deploy the various components of the FlashFit platform to production.

## 1. Backend (Firebase)

The backend consists of Cloud Functions, Firestore Rules, and Indexes.

### Prerequisites
- Firebase CLI installed: `npm install -g firebase-tools`
- Logged in: `firebase login`

### Steps
1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```
2.  Deploy everything (Functions, Firestore Rules, Indexes):
    ```bash
    firebase deploy
    ```
3.  **Verify**: Go to Firebase Console -> Functions and ensure all functions have a green checkmark.

## 2. Web Apps (Next.js)

We recommend **Vercel** for deploying the Next.js applications (`web-customer` and `web-admin`).

### Customer Web App (`web-customer`)
1.  Push your code to a Git repository (GitHub/GitLab).
2.  Go to [Vercel Dashboard](https://vercel.com/dashboard) -> "Add New Project".
3.  Import your repository.
4.  **Root Directory**: Select `customer-app/web-customer`.
5.  **Environment Variables**: Add the variables from `.env.local` (e.g., `NEXT_PUBLIC_FIREBASE_API_KEY`, etc.).
6.  Click **Deploy**.

### Admin Dashboard (`web-admin`)
1.  Go to [Vercel Dashboard](https://vercel.com/dashboard) -> "Add New Project".
2.  Import the same repository.
3.  **Root Directory**: Select `admin-dashboard/web-admin`.
4.  **Environment Variables**: Add the variables from `.env.local`.
5.  Click **Deploy**.

## 3. Mobile Apps (Expo)

We use **EAS Build** (Expo Application Services) to build the Android `.apk` or `.aab` files.

### Prerequisites
- EAS CLI installed: `npm install -g eas-cli`
- Expo account logged in: `eas login`

### Customer App (`app-customer`)
1.  Navigate to `customer-app/app-customer`.
2.  Configure EAS:
    ```bash
    eas build:configure
    ```
3.  Build for Android (Preview - APK):
    ```bash
    eas build -p android --profile preview
    ```
4.  Wait for the build to finish. You will get a download link for the APK.

### Driver App (`app-driver`)
1.  Navigate to `driver-app/app-driver`.
2.  Configure EAS:
    ```bash
    eas build:configure
    ```
3.  Build for Android (Preview - APK):
    ```bash
    eas build -p android --profile preview
    ```

## 4. Post-Deployment Checks

1.  **CORS**: If your Web Apps are on a custom domain (e.g., `flashfit.com`), ensure your Cloud Functions allow requests from that origin if you are manually handling CORS. (The Firebase SDK `onCall` handles this automatically).
2.  **Authorized Domains**: Go to Firebase Console -> Authentication -> Settings -> Authorized Domains. Add your Vercel domains (e.g., `flashfit-customer.vercel.app`).
3.  **Google Maps API**: Ensure your API keys are restricted to your production bundle IDs (Android) and domains (Web).

## 5. Production Monitoring

- **Firebase Crashlytics**: Monitor app crashes (requires native config).
- **Google Cloud Logging**: View logs for Cloud Functions.
- **Vercel Analytics**: Enable for Web Apps to track performance.
