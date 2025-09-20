import React from 'react';
import { useAuth } from '../hooks/useAuth0';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const { signIn, isLoading } = useAuth();

  if (!isOpen) return null;

  const handleLogin = () => {
    signIn();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-2xl border border-neutral-700 w-full max-w-md">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="text-4xl mb-4">🔐</div>
            <h2 className="text-2xl font-bold text-white mb-2">Welcome to Ace Paste Cleaner</h2>
            <p className="text-neutral-400 text-sm">
              Sign in to start cleaning your text with our powerful tools
            </p>
          </div>

          {/* Auth0 Login Button */}
          <div className="space-y-4">
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full px-6 py-4 rounded-xl bg-emerald-500 text-white font-semibold hover:bg-emerald-400 active:translate-y-[1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                  Continue with Auth0
                </>
              )}
            </button>

            {/* Features */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Secure authentication with email verification</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>No passwords to remember</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-neutral-400">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span>Free tier includes 10 cleanings per day</span>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}