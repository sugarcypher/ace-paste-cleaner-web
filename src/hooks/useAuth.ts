import { useState, useEffect, useCallback } from 'react';
import { mockAuthAPI } from '../utils/mockAuth';

interface User {
  id: string;
  email: string;
  tier: 'free' | 'pro' | 'enterprise';
}

interface UsageStats {
  dailyCleanings: number;
  totalCleanings: number;
  lastResetDate: string;
}

interface AuthResponse {
  success: boolean;
  token?: string;
  user?: User;
  usage?: UsageStats;
  error?: string;
}

// For GitHub Pages deployment, we'll use client-side only authentication
// No server-side API needed

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('acepaste_token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        // Use mock API for GitHub Pages deployment (client-side only)
        const result = await mockAuthAPI.verify(token);
        
        if (result.success && result.user) {
          setUser(result.user);
          setIsAuthenticated(true);
          
          // Get current usage
          await fetchUsage(token);
        } else {
          // Invalid token, clear it
          localStorage.removeItem('acepaste_token');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('acepaste_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const fetchUsage = async (token: string) => {
    try {
      // Use mock API for GitHub Pages deployment (client-side only)
      const result = await mockAuthAPI.getUsage(token);
      if (result.success && result.usage) {
        setUsage(result.usage);
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  };

  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Use mock API for GitHub Pages deployment (client-side only)
      const result = await mockAuthAPI.signup(email, password);
      return result;
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Use mock API for GitHub Pages deployment (client-side only)
      const result = await mockAuthAPI.signin(email, password);
      if (result.success && result.token && result.user) {
        localStorage.setItem('acepaste_token', result.token);
        setUser(result.user);
        setIsAuthenticated(true);
        await fetchUsage(result.token);
      }
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: 'Sign in failed. Please try again.' };
    }
  };

  const signOut = () => {
    localStorage.removeItem('acepaste_token');
    setUser(null);
    setUsage(null);
    setIsAuthenticated(false);
  };

  const recordCleaning = async (): Promise<{ success: boolean; error?: string }> => {
    const token = localStorage.getItem('acepaste_token');
    if (!token) {
      return { success: false, error: 'Not authenticated' };
    }

    try {
      // Use mock API for GitHub Pages deployment (client-side only)
      const result = await mockAuthAPI.recordUsage(token);
      if (result.success && result.usage) {
        setUsage(result.usage);
      }
      return { success: result.success, error: result.error };
    } catch (error) {
      console.error('Record cleaning error:', error);
      return { success: false, error: 'Failed to record usage' };
    }
  };

  const canClean = useCallback((textLength: number) => {
    if (!isAuthenticated || !usage) return false;

    // Check daily limit for free tier
    if (user?.tier === 'free' && usage.dailyCleanings >= 3) {
      return false;
    }

    // Check text length limit (2000 chars for free tier)
    if (user?.tier === 'free' && textLength > 2000) {
      return false;
    }

    return true;
  }, [isAuthenticated, usage, user]);

  const getRemainingCleanings = useCallback(() => {
    if (!isAuthenticated || !usage) return 0;
    
    if (user?.tier === 'free') {
      return Math.max(0, 3 - usage.dailyCleanings);
    }
    
    return -1; // unlimited for paid tiers
  }, [isAuthenticated, usage, user]);

  return {
    user,
    usage,
    isLoading,
    isAuthenticated,
    signUp,
    signIn,
    signOut,
    recordCleaning,
    canClean,
    getRemainingCleanings
  };
}
