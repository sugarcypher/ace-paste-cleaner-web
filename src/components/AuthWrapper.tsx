import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export function AuthWrapper({ children }: AuthWrapperProps) {
  const { isLoading, error, isAuthenticated } = useAuth0();
  const [showTimeout, setShowTimeout] = useState(false);

  // Add timeout for loading state
  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowTimeout(true);
      }, 5000); // 5 second timeout

      return () => clearTimeout(timer);
    } else {
      setShowTimeout(false);
    }
  }, [isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading authentication...</p>
          {showTimeout && (
            <div className="mt-4">
              <p className="text-yellow-400 text-sm mb-2">Taking longer than expected?</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-yellow-500 text-yellow-950 rounded-lg hover:bg-yellow-400 transition-colors text-sm"
              >
                Reload Page
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Auth0 Error:', error);
    return (
      <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Authentication Error</h1>
          <p className="text-gray-300 mb-4">{error.message}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors mr-2"
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                // Allow app to work without Auth0 for debugging
                window.location.href = window.location.origin + '?skipAuth=true';
              }}
              className="px-4 py-2 bg-yellow-500 text-yellow-950 rounded-lg hover:bg-yellow-400 transition-colors"
            >
              Continue Without Auth (Debug)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
