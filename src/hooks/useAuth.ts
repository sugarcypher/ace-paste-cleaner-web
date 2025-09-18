import { useState, useEffect, useCallback } from 'react';

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

const API_BASE = '/.netlify/functions/auth';

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
        const response = await fetch(API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify', token })
        });

        const data: AuthResponse = await response.json();
        
        if (data.success && data.user) {
          setUser(data.user);
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
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getUsage', token })
      });

      const data: AuthResponse = await response.json();
      if (data.success && data.usage) {
        setUsage(data.usage);
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error);
    }
  };

  const signUp = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signup', email })
      });

      const data: AuthResponse = await response.json();
      
      if (data.success) {
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Signup failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  const signIn = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'signin', email })
      });

      const data: AuthResponse = await response.json();
      
      if (data.success && data.token && data.user) {
        localStorage.setItem('acepaste_token', data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        await fetchUsage(data.token);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Sign in failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
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
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recordUsage', token })
      });

      const data: AuthResponse = await response.json();
      
      if (data.success && data.usage) {
        setUsage(data.usage);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Failed to record usage' };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
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
