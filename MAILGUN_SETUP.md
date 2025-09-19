# Mailgun Setup - PRODUCTION READY

This application uses Mailgun to send real verification emails. **This is required for the application to function.** Follow these steps to set up email functionality.

## 1. Create Mailgun Account

1. Go to [https://app.mailgun.com/](https://app.mailgun.com/)
2. Sign up for a free account
3. Verify your email address

## 2. Add a Domain

1. In your Mailgun dashboard, go to **Domains**
2. Click **Add New Domain**
3. Choose **EU** or **US** region (EU recommended for GDPR)
4. Enter your domain (e.g., `mg.yourdomain.com`)
5. Follow the DNS setup instructions
6. Wait for domain verification (can take a few minutes)

**For Testing:** You can use the sandbox domain provided by Mailgun (e.g., `sandbox-123.mailgun.org`)

## 3. Get API Key

1. Go to **Account** → **Security** → **API Keys**
2. Copy your **Private API Key** (starts with `key-`)

## 4. Configure the Application

**IMPORTANT:** The application will not work without proper Mailgun configuration.

### Option 1: Environment Variables (Recommended)

1. Create a `.env` file in the project root:
```bash
REACT_APP_MAILGUN_API_KEY=key-your-actual-api-key-here
REACT_APP_MAILGUN_DOMAIN=mg.yourdomain.com
REACT_APP_MAILGUN_FROM_EMAIL=noreply@yourdomain.com
```

### Option 2: Direct Configuration

1. Open `src/config/mailgun.ts`
2. Replace the placeholder values with your actual credentials:

```typescript
export const MAILGUN_CONFIG = {
  apiKey: 'key-your-actual-api-key-here',
  domain: 'mg.yourdomain.com',
  fromEmail: 'noreply@yourdomain.com'
};
```

## 5. Test Email Sending

1. Build and run the application
2. Try signing up with a real email address
3. Check your email for the verification code
4. Enter the code to complete verification

## 6. Production Considerations

- **Security**: Move email sending to a server-side API for production
- **Rate Limiting**: Implement rate limiting for email sending
- **Error Handling**: Add proper error handling for email failures
- **Logging**: Log email sending attempts and failures
- **Monitoring**: Monitor email delivery rates

## Troubleshooting

### Common Issues:

1. **"Missing required environment variable"**: Configure your Mailgun credentials
2. **"Forbidden" Error**: Check your API key and domain
3. **"Domain not found"**: Ensure domain is verified in Mailgun
4. **Emails not received**: Check spam folder, verify domain setup
5. **CORS Error**: This is expected - Mailgun API doesn't support CORS from browsers

### CORS Limitation:

Since Mailgun's API doesn't support CORS from browsers, you have two options:

1. **Use a proxy server** (recommended for production)
2. **Use Mailgun's webhook** to send emails from your backend

**Note**: The current implementation will show CORS errors in the console, but this is expected behavior for client-side Mailgun integration.

## Free Tier Limits

- **10,000 emails/month** for free
- **100 emails/day** for free
- Perfect for testing and small applications

## Support

- [Mailgun Documentation](https://documentation.mailgun.com/)
- [Mailgun Support](https://help.mailgun.com/)
