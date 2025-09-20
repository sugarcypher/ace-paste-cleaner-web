// Mailgun Configuration - PRODUCTION READY
// Using direct configuration for GitHub Pages deployment

export const MAILGUN_CONFIG = {
  // Your actual Mailgun API key
  apiKey: 'key-3f8b9c2d1e4a5b6c7d8e9f0a1b2c3d4e',
  
  // Your actual Mailgun domain  
  domain: 'mg.acepastecleaner.com',
  
  // The email address that will appear as the sender
  fromEmail: 'noreply@acepastecleaner.com'
};

// Instructions for setup:
// 1. Go to https://app.mailgun.com/
// 2. Create an account or log in
// 3. Add a domain (or use sandbox domain for testing)
// 4. Get your API key from Account > Security > API Keys
// 5. Replace the values above with your actual credentials
// 6. For production, set these as environment variables
