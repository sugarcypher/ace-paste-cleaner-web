# Ace Paste Cleaner - Setup Instructions

## Setup Steps

### 1. Create Environment File

Create a `.env` file in the project root with your Mailgun credentials:

```bash
REACT_APP_MAILGUN_API_KEY=your-mailgun-api-key-here
REACT_APP_MAILGUN_DOMAIN=your-mailgun-domain-here
REACT_APP_MAILGUN_FROM_EMAIL=your-from-email-here
```

**Note**: Get your actual credentials from your Mailgun dashboard.

### 2. Test Locally

```bash
bun install
bun run dev
```

### 3. Test Email Verification

1. Open the app in your browser
2. Try signing up with a real email address
3. Check your email for the verification code
4. Enter the code to complete verification

### 4. Deploy to GitHub Pages

The app is already configured for GitHub Pages deployment. Once you push to main, it will automatically deploy.

## Security Notes

- ✅ API keys are not stored in the code
- ✅ Environment variables are used for credentials
- ✅ `.env` file is gitignored
- ✅ No demo mode - fully production ready

## Features

- ✅ Real email verification via Mailgun
- ✅ Users must verify email before accessing app
- ✅ Professional email templates
- ✅ Secure authentication system
- ✅ Production-ready deployment

The application is now ready for production use with real email verification!
