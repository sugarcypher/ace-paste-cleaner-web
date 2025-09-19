// Mock authentication service for local development
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

// Simple in-memory storage
const users = new Map<string, any>();
const sessions = new Map<string, any>();

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export const mockAuthAPI = {
  async signup(email: string): Promise<{ success: boolean; error?: string }> {
    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Valid email required' };
    }
    
    if (users.has(email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      email,
      tier: 'free',
      createdAt: new Date().toISOString(),
      usage: {
        dailyCleanings: 0,
        totalCleanings: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
      }
    };
    
    users.set(email, user);
    
    return {
      success: true,
      message: 'Account created successfully. You can now use the app!'
    };
  },
  
  async signin(email: string): Promise<{ success: boolean; error?: string; token?: string; user?: User }> {
    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Valid email required' };
    }
    
    const user = users.get(email);
    if (!user) {
      return { success: false, error: 'Email not found. Please sign up first.' };
    }
    
    const token = generateToken();
    sessions.set(token, {
      userId: user.id,
      email: user.email,
      createdAt: new Date().toISOString()
    });
    
    return {
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        tier: user.tier
      }
    };
  },
  
  async verify(token: string): Promise<{ success: boolean; user?: User; error?: string }> {
    if (!token) {
      return { success: false, error: 'Token required' };
    }
    
    const session = sessions.get(token);
    if (!session) {
      return { success: false, error: 'Invalid token' };
    }
    
    const user = Array.from(users.values()).find(u => u.id === session.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        tier: user.tier
      }
    };
  },
  
  async getUsage(token: string): Promise<{ success: boolean; usage?: UsageStats; error?: string }> {
    if (!token) {
      return { success: false, error: 'Token required' };
    }
    
    const session = sessions.get(token);
    if (!session) {
      return { success: false, error: 'Invalid token' };
    }
    
    const user = Array.from(users.values()).find(u => u.id === session.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Reset daily usage if it's a new day
    const today = new Date().toISOString().split('T')[0];
    if (user.usage.lastResetDate !== today) {
      user.usage.dailyCleanings = 0;
      user.usage.lastResetDate = today;
    }
    
    return {
      success: true,
      usage: user.usage
    };
  },
  
  async recordUsage(token: string): Promise<{ success: boolean; usage?: UsageStats; error?: string }> {
    if (!token) {
      return { success: false, error: 'Token required' };
    }
    
    const session = sessions.get(token);
    if (!session) {
      return { success: false, error: 'Invalid token' };
    }
    
    const user = Array.from(users.values()).find(u => u.id === session.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    // Reset daily usage if it's a new day
    const today = new Date().toISOString().split('T')[0];
    if (user.usage.lastResetDate !== today) {
      user.usage.dailyCleanings = 0;
      user.usage.lastResetDate = today;
    }
    
    // Check daily limit
    if (user.tier === 'free' && user.usage.dailyCleanings >= 3) {
      return {
        success: false,
        error: 'Daily limit reached',
        usage: user.usage
      };
    }
    
    // Record usage
    user.usage.dailyCleanings += 1;
    user.usage.totalCleanings += 1;
    
    return {
      success: true,
      usage: user.usage
    };
  }
};
