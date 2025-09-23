import { useState, useEffect, useCallback } from 'react';
import { UsageStats, User, PRICING_TIERS } from '../types/pricing';
import { subscriptionManager } from '../utils/subscriptionManager';
import { useAuth } from '../contexts/AuthContext';

const STORAGE_KEY = 'acepaste_user_data';
const USAGE_KEY = 'acepaste_usage';

export function useUsage() {
  const { user: authUser, isAuthenticated } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user data
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUsage = localStorage.getItem(USAGE_KEY);
        
        if (isAuthenticated && authUser) {
          // Use authenticated user
          setUser(authUser);
        } else {
          // Check for active subscription first
          const activeSubscription = subscriptionManager.getActiveSubscription();
          const subscriptionTier = activeSubscription ? activeSubscription.tier : 'free';
          
          // Create anonymous user
          const anonymousUser: User = {
            id: `anon_${Date.now()}`,
            email: '',
            tier: subscriptionTier,
            usage: {
              dailyCleanings: 0,
              totalCleanings: 0,
              lastResetDate: new Date().toISOString().split('T')[0],
              currentTier: subscriptionTier
            }
          };
          setUser(anonymousUser);
        }

        if (storedUsage) {
          const usageData = JSON.parse(storedUsage);
          setUsage(usageData);
        } else {
          // Initialize usage
          const initialUsage: UsageStats = {
            dailyCleanings: 0,
            totalCleanings: 0,
            lastResetDate: new Date().toISOString().split('T')[0],
            currentTier: 'free'
          };
          setUsage(initialUsage);
          localStorage.setItem(USAGE_KEY, JSON.stringify(initialUsage));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        // Fallback to free tier
        const fallbackUser: User = {
          id: `anon_${Date.now()}`,
          email: '',
          tier: 'free',
          usage: {
            dailyCleanings: 0,
            totalCleanings: 0,
            lastResetDate: new Date().toISOString().split('T')[0],
            currentTier: 'free'
          }
        };
        setUser(fallbackUser);
        setUsage(fallbackUser.usage);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, authUser]);

  // Reset daily usage if it's a new day
  useEffect(() => {
    if (usage) {
      const today = new Date().toISOString().split('T')[0];
      if (usage.lastResetDate !== today) {
        const updatedUsage = {
          ...usage,
          dailyCleanings: 0,
          lastResetDate: today
        };
        setUsage(updatedUsage);
        localStorage.setItem(USAGE_KEY, JSON.stringify(updatedUsage));
      }
    }
  }, [usage]);

  const recordCleaning = useCallback((textLength: number) => {
    if (!user || !usage) return false;

    const currentTier = PRICING_TIERS.find(tier => tier.id === user.tier) || PRICING_TIERS[0];
    
    // Check daily limit
    if (currentTier.limits.dailyCleanings !== -1 && usage.dailyCleanings >= currentTier.limits.dailyCleanings) {
      return false;
    }

    // Check text length limit
    if (currentTier.limits.maxTextLength !== -1 && textLength > currentTier.limits.maxTextLength) {
      return false;
    }

    // Update usage
    const updatedUsage = {
      ...usage,
      dailyCleanings: usage.dailyCleanings + 1,
      totalCleanings: usage.totalCleanings + 1
    };
    
    setUsage(updatedUsage);
    localStorage.setItem(USAGE_KEY, JSON.stringify(updatedUsage));

    // Update user data
    const updatedUser = {
      ...user,
      usage: updatedUsage
    };
    setUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

    return true;
  }, [user, usage]);

  const canClean = useCallback((textLength: number) => {
    if (!user || !usage) return false;

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
  }, [user, usage]);

  const getRemainingCleanings = useCallback(() => {
    if (!user || !usage) return 0;

    const currentTier = PRICING_TIERS.find(tier => tier.id === user.tier) || PRICING_TIERS[0];
    
    if (currentTier.limits.dailyCleanings === -1) return -1; // unlimited
    
    return Math.max(0, currentTier.limits.dailyCleanings - usage.dailyCleanings);
  }, [user, usage]);

  const upgradeUser = useCallback((newTier: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      tier: newTier,
      usage: {
        ...user.usage,
        currentTier: newTier
      }
    };
    
    setUser(updatedUser);
    setUsage(updatedUser.usage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
    localStorage.setItem(USAGE_KEY, JSON.stringify(updatedUser.usage));
  }, [user]);

  const handleGumroadWebhook = useCallback((webhookData: any) => {
    try {
      const subscription = subscriptionManager.createFromGumroadWebhook(webhookData);
      subscriptionManager.setSubscription(subscription);
      
      // Update user with new subscription
      if (user) {
        const updatedUser = {
          ...user,
          tier: subscription.tier,
          email: webhookData.email || user.email,
          usage: {
            ...user.usage,
            currentTier: subscription.tier
          }
        };
        
        setUser(updatedUser);
        setUsage(updatedUser.usage);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
        localStorage.setItem(USAGE_KEY, JSON.stringify(updatedUser.usage));
      }
    } catch (error) {
      console.error('Error processing Gumroad webhook:', error);
    }
  }, [user]);

  return {
    user,
    usage,
    isLoading,
    recordCleaning,
    canClean,
    getRemainingCleanings,
    upgradeUser,
    handleGumroadWebhook
  };
}




