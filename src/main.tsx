import React from 'react'
import ReactDOM from 'react-dom/client'
import { Auth0Provider } from '@auth0/auth0-react'
import App from './App.tsx'
import './index.css'
import { AUTH0_CONFIG } from './config/auth0'
import { AuthWrapper } from './components/AuthWrapper'

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
)





