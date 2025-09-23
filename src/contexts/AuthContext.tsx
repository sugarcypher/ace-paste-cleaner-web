import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { subscriptionManager } from '../utils/subscriptionManager';

interface User {
  id: string;
  email: string;
  tier: string;
  isAdmin?: boolean;
  usage: {
    dailyCleanings: number;
    totalCleanings: number;
    lastResetDate: string;
    currentTier: string;
  };
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'acepaste_auth_user';

// Admin users with unlimited access
const ADMIN_USERS = [
  'b@twl.today'
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user from localStorage on mount
    const loadUser = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const userData = JSON.parse(stored);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simple authentication - in production, this would call an API
    const isAdmin = ADMIN_USERS.includes(email.toLowerCase());
    
    const userData: User = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      tier: isAdmin ? 'admin' : 'free',
      isAdmin,
      usage: {
        dailyCleanings: 0,
        totalCleanings: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        currentTier: isAdmin ? 'admin' : 'free'
      }
    };

    // Check for active subscription
    const activeSubscription = subscriptionManager.getActiveSubscription();
    if (activeSubscription && !isAdmin) {
      userData.tier = activeSubscription.tier;
      userData.usage.currentTier = activeSubscription.tier;
    }

    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const signUp = async (email: string, password: string) => {
    // Simple registration - in production, this would call an API
    const isAdmin = ADMIN_USERS.includes(email.toLowerCase());
    
    const userData: User = {
      id: `user_${Date.now()}`,
      email: email.toLowerCase(),
      tier: isAdmin ? 'admin' : 'free',
      isAdmin,
      usage: {
        dailyCleanings: 0,
        totalCleanings: 0,
        lastResetDate: new Date().toISOString().split('T')[0],
        currentTier: isAdmin ? 'admin' : 'free'
      }
    };

    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
