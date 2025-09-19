import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { signUp, signIn } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = isSignUp 
        ? await signUp(email.trim())
        : await signIn(email.trim());

      if (result.success) {
        if (isSignUp) {
          // For signup, show success message and switch to sign in
          setSuccessMessage('Account created successfully! You can now sign in.');
          setIsSignUp(false);
          setEmail('');
          // Clear success message after 3 seconds
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        } else {
          // For signin, proceed normally
          onSuccess();
          onClose();
          setEmail('');
        }
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch (err) {
      console.error('Auth modal error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              required
              disabled={isLoading}
            />
          </div>

          {successMessage && (
            <div className="p-3 rounded-xl bg-green-500/20 border border-green-500/30 text-green-300 text-sm">
              <div className="flex items-start gap-2">
                <div className="text-green-400 text-lg">✅</div>
                <div className="flex-1">
                  <div className="font-medium">Success!</div>
                  <div className="text-sm opacity-90">{successMessage}</div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
              <div className="flex items-start gap-2">
                <div className="text-red-400 text-lg">⚠️</div>
                <div className="flex-1">
                  <div className="font-medium">Error</div>
                  <div className="text-sm opacity-90">{error}</div>
                </div>
                <button
                  onClick={() => {
                    setError('');
                    handleSubmit(new Event('submit') as any);
                  }}
                  className="px-2 py-1 text-xs bg-red-500/30 hover:bg-red-500/50 rounded transition-colors"
                  disabled={isLoading}
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isLoading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-neutral-400 text-sm">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          </p>
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError('');
              setSuccessMessage('');
            }}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium mt-1"
          >
            {isSignUp ? 'Sign in instead' : 'Create account instead'}
          </button>
        </div>

        <div className="mt-6 p-4 rounded-xl bg-blue-500/20 border border-blue-500/30">
          <div className="flex items-start gap-3">
            <div className="text-blue-400 text-lg">ℹ️</div>
            <div className="text-sm text-blue-300">
              <p className="font-medium mb-1">Free Account Benefits:</p>
              <ul className="space-y-1 text-xs">
                <li>• 3 text cleanings per day</li>
                <li>• Up to 2,000 characters per cleaning</li>
                <li>• All cleaning features included</li>
                <li>• No credit card required</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
