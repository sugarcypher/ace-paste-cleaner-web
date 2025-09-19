// Mailgun Configuration - PRODUCTION READY
// These values MUST be set for the application to work

const getRequiredEnvVar = (name: string, fallback?: string): string => {
  const value = process.env[name] || fallback;
  if (!value || value.includes('your-') || value.includes('here')) {
    throw new Error(`Missing required environment variable: ${name}. Please configure your Mailgun credentials.`);
  }
  return value;
};

export const MAILGUN_CONFIG = {
  // Your actual Mailgun API key - set via environment variable
  apiKey: process.env.REACT_APP_MAILGUN_API_KEY || 'YOUR_MAILGUN_API_KEY',
  
  // Your actual Mailgun domain - set via environment variable  
  domain: process.env.REACT_APP_MAILGUN_DOMAIN || 'YOUR_MAILGUN_DOMAIN',
  
  // The email address that will appear as the sender
  fromEmail: process.env.REACT_APP_MAILGUN_FROM_EMAIL || 'YOUR_FROM_EMAIL'
};

// Instructions for setup:
// 1. Go to https://app.mailgun.com/
// 2. Create an account or log in
// 3. Add a domain (or use sandbox domain for testing)
// 4. Get your API key from Account > Security > API Keys
// 5. Replace the values above with your actual credentials
// 6. For production, set these as environment variables
