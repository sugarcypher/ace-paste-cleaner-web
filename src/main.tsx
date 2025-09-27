import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { SecurityProvider } from './contexts/SecurityContext'
import './index.css'

// Simple authentication - no external dependencies
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SecurityProvider>
      <App />
    </SecurityProvider>
  </React.StrictMode>,
)





