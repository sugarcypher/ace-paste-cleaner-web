import React, { Suspense, lazy } from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Lazy load Auth0 components to reduce initial bundle size
const Auth0Provider = lazy(() => import('@auth0/auth0-react').then(module => ({ default: module.Auth0Provider })));
const AuthWrapper = lazy(() => import('./components/AuthWrapper').then(module => ({ default: module.AuthWrapper })));
const AUTH0_CONFIG = lazy(() => import('./config/auth0').then(module => ({ default: module.AUTH0_CONFIG })));

// Check if we should skip Auth0 (for debugging)
const skipAuth = new URLSearchParams(window.location.search).get('skipAuth') === 'true';
// Use Auth0 normally, only skip if explicitly requested
const useDebugMode = skipAuth;

if (useDebugMode) {
  // Render app without Auth0 for debugging
  console.warn('Running in debug mode without Auth0');
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
} else {
  // Normal Auth0 flow
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <Auth0Provider
        domain={AUTH0_CONFIG.domain}
        clientId={AUTH0_CONFIG.clientId}
        authorizationParams={AUTH0_CONFIG.authorizationParams}
        onRedirectCallback={(appState) => {
          // Handle redirect after login
          window.location.replace(
            appState?.returnTo || window.location.pathname
          );
        }}
      >
        <AuthWrapper>
          <App />
        </AuthWrapper>
      </Auth0Provider>
    </React.StrictMode>,
  );
}





