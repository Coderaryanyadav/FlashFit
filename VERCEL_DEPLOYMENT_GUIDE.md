# 🚀 Vercel Deployment Guide for FlashFit

## Critical: Environment Variables Setup

### Step 1: Get Your Firebase Private Key

Your Firebase private key is in `.env.local`. You need to format it correctly for Vercel.

**Current Private Key (from .env.local):**
```
-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDviK/b2jFvP8TH
/Gg+NgRC8LW9tcqNjjA+F1g9clnynxOS2N3FDWw+RemAEsNgqX/6IZ/0EMzNTtQ4
bYpAXO0y5Os3LaPFP4prUrj0khFYKvQuaddpJbSROKUxQtKCwJxSePU5imTvSKl+
xaZAVrpF3qqQUxDwUpUx1aCh3oWpA/CcI/1Gp9UZE49JIy/7jqrkrXO71wlMZpEx
ME3MB6zBmvCWuG5KX9xDpX5XQ7+5+KnDWlBnGxZaNsq0euIClXpB/d06WTshclh8
GNFK3c9yMVGat89qkP7FBYdwTonSJSj7vs469HXIrkNKD0RlZwyDcux+lKkzlAf2
xuu0auG9AgMBAAECggEAAnXrxI48r5EcxDg6ELaa37w7wS3ZMty7olYN7Dvv/TVt
d3sUxXdXMzgqtBAjrkSffF3hdd4Wcl7xPCigcep8EF8lLSl/wxZl6bggl6vqugdw
Q9jcS+4wMcVPoR1rDIUjrW0Tq9HRGUoskKJSjEFAWzZjdZAnjWy4BQkz3Yf0XIwh
sPVVjYASps6P+XQUFB8xSWHs34Y8ZW7o9JEvgbK+o0mY/7RMai3jBdqpiCt3pxqW
LhpT2mDCs7x/zFwasX3JTes0CYNuWX2IGbPb5rh/4jlqh9CI6yOwMI5GIDHgon41
IEeNeydHRMoKM2Y4WZ6e5fA1kVmoLaY2zeBIQ+3hWwKBgQD9yUPBVbx4x2LfVjeg
/Fzr45MAcPNiAlqX2nWk7vIzhVZEmhd8f/oUmB97rrRwIJKsFo3euBwniz40exYD
OvVae8e3vRnQLC3fkXWbZv3ktUEw86u77r3NhtBy6gYehO5BFFTQ4yfCvBRXXuqo
kGntQ9yZ2SKTt+98NYqf7HObRwKBgQDxn5hjHpqC73CVYDKna/iDu2xpfQqYrIFG
LyrIAzqv0KfItT5GHTqlR4juU/dTyv50J1ONdyTaD3lxIH/CZtvDJ641pMspqQVa
hW3ie5IQg3tK4xo/PETqWMnOAwsMKRY/V5JjPHZI1MOTblxizdaiL4MknOSoCxpd
z6b+CkCU2wKBgH51G13q6s8ECzBeNbnyBhtEeqttnNjpc1rXcGeO6QDjH+lvHuTa
oDJC2u02UJLOqEc3tdmUw/KwX36nFoDlj/xWUV4sy///A5yzTnbxCvI7nxBVWu16
OPmAg72+/u2WL2IeT2UGy3ktXrVqhmMYErA3cGT43VHeBWdPBpRJrhFhAoGBAII/
heXomWH7sLTVJnkZut1IKyiyPwQN+aHbyzQGiZw83jVTfj5Ng0+VQDs5CBojUwdK
K8AWeccSkGRrIHOq/sw0l7RTITFT647gXlu4QQSl29CCm6N62at6MU7cVRg5DcUX
b9IOxbR8/PB8jVC1pP3InukdqiTr10q6pUpMPIQBAoGBAMKDEkqJrlMSNoXsJdNI
38OJi7QEPyiCQXkwu9rDxPTgFCzZ86C0PN/lz2mQsrpzc9/iZg/qBvxnqpzF0Jva
AZ0al33MxvaSw0VHbnlkB1qVAP09kIHVgiidKp+pjk1n2Li5GYe/LNMJqEhMtlvp
5RG4leDKLSi0lFRrCOuNlXG6
-----END PRIVATE KEY-----
```

### Step 2: Format for Vercel

**OPTION A: Single Line with \\n (RECOMMENDED)**

Copy this EXACT value for Vercel:
```
-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDviK/b2jFvP8TH\n/Gg+NgRC8LW9tcqNjjA+F1g9clnynxOS2N3FDWw+RemAEsNgqX/6IZ/0EMzNTtQ4\nbYpAXO0y5Os3LaPFP4prUrj0khFYKvQuaddpJbSROKUxQtKCwJxSePU5imTvSKl+\nxaZAVrpF3qqQUxDwUpUx1aCh3oWpA/CcI/1Gp9UZE49JIy/7jqrkrXO71wlMZpEx\nME3MB6zBmvCWuG5KX9xDpX5XQ7+5+KnDWlBnGxZaNsq0euIClXpB/d06WTshclh8\nGNFK3c9yMVGat89qkP7FBYdwTonSJSj7vs469HXIrkNKD0RlZwyDcux+lKkzlAf2\nxuu0auG9AgMBAAECggEAAnXrxI48r5EcxDg6ELaa37w7wS3ZMty7olYN7Dvv/TVt\nd3sUxXdXMzgqtBAjrkSffF3hdd4Wcl7xPCigcep8EF8lLSl/wxZl6bggl6vqugdw\nQ9jcS+4wMcVPoR1rDIUjrW0Tq9HRGUoskKJSjEFAWzZjdZAnjWy4BQkz3Yf0XIwh\nsPVVjYASps6P+XQUFB8xSWHs34Y8ZW7o9JEvgbK+o0mY/7RMai3jBdqpiCt3pxqW\nLhpT2mDCs7x/zFwasX3JTes0CYNuWX2IGbPb5rh/4jlqh9CI6yOwMI5GIDHgon41\nIEeNeydHRMoKM2Y4WZ6e5fA1kVmoLaY2zeBIQ+3hWwKBgQD9yUPBVbx4x2LfVjeg\n/Fzr45MAcPNiAlqX2nWk7vIzhVZEmhd8f/oUmB97rrRwIJKsFo3euBwniz40exYD\nOvVae8e3vRnQLC3fkXWbZv3ktUEw86u77r3NhtBy6gYehO5BFFTQ4yfCvBRXXuqo\nkGntQ9yZ2SKTt+98NYqf7HObRwKBgQDxn5hjHpqC73CVYDKna/iDu2xpfQqYrIFG\nLyrIAzqv0KfItT5GHTqlR4juU/dTyv50J1ONdyTaD3lxIH/CZtvDJ641pMspqQVa\nhW3ie5IQg3tK4xo/PETqWMnOAwsMKRY/V5JjPHZI1MOTblxizdaiL4MknOSoCxpd\nz6b+CkCU2wKBgH51G13q6s8ECzBeNbnyBhtEeqttnNjpc1rXcGeO6QDjH+lvHuTa\noDJC2u02UJLOqEc3tdmUw/KwX36nFoDlj/xWUV4sy///A5yzTnbxCvI7nxBVWu16\nOPmAg72+/u2WL2IeT2UGy3ktXrVqhmMYErA3cGT43VHeBWdPBpRJrhFhAoGBAII/\nheXomWH7sLTVJnkZut1IKyiyPwQN+aHbyzQGiZw83jVTfj5Ng0+VQDs5CBojUwdK\nK8AWeccSkGRrIHOq/sw0l7RTITFT647gXlu4QQSl29CCm6N62at6MU7cVRg5DcUX\nb9IOxbR8/PB8jVC1pP3InukdqiTr10q6pUpMPIQBAoGBAMKDEkqJrlMSNoXsJdNI\n38OJi7QEPyiCQXkwu9rDxPTgFCzZ86C0PN/lz2mQsrpzc9/iZg/qBvxnqpzF0Jva\nAZ0al33MxvaSw0VHbnlkB1qVAP09kIHVgiidKp+pjk1n2Li5GYe/LNMJqEhMtlvp\n5RG4leDKLSi0lFRrCOuNlXG6\n-----END PRIVATE KEY-----
```

### Step 3: Add All Environment Variables to Vercel

Go to your Vercel project → Settings → Environment Variables

Add these variables for **Production, Preview, and Development**:

| Variable Name | Value |
|--------------|-------|
| `FIREBASE_PRIVATE_KEY` | *(Use the formatted key from Step 2)* |
| `FIREBASE_CLIENT_EMAIL` | `firebase-adminsdk-fbsvc@studio-847805730-4f392.iam.gserviceaccount.com` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyCcO8q6G08EPk047pncwT0UdJLiDB3WJ6I` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `studio-847805730-4f392.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `studio-847805730-4f392` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `studio-847805730-4f392.firebasestorage.app` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `497323679456` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:497323679456:web:fef3f0e6e3af943969ba85` |

### Step 4: Redeploy

After adding all environment variables:

1. Go to Deployments tab
2. Click the three dots (•••) on the latest deployment
3. Click "Redeploy"
4. Check "Use existing Build Cache" is **UNCHECKED**
5. Click "Redeploy"

---

## Troubleshooting

### Issue: "Cannot find module '@flashfit/types'"
**Status:** ✅ FIXED (commit 71b713f)
- Added `@flashfit/types` dependency to customer-app package.json

### Issue: Products not loading / API errors
**Cause:** Missing or incorrectly formatted `FIREBASE_PRIVATE_KEY` on Vercel
**Solution:** Follow Step 2 above carefully - the key must be on a single line with `\n` characters

### Issue: Build succeeds but app shows errors
**Cause:** Environment variables not applied to the deployment
**Solution:** After adding env vars, you MUST redeploy (don't just wait for auto-deploy)

---

## Verification Checklist

After deployment, verify:

- [ ] Homepage loads without errors
- [ ] Products are visible on the homepage
- [ ] Search functionality works
- [ ] Cart operations work
- [ ] User authentication works
- [ ] API routes return data (check Network tab in DevTools)

---

## Quick Commands

```bash
# Test build locally
npm run build --workspace=customer-app/web-customer

# Check for TypeScript errors
npm run lint --workspace=customer-app/web-customer

# Test all apps
npm run build
```

---

## Notes

- The `@flashfit/types` package is now properly linked as a workspace dependency
- The SystemStatus debug component has been removed from production
- All Firebase Admin SDK calls are properly configured with error handling
- The turbo.json ensures packages are built in the correct order

---

**Last Updated:** 2025-12-04
**Version:** 1.0.1
