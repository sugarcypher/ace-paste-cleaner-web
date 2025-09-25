// Simple JWT-based authentication system
// No external dependencies, lightweight, and integrates with Gumroad subscriptions

interface User {
  id: string;
  email: string;
  tier: string;
  subscriptionId?: string;
  customerId?: string;
  expiresAt?: string;
  usage: {
    dailyCleanings: number;
    totalCleanings: number;
    lastResetDate: string;
    currentTier: string;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Simple JWT-like token (base64 encoded JSON)
function createToken(user: User): string {
  const payload = {
    id: user.id,
    email: user.email,
    tier: user.tier,
    subscriptionId: user.subscriptionId,
    customerId: user.customerId,
    expiresAt: user.expiresAt,
    iat: Date.now()
  };
  
  return btoa(JSON.stringify(payload));
}

function parseToken(token: string): any {
  try {
    return JSON.parse(atob(token));
  } catch {
    return null;
  }
}

function isTokenValid(token: string): boolean {
  const payload = parseToken(token);
  if (!payload) return false;
  
  // Check if token is expired
  if (payload.expiresAt && new Date(payload.expiresAt) < new Date()) {
    return false;
  }
  
  return true;
}

// Storage keys
const STORAGE_KEYS = {
  AUTH_TOKEN: 'acepaste_auth_token',
  USER_DATA: 'acepaste_user_data',
  USAGE_DATA: 'acepaste_usage_data'
};

// Simple authentication functions
export const simpleAuth = {
  // Sign up with email
  signUp: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // Simple validation
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Invalid email address' };
      }
      
      if (!password || password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }
      
      // Create user
      const user: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        tier: 'free',
        usage: {
          dailyCleanings: 0,
          totalCleanings: 0,
          lastResetDate: new Date().toISOString().split('T')[0],
          currentTier: 'free'
        }
      };
      
      // Create token
      const token = createToken(user);
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.USAGE_DATA, JSON.stringify(user.usage));
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Failed to create account' };
    }
  },

  // Sign in with email
  signIn: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    try {
      // For demo purposes, accept any email/password combination
      // In production, you'd validate against a backend
      
      const user: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        email,
        tier: 'free',
        usage: {
          dailyCleanings: 0,
          totalCleanings: 0,
          lastResetDate: new Date().toISOString().split('T')[0],
          currentTier: 'free'
        }
      };
      
      // Create token
      const token = createToken(user);
      
      // Store in localStorage
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
      localStorage.setItem(STORAGE_KEYS.USAGE_DATA, JSON.stringify(user.usage));
      
      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Failed to sign in' };
    }
  },

  // Sign out
  signOut: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.USAGE_DATA);
  },

  // Get current user
  getCurrentUser: (): User | null => {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token || !isTokenValid(token)) {
        return null;
      }
      
      const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (!userData) {
        return null;
      }
      
      return JSON.parse(userData);
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return simpleAuth.getCurrentUser() !== null;
  },

  // Update user tier (for Gumroad webhook integration)
  updateUserTier: (userId: string, tier: string, subscriptionId?: string, customerId?: string, expiresAt?: string): boolean => {
    try {
      const user = simpleAuth.getCurrentUser();
      if (!user || user.id !== userId) {
        return false;
      }
      
      const updatedUser: User = {
        ...user,
        tier,
        subscriptionId,
        customerId,
        expiresAt
      };
      
      // Update stored data
      const token = createToken(updatedUser);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      
      return true;
    } catch {
      return false;
    }
  },

  // Update usage data
  updateUsage: (usage: User['usage']): boolean => {
    try {
      const user = simpleAuth.getCurrentUser();
      if (!user) return false;
      
      const updatedUser: User = {
        ...user,
        usage
      };
      
      localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
      localStorage.setItem(STORAGE_KEYS.USAGE_DATA, JSON.stringify(usage));
      
      return true;
    } catch {
      return false;
    }
  },

  // Get usage data
  getUsage: (): User['usage'] | null => {
    try {
      const usageData = localStorage.getItem(STORAGE_KEYS.USAGE_DATA);
      return usageData ? JSON.parse(usageData) : null;
    } catch {
      return null;
    }
  }
};

export type { User, AuthState };
