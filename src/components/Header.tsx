import { useState } from 'react';
import { User, LogOut, Settings, Crown } from 'lucide-react';
import { useSimpleAuth } from '../hooks/useSimpleAuth';

interface HeaderProps {
  onShowAuthModal: () => void;
}

export function Header({ onShowAuthModal }: HeaderProps) {
  // Get auth data from simple authentication
  const { user, signOut, isAuthenticated } = useSimpleAuth();

  const handleSignOut = () => {
    signOut();
  };

  const handleSignIn = () => {
    onShowAuthModal();
  };

  return (
    <>
      <header className="bg-neutral-900 border-b border-neutral-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <img 
                  src="/30E5FAEC-6A70-4961-BAAF-946AC6BFFEE1.jpeg" 
                  alt="ACE PASTE CLEANER Pro Logo" 
                  className="w-full h-full object-contain rounded-lg"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ACE PASTE CLEANER Pro</h1>
                <p className="text-xs text-neutral-400">Clean text, every time</p>
              </div>
            </div>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  {/* User Info */}
                  <div className="flex items-center gap-2 px-3 py-2 bg-neutral-800 rounded-lg">
                    {user?.isAdmin ? (
                      <Crown className="w-4 h-4 text-yellow-400" />
                    ) : (
                      <User className="w-4 h-4 text-neutral-400" />
                    )}
                    <div className="text-sm">
                      <div className="text-white font-medium">{user?.email}</div>
                      <div className="text-xs text-neutral-400 capitalize">
                        {user?.tier === 'admin' ? 'Admin' : user?.tier}
                      </div>
                    </div>
                  </div>

                  {/* Sign Out Button */}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm">Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  {/* Get Started for Free Button */}
                  <button
                    onClick={handleSignIn}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-400 transition-colors font-medium text-sm"
                  >
                    Get Started for Free
                  </button>

                  {/* Sign In Button */}
                  <button
                    onClick={handleSignIn}
                    className="flex items-center gap-2 px-3 py-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm">Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

    </>
  );
}
