# FlashFit Deployment Guide

## 1. Vercel Deployment (Web)

The project is configured for seamless deployment on Vercel.

### Steps:
1.  **Push to GitHub**: Ensure your latest code is pushed to your GitHub repository.
2.  **Import Project**: Go to [Vercel Dashboard](https://vercel.com/dashboard) -> "Add New..." -> "Project" -> Import your repository.
3.  **Configure Build Settings**:
    *   **Framework Preset**: Next.js (Auto-detected)
    *   **Root Directory**:
        *   For Customer App: `customer-app/web-customer`
        *   For Driver App: `driver-app/web-driver`
        *   For Admin Dashboard: `admin-dashboard/web-admin`
    *   **Environment Variables**: Copy the contents of `.env.local` for each app into the Vercel Environment Variables section.

### Important Notes:
*   The `next.config.js` is set to standard mode (Server Side Rendering supported), which is optimal for Vercel.
*   Dynamic routes like `/order/[id]` will work out of the box.

---

## 2. Mobile App Build (APK & IPA)

To build the mobile apps (Android APK & iOS IPA), you need to switch the project to "Static Export" mode because mobile apps run as client-side only applications.

### Prerequisites:
*   **Android Studio** (for APK)
*   **Xcode** (for IPA - Mac only)
*   **Capacitor CLI** (already installed)

### Step-by-Step Mobile Build:

#### A. Prepare for Mobile Build
1.  Open `next.config.js` (or `next.config.mjs` for Driver App).
2.  **Uncomment/Add** the following lines to enable static export:
    ```javascript
    const nextConfig = {
      output: 'export',  // <--- ENABLE THIS
      images: {
        unoptimized: true, // <--- ENABLE THIS
      },
      // ... other config
    }
    ```
3.  **Handle Dynamic Routes**:
    *   For `customer-app`, dynamic routes like `app/order/[id]/page.tsx` might cause build errors in static export mode if `generateStaticParams` is not defined.
    *   **Workaround**: For a purely mobile build, you might need to refactor dynamic pages to use client-side query parameters (e.g., `/order?id=123`) instead of path parameters, OR ensure all possible paths are generated statically.

#### B. Build the Web Assets
Run the build command in the respective app directory:
```bash
npm run build
```
This will create an `out` directory with the static files.

#### C. Sync with Capacitor
Sync the web assets to the native projects:
```bash
npx cap sync
```

#### D. Build Android APK
1.  Open Android Studio:
    ```bash
    npx cap open android
    ```
2.  Wait for Gradle sync to finish.
3.  Go to **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
4.  The APK will be generated in `android/app/build/outputs/apk/debug/`.

#### E. Build iOS IPA (Mac Only)
1.  Open Xcode:
    ```bash
    npx cap open ios
    ```
2.  Select your target device (or "Any iOS Device (arm64)").
3.  Go to **Product** -> **Archive**.
4.  Once archived, the Organizer window will open. Click **Distribute App** to export the IPA or upload to TestFlight.

---

### ⚠️ Switching Back to Web
When you want to deploy to Vercel again, remember to **comment out** or remove `output: 'export'` and `unoptimized: true` from your `next.config.js`.
