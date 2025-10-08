# LinkedIn OAuth Setup Guide

## 🔧 **Fixing "Dangerous Site" Warning**

The "Dangerous site" warning occurs when Chrome detects that the OAuth redirect URI is not properly configured in your LinkedIn Developer Portal or there are security misconfigurations.

---

## 📋 **Step 1: Configure LinkedIn Developer Portal**

### 1.1 Access LinkedIn Developer Portal
1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Sign in with your LinkedIn account
3. Navigate to **My Apps** → Select your app or create a new one

### 1.2 Configure OAuth 2.0 Redirect URLs
In your LinkedIn app settings, add these **EXACT** redirect URIs:

```
https://www.atomconnect.in/api/auth/callback/linkedin
https://atomconnect.in/api/auth/callback/linkedin
```

**Important:**
- Use HTTPS (not HTTP)
- No trailing slashes
- Exact match with your NEXTAUTH_URL
- Both www and non-www versions

### 1.3 Verify App Settings
Ensure these settings are configured:

| Setting | Value |
|---------|-------|
| **App Name** | Atom Connect |
| **App Logo** | Your company logo |
| **Description** | Training platform connecting trainers with organizations |
| **Website URL** | `https://www.atomconnect.in` |
| **Privacy Policy URL** | `https://www.atomconnect.in/privacy` |
| **Terms of Service URL** | `https://www.atomconnect.in/terms` |

### 1.4 OAuth 2.0 Settings
- **Default Scopes**: `openid profile email`
- **Authorization Flow**: Authorization Code Grant
- **Token Endpoint Authentication**: POST

---

## 🔐 **Step 2: Environment Variables**

Your `.env` file should contain:

```env
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
NEXT_PUBLIC_LINKEDIN_CLIENT_ID=your_linkedin_client_id
NEXTAUTH_URL=https://www.atomconnect.in
AUTH_SECRET=your_auth_secret
```

---

## 🌐 **Step 3: Domain Configuration**

### 3.1 DNS Settings
Ensure your domain has proper DNS records:

```bash
# Check A records
dig www.atomconnect.in

# Check CNAME records
dig atomconnect.in

# Check MX records (for email)
dig atomconnect.in MX
```

### 3.2 SSL Certificate
Your SSL certificate is properly configured:
- ✅ Valid Let's Encrypt certificate
- ✅ Covers both www and non-www domains
- ✅ HSTS enabled
- ✅ Proper chain of trust

---

## 🛡️ **Step 4: Security Headers**

Add these security headers to your Next.js configuration:

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              "font-src 'self' data:",
              "connect-src 'self' https://api.linkedin.com https://www.linkedin.com",
              "frame-src 'self' https://www.linkedin.com",
              "form-action 'self'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
            ].join(' '),
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};
```

---

## 🔧 **Step 5: Next.js Configuration**

Update your `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
        port: '',
        pathname: '/dms/**',
      },
      {
        protocol: 'https',
        hostname: 'www.linkedin.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## 🧪 **Step 6: Testing the OAuth Flow**

### 6.1 Test in Different Browsers
- ✅ Chrome (Incognito mode)
- ✅ Firefox
- ✅ Safari
- ✅ Edge

### 6.2 Test OAuth Flow
1. Clear browser cache and cookies
2. Open your site in an incognito/private window
3. Click "Continue with LinkedIn"
4. Verify you're redirected to LinkedIn
5. Complete the authorization
6. Verify you're redirected back to your site

### 6.3 Debug Steps
If you still see the warning:

1. **Check Browser Console**:
   ```javascript
   // Look for these errors:
   // - "Unsafe redirect"
   // - "Blocked by Content Security Policy"
   // - "Mixed content"
   ```

2. **Check Network Tab**:
   - Look for failed requests to LinkedIn
   - Check redirect URLs
   - Verify HTTPS is used everywhere

3. **Check LinkedIn App Dashboard**:
   - Verify redirect URIs are exact matches
   - Check app status (should be "Live")
   - Verify scopes are correct

---

## 🚨 **Common Issues and Solutions**

### Issue 1: Redirect URI Mismatch
**Problem**: `redirect_uri_mismatch` error
**Solution**: Ensure redirect URI in LinkedIn portal exactly matches `https://www.atomconnect.in/api/auth/callback/linkedin`

### Issue 2: Mixed Content
**Problem**: Some resources loaded over HTTP
**Solution**: Ensure all resources use HTTPS

### Issue 3: Invalid Client ID/Secret
**Problem**: Authentication fails
**Solution**: Verify credentials in `.env` file

### Issue 4: App Not Approved
**Problem**: LinkedIn app not in "Live" status
**Solution**: Submit app for LinkedIn review

---

## 📞 **LinkedIn App Review Process**

If your app is not approved:

1. **Complete App Setup**:
   - Add all required information
   - Upload app icon and screenshots
   - Provide privacy policy and terms URLs

2. **Submit for Review**:
   - Go to **Products** → **Sign In with LinkedIn**
   - Click "Request Access"
   - Fill out the review form
   - Wait for approval (usually 1-7 days)

3. **Test in Development**:
   - Use development mode while waiting
   - Test with your own LinkedIn account

---

## 🔍 **Final Verification**

After making these changes, verify:

1. ✅ LinkedIn app is configured with correct redirect URIs
2. ✅ Environment variables are set correctly
3. ✅ SSL certificate is valid and trusted
4. ✅ Security headers are properly configured
5. ✅ OAuth flow works in multiple browsers
6. ✅ No console errors during authentication

---

## 📞 **Support**

If you still encounter issues:

1. **LinkedIn Developer Support**: https://developer.linkedin.com/support
2. **NextAuth.js Documentation**: https://next-auth.js.org/
3. **Chrome Security Guidelines**: https://developers.google.com/web/fundamentals/security/

---

**Remember**: The "Dangerous site" warning is a security feature. Proper configuration will resolve this issue and provide a smooth user experience.