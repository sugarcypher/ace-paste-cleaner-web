import React, { useState, useEffect } from 'react';

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
  onResend: () => void;
}

export function EmailVerification({ email, onVerified, onResend }: EmailVerificationProps) {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(60);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode.trim()) {
      setError('Please enter the verification code');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simulate verification (in real app, this would call an API)
    setTimeout(() => {
      if (verificationCode === '123456') { // Mock verification code
        onVerified();
      } else {
        setError('Invalid verification code. Please try again.');
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleResend = () => {
    setTimeLeft(60);
    setError('');
    onResend();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800">
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-semibold text-white mb-2">Verify Your Email</h2>
          <p className="text-neutral-400 text-sm">
            We've sent a verification code to <span className="text-emerald-400 font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Verification Code
            </label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 text-center text-lg tracking-widest"
              maxLength={6}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Demo: Use code <span className="text-emerald-400 font-mono">123456</span>
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
              <div className="flex items-start gap-2">
                <div className="text-red-400 text-lg">⚠️</div>
                <div className="flex-1">
                  <div className="font-medium">Error</div>
                  <div className="text-sm opacity-90">{error}</div>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !verificationCode.trim()}
            className="w-full py-3 px-4 rounded-xl bg-emerald-500 text-white font-medium hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isLoading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-neutral-400 text-sm mb-2">
            Didn't receive the code?
          </p>
          <button
            onClick={handleResend}
            disabled={timeLeft > 0}
            className="text-emerald-400 hover:text-emerald-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {timeLeft > 0 ? `Resend in ${timeLeft}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
