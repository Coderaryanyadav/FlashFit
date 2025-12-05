# 🚀 VERCEL DEPLOYMENT - COMPLETE SETUP GUIDE

## ✅ Build Status: ALL PASSING

```
✓ Types package built
✓ Customer app built  
✓ Driver app built
✓ Admin app built
✓ Seller app built
✓ Backend functions built

Total: 6/6 successful
```

---

## 🎯 CRITICAL: Vercel Project Settings

### Step 1: Configure Build Settings

Go to your Vercel project → **Settings** → **General**

Set these EXACT values:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `customer-app/web-customer` |
| **Build Command** | *(leave default or use `npm run build`)* |
| **Output Directory** | *(leave default `.next`)* |
| **Install Command** | *(leave default `npm install`)* |
| **Node Version** | `24.x` |

**IMPORTANT:** The `vercel.json` file in `customer-app/web-customer` will handle the monorepo build automatically.

---

## 🔐 Step 2: Environment Variables

Go to **Settings** → **Environment Variables**

Add these for **Production**, **Preview**, AND **Development**:

### Firebase Admin (Server-Side)

```
FIREBASE_PRIVATE_KEY
```
**Value:**
```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDviK/b2jFvP8TH\n/Gg+NgRC8LW9tcqNjjA+F1g9clnynxOS2N3FDWw+RemAEsNgqX/6IZ/0EMzNTtQ4\nbYpAXO0y5Os3LaPFP4prUrj0khFYKvQuaddpJbSROKUxQtKCwJxSePU5imTvSKl+\nxaZAVrpF3qqQUxDwUpUx1aCh3oWpA/CcI/1Gp9UZE49JIy/7jqrkrXO71wlMZpEx\nME3MB6zBmvCWuG5KX9xDpX5XQ7+5+KnDWlBnGxZaNsq0euIClXpB/d06WTshclh8\nGNFK3c9yMVGat89qkP7FBYdwTonSJSj7vs469HXIrkNKD0RlZwyDcux+lKkzlAf2\nxuu0auG9AgMBAAECggEAAnXrxI48r5EcxDg6ELaa37w7wS3ZMty7olYN7Dvv/TVt\nd3sUxXdXMzgqtBAjrkSffF3hdd4Wcl7xPCigcep8EF8lLSl/wxZl6bggl6vqugdw\nQ9jcS+4wMcVPoR1rDIUjrW0Tq9HRGUoskKJSjEFAWzZjdZAnjWy4BQkz3Yf0XIwh\nsPVVjYASps6P+XQUFB8xSWHs34Y8ZW7o9JEvgbK+o0mY/7RMai3jBdqpiCt3pxqW\nLhpT2mDCs7x/zFwasX3JTes0CYNuWX2IGbPb5rh/4jlqh9CI6yOwMI5GIDHgon41\nIEeNeydHRMoKM2Y4WZ6e5fA1kVmoLaY2zeBIQ+3hWwKBgQD9yUPBVbx4x2LfVjeg\n/Fzr45MAcPNiAlqX2nWk7vIzhVZEmhd8f/oUmB97rrRwIJKsFo3euBwniz40exYD\nOvVae8e3vRnQLC3fkXWbZv3ktUEw86u77r3NhtBy6gYehO5BFFTQ4yfCvBRXXuqo\nkGntQ9yZ2SKTt+98NYqf7HObRwKBgQDxn5hjHpqC73CVYDKna/iDu2xpfQqYrIFG\nLyrIAzqv0KfItT5GHTqlR4juU/dTyv50J1ONdyTaD3lxIH/CZtvDJ641pMspqQVa\nhW3ie5IQg3tK4xo/PETqWMnOAwsMKRY/V5JjPHZI1MOTblxizdaiL4MknOSoCxpd\nz6b+CkCU2wKBgH51G13q6s8ECzBeNbnyBhtEeqttnNjpc1rXcGeO6QDjH+lvHuTa\noDJC2u02UJLOqEc3tdmUw/KwX36nFoDlj/xWUV4sy///A5yzTnbxCvI7nxBVWu16\nOPmAg72+/u2WL2IeT2UGy3ktXrVqhmMYErA3cGT43VHeBWdPBpRJrhFhAoGBAII/\nheXomWH7sLTVJnkZut1IKyiyPwQN+aHbyzQGiZw83jVTfj5Ng0+VQDs5CBojUwdK\nK8AWeccSkGRrIHOq/sw0l7RTITFT647gXlu4QQSl29CCm6N62at6MU7cVRg5DcUX\nb9IOxbR8/PB8jVC1pP3InukdqiTr10q6pUpMPIQBAoGBAMKDEkqJrlMSNoXsJdNI\n38OJi7QEPyiCQXkwu9rDxPTgFCzZ86C0PN/lz2mQsrpzc9/iZg/qBvxnqpzF0Jva\nAZ0al33MxvaSw0VHbnlkB1qVAP09kIHVgiidKp+pjk1n2Li5GYe/LNMJqEhMtlvp\n5RG4leDKLSi0lFRrCOuNlXG6\n-----END PRIVATE KEY-----
```

**⚠️ CRITICAL:** Copy the ENTIRE value above exactly as shown (single line with `\n` characters)

---

```
FIREBASE_CLIENT_EMAIL
```
**Value:**
```
firebase-adminsdk-fbsvc@studio-847805730-4f392.iam.gserviceaccount.com
```

---

### Firebase Client (Public)

```
NEXT_PUBLIC_FIREBASE_API_KEY
```
**Value:** `AIzaSyCcO8q6G08EPk047pncwT0UdJLiDB3WJ6I`

---

```
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
```
**Value:** `studio-847805730-4f392.firebaseapp.com`

---

```
NEXT_PUBLIC_FIREBASE_PROJECT_ID
```
**Value:** `studio-847805730-4f392`

---

```
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
```
**Value:** `studio-847805730-4f392.firebasestorage.app`

---

```
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
```
**Value:** `497323679456`

---

```
NEXT_PUBLIC_FIREBASE_APP_ID
```
**Value:** `1:497323679456:web:fef3f0e6e3af943969ba85`

---

## 🔄 Step 3: Redeploy

After adding ALL environment variables:

1. Go to **Deployments** tab
2. Find the latest deployment
3. Click the **•••** (three dots) menu
4. Click **"Redeploy"**
5. **UNCHECK** "Use existing Build Cache"
6. Click **"Redeploy"**

---

## ✅ Step 4: Verify Deployment

Once deployed, check:

- [ ] Homepage loads
- [ ] No 500 errors
- [ ] Products visible
- [ ] Categories work
- [ ] Search works
- [ ] Cart works
- [ ] Login/signup works

---

## 🐛 Troubleshooting

### Build Fails with "Cannot find module '@flashfit/types'"
**Status:** ✅ FIXED (commit a6f85ec)
- Added `@flashfit/types` dependency
- Added `vercel.json` for monorepo support

### Products Not Loading / API Errors
**Cause:** Missing or incorrect `FIREBASE_PRIVATE_KEY`
**Fix:** 
1. Copy the EXACT value from Step 2 above
2. Paste into Vercel (don't modify it)
3. Redeploy

### Build Succeeds but App Shows Errors
**Cause:** Environment variables not applied
**Fix:** You MUST redeploy after adding env vars

### Node Version Warning
**Status:** ✅ FIXED (commit a6f85ec)
- Set node engine to `18.x`

---

## 📋 Checklist

Before deploying, ensure:

- [ ] Root Directory set to `customer-app/web-customer`
- [ ] All 8 environment variables added
- [ ] Variables added to Production, Preview, AND Development
- [ ] `FIREBASE_PRIVATE_KEY` is single line with `\n`
- [ ] Build cache cleared before redeploying

---

## 🎉 What's Been Fixed

| Issue | Status |
|-------|--------|
| Build error (`@flashfit/types`) | ✅ FIXED |
| Debug components removed | ✅ DONE |
| Node version warnings | ✅ FIXED |
| Monorepo build config | ✅ ADDED |
| vercel.json created | ✅ ADDED |
| All local builds passing | ✅ VERIFIED |

---

## 📦 Recent Commits

1. `71b713f` - Fixed @flashfit/types dependency
2. `e6a3ed3` - Removed all debug/test code (869 lines)
3. `885bf20` - Added deployment guides
4. `a6f85ec` - Added vercel.json + fixed node versions

---

**Your app is 100% ready for deployment. Just follow Steps 1-3 above!** 🚀
