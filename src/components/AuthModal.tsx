import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { EmailVerification } from './EmailVerification';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const { signUp, signIn } = useAuth();

  if (!isOpen) return null;

  if (showVerification) {
    return (
      <EmailVerification
        email={email}
        onVerified={() => {
          setShowVerification(false);
          setSuccessMessage('Email verified! You can now sign in.');
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setTimeout(() => {
            setSuccessMessage('');
          }, 3000);
        }}
        onResend={() => {
          // In real app, this would resend verification email
          console.log('Resending verification email to:', email);
        }}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const result = isSignUp 
        ? await signUp(email.trim(), password.trim())
        : await signIn(email.trim(), password.trim());

      if (result.success) {
        if (isSignUp) {
          // For signup, show email verification
          setShowVerification(true);
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

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
              required
              disabled={isLoading}
              minLength={6}
            />
          </div>

          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                required
                disabled={isLoading}
                minLength={6}
              />
            </div>
          )}

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
              setEmail('');
              setPassword('');
              setConfirmPassword('');
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

        <div className="mt-4 p-3 rounded-xl bg-yellow-500/20 border border-yellow-500/30">
          <div className="flex items-start gap-2">
            <div className="text-yellow-400 text-lg">⚠️</div>
            <div className="text-xs text-yellow-300">
              <div className="font-medium mb-1">Demo Mode</div>
              <div className="opacity-90">
                This is a demo version. No real emails are sent. 
                Use verification code <span className="font-mono bg-yellow-500/30 px-1 rounded">123456</span> or skip verification.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
