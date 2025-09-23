// Auth0-based authentication hook
// Replaces the custom useAuth hook with Auth0's built-in functionality

import { useAuth0 } from '@auth0/auth0-react';
import { UsageStats, User, PRICING_TIERS } from '../types/pricing';

const STORAGE_KEY = 'acepaste_user_data';
const USAGE_KEY = 'acepaste_usage';

export function useAuth() {
  const { 
    user: auth0User, 
    isAuthenticated, 
    isLoading, 
    loginWithRedirect, 
    logout 
  } = useAuth0();

  // Admin users with unlimited access
  const ADMIN_USERS = [
    'b@twl.today'
  ];

  // Convert Auth0 user to our User type
  const user: User | null = auth0User ? {
    id: auth0User.sub || '',
    email: auth0User.email || '',
    tier: ADMIN_USERS.includes(auth0User.email?.toLowerCase() || '') ? 'admin' : 'free',
    createdAt: new Date().toISOString(),
    isVerified: true, // Auth0 handles verification, we'll trust it
    usage: getStoredUsage() || {
      dailyCleanings: 0,
      totalCleanings: 0,
      lastResetDate: new Date().toISOString().split('T')[0],
      currentTier: ADMIN_USERS.includes(auth0User.email?.toLowerCase() || '') ? 'admin' : 'free'
    }
  } : null;

  // Get usage from localStorage
  function getStoredUsage(): UsageStats | null {
    try {
      const stored = localStorage.getItem(USAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  // Store usage in localStorage
  function storeUsage(usage: UsageStats) {
    try {
      localStorage.setItem(USAGE_KEY, JSON.stringify(usage));
    } catch (error) {
      console.error('Failed to store usage:', error);
    }
  }

  // Get current usage
  const usage = user ? getStoredUsage() || user.usage : null;

  // Reset daily usage if it's a new day
  if (usage && usage.lastResetDate !== new Date().toISOString().split('T')[0]) {
    const updatedUsage = {
      ...usage,
      dailyCleanings: 0,
      lastResetDate: new Date().toISOString().split('T')[0]
    };
    storeUsage(updatedUsage);
  }

  // Check if user can clean text
  const canClean = (textLength: number): boolean => {
    if (!user || !usage) return false;

    // Admin has unlimited access
    if (user.tier === 'admin') {
      return true;
    }

    const currentTier = PRICING_TIERS.find(tier => tier.id === user.tier) || PRICING_TIERS[0];
    
    // Check daily limit
    if (currentTier.limits.dailyCleanings !== -1 && usage.dailyCleanings >= currentTier.limits.dailyCleanings) {
      return false;
    }

    // Check text length limit
    if (currentTier.limits.maxTextLength !== -1 && textLength > currentTier.limits.maxTextLength) {
      return false;
    }

    return true;
  };

  // Record a cleaning usage
  const recordCleaning = async (): Promise<boolean> => {
    if (!user || !usage) return false;

    // Admin has unlimited access - always allow
    if (user.tier === 'admin') {
      const updatedUsage = {
        ...usage,
        dailyCleanings: usage.dailyCleanings + 1,
        totalCleanings: usage.totalCleanings + 1
      };
      
      storeUsage(updatedUsage);

      const updatedUser = {
        ...user,
        usage: updatedUsage
      };
      
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Failed to store user data:', error);
      }

      return true;
    }

    const currentTier = PRICING_TIERS.find(tier => tier.id === user.tier) || PRICING_TIERS[0];
    
    // Check daily limit
    if (currentTier.limits.dailyCleanings !== -1 && usage.dailyCleanings >= currentTier.limits.dailyCleanings) {
      return false;
    }

    // Update usage
    const updatedUsage = {
      ...usage,
      dailyCleanings: usage.dailyCleanings + 1,
      totalCleanings: usage.totalCleanings + 1
    };
    
    storeUsage(updatedUsage);

    // Update user data
    const updatedUser = {
      ...user,
      usage: updatedUsage
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to store user data:', error);
    }

    return true;
  };

  // Get remaining cleanings
  const getRemainingCleanings = (): number => {
    if (!user || !usage) return 0;

    // Admin has unlimited access
    if (user.tier === 'admin') {
      return -1; // unlimited
    }

    const currentTier = PRICING_TIERS.find(tier => tier.id === user.tier) || PRICING_TIERS[0];
    
    if (currentTier.limits.dailyCleanings === -1) return -1; // unlimited
    
    return Math.max(0, currentTier.limits.dailyCleanings - usage.dailyCleanings);
  };

  // Upgrade user tier
  const upgradeUser = (newTier: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      tier: newTier as 'free' | 'pro' | 'enterprise',
      usage: {
        ...user.usage,
        currentTier: newTier
      }
    };
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
      storeUsage(updatedUser.usage);
    } catch (error) {
      console.error('Failed to upgrade user:', error);
    }
  };

  // Auth0 login function
  const signIn = () => {
    loginWithRedirect();
  };

  // Auth0 logout function
  const signOut = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return {
    user,
    usage,
    isAuthenticated,
    isLoading,
    signIn,
    signOut,
    recordCleaning,
    canClean,
    getRemainingCleanings,
    upgradeUser
  };
}
