// Simple authentication hook
// Replaces Auth0 with lightweight JWT-based authentication

import { useState, useEffect } from 'react';
import { simpleAuth, User } from '../utils/simpleAuth';
import { PRICING_TIERS } from '../types/pricing';

export function useSimpleAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [usage, setUsage] = useState(simpleAuth.getUsage());

  // Load user on mount
  useEffect(() => {
    const loadUser = () => {
      const currentUser = simpleAuth.getCurrentUser();
      setUser(currentUser);
      setIsAuthenticated(!!currentUser);
      setUsage(simpleAuth.getUsage());
      setIsLoading(false);
    };

    loadUser();
  }, []);

  // Sign in function
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await simpleAuth.signIn(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        setUsage(result.user.usage);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Sign in failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await simpleAuth.signUp(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        setUsage(result.user.usage);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (error) {
      return { success: false, error: 'Sign up failed' };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = () => {
    simpleAuth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setUsage(null);
  };

  // Record cleaning usage
  const recordCleaning = async (): Promise<boolean> => {
    if (!user || !usage) return false;
    
    const today = new Date().toISOString().split('T')[0];
    const isNewDay = usage.lastResetDate !== today;
    
    const updatedUsage = {
      dailyCleanings: isNewDay ? 1 : usage.dailyCleanings + 1,
      totalCleanings: usage.totalCleanings + 1,
      lastResetDate: today,
      currentTier: user.tier
    };
    
    const success = simpleAuth.updateUsage(updatedUsage);
    if (success) {
      setUsage(updatedUsage);
    }
    
    return success;
  };

  // Check if user can clean (based on tier limits)
  const canClean = (textLength: number): boolean => {
    if (!user) return false;
    
    const tier = PRICING_TIERS.find(t => t.id === user.tier);
    if (!tier) return false;
    
    // Check text length limit
    if (textLength > tier.limits.maxTextLength) {
      return false;
    }
    
    // Check daily cleaning limit
    if (usage && usage.dailyCleanings >= tier.limits.dailyCleanings) {
      return false;
    }
    
    return true;
  };

  // Get remaining cleanings
  const getRemainingCleanings = (): number => {
    if (!user || !usage) return 0;
    
    const tier = PRICING_TIERS.find(t => t.id === user.tier);
    if (!tier) return 0;
    
    return Math.max(0, tier.limits.dailyCleanings - usage.dailyCleanings);
  };

  // Update user tier (for Gumroad webhook integration)
  const updateUserTier = (tier: string, subscriptionId?: string, customerId?: string, expiresAt?: string) => {
    if (!user) return false;
    
    const success = simpleAuth.updateUserTier(user.id, tier, subscriptionId, customerId, expiresAt);
    if (success) {
      const updatedUser = simpleAuth.getCurrentUser();
      if (updatedUser) {
        setUser(updatedUser);
      }
    }
    
    return success;
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    usage,
    signIn,
    signUp,
    signOut,
    recordCleaning,
    canClean,
    getRemainingCleanings,
    updateUserTier
  };
}
