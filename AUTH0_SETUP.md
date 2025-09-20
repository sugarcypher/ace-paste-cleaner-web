# Auth0 Setup Guide

## 🚀 Quick Setup (5 minutes)

### 1. Create Auth0 Account
1. Go to [https://manage.auth0.com/](https://manage.auth0.com/)
2. Sign up for a free account
3. Choose your region (US, EU, or AU)

### 2. Create Application
1. In Auth0 Dashboard, go to **Applications**
2. Click **Create Application**
3. Name: `Ace Paste Cleaner`
4. Type: **Single Page Application**
5. Click **Create**

### 3. Configure Application
1. Go to your new application's **Settings** tab
2. Copy the **Domain** and **Client ID**
3. Update `src/config/auth0.ts` with your values:

```typescript
export const AUTH0_CONFIG = {
  domain: 'your-domain.us.auth0.com', // Replace with your domain
  clientId: 'your-client-id-here',    // Replace with your client ID
  // ... rest stays the same
};
```

### 4. Set Allowed URLs
In your Auth0 application settings, add these URLs:

**Allowed Callback URLs:**
```
http://localhost:5173,https://yourdomain.com
```

**Allowed Logout URLs:**
```
http://localhost:5173,https://yourdomain.com
```

**Allowed Web Origins:**
```
http://localhost:5173,https://yourdomain.com
```

### 5. Enable Email Verification
1. Go to **Authentication** > **Database** > **Username-Password-Authentication**
2. Click **Settings** (gear icon)
3. Enable **Requires Email Verification**
4. Save changes

### 6. Deploy and Test
1. Commit your changes: `git add . && git commit -m "feat: implement Auth0 authentication"`
2. Push to GitHub: `git push origin main`
3. Test the login flow on your deployed site

## ✅ What You Get

- **🔐 Secure Authentication**: Enterprise-grade security
- **📧 Email Verification**: Built-in email verification
- **🔑 Password Management**: Secure password handling
- **👤 User Management**: Built-in user dashboard
- **🆓 Free Tier**: 7,000 users included
- **🎨 Customizable**: Brand your login experience

## 🎯 Benefits Over Custom Auth

- **No Email Service Needed**: Auth0 handles all emails
- **No Password Security**: Auth0 manages passwords securely
- **No User Database**: Auth0 stores user data
- **No Verification Logic**: Auth0 handles email verification
- **Enterprise Features**: MFA, SSO, social logins available

## 🔧 Troubleshooting

### Login Not Working
- Check your domain and client ID are correct
- Verify your allowed URLs include your domain
- Check browser console for errors

### Email Verification Not Working
- Ensure "Requires Email Verification" is enabled
- Check your Auth0 email settings
- Verify your domain is configured in Auth0

### Build Errors
- Make sure you've installed dependencies: `bun install`
- Check that all imports are correct
- Verify TypeScript types are properly imported

## 📞 Support

- Auth0 Documentation: [https://auth0.com/docs](https://auth0.com/docs)
- Auth0 Community: [https://community.auth0.com/](https://community.auth0.com/)
- Free tier includes email support
