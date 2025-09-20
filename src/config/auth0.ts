// Auth0 Configuration
// Get these values from your Auth0 dashboard: https://manage.auth0.com/

export const AUTH0_CONFIG = {
  domain: 'ace-paste-cleaner.us.auth0.com', // Replace with your Auth0 domain
  clientId: 'YOUR_AUTH0_CLIENT_ID', // Replace with your Auth0 client ID
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: 'https://ace-paste-cleaner.us.auth0.com/api/v2/', // Optional: for API access
    scope: 'openid profile email'
  }
};

// Instructions for setup:
// 1. Go to https://manage.auth0.com/
// 2. Create a new application (Single Page Application)
// 3. Copy your Domain and Client ID
// 4. Replace the values above
// 5. In Auth0 Dashboard > Applications > Your App > Settings:
//    - Add your domain to "Allowed Callback URLs": http://localhost:5173, https://yourdomain.com
//    - Add your domain to "Allowed Logout URLs": http://localhost:5173, https://yourdomain.com
//    - Add your domain to "Allowed Web Origins": http://localhost:5173, https://yourdomain.com
// 6. In Auth0 Dashboard > Authentication > Database > Username-Password-Authentication:
//    - Enable "Requires Email Verification" for email verification
