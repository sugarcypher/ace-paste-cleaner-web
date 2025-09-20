// Production Authentication Service
// Requires real email verification to work

interface User {
  id: string;
  email: string;
  tier: 'free' | 'pro' | 'enterprise';
  isVerified: boolean;
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

// In-memory storage for production (in real app, use a database)
const users = new Map<string, any>();
const sessions = new Map<string, any>();
const verificationCodes = new Map<string, { code: string; expires: number; userId: string }>();

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authService = {
  async signup(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Valid email required' };
    }
    
    if (!password || password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }
    
    if (users.has(email)) {
      return { success: false, error: 'Email already registered' };
    }
    
    const userId = crypto.randomUUID();
    const user = {
      id: userId,
      email,
      password: password, // In real app, this would be hashed
      tier: 'free',
      isVerified: false, // Must verify email before using
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
      message: 'Account created. Please verify your email to continue.'
    };
  },
  
  async signin(email: string, password: string): Promise<{ success: boolean; error?: string; token?: string; user?: User }> {
    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Valid email required' };
    }
    
    if (!password) {
      return { success: false, error: 'Password required' };
    }
    
    const user = users.get(email);
    if (!user) {
      return { success: false, error: 'Email not found. Please sign up first.' };
    }
    
    if (user.password !== password) {
      return { success: false, error: 'Invalid password' };
    }

    if (!user.isVerified) {
      return { success: false, error: 'Please verify your email before signing in.' };
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
        tier: user.tier,
        isVerified: user.isVerified
      }
    };
  },
  
  async verifyEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
    if (!email || !isValidEmail(email)) {
      return { success: false, error: 'Valid email required' };
    }
    
    if (!code) {
      return { success: false, error: 'Verification code required' };
    }
    
    const stored = verificationCodes.get(email);
    if (!stored) {
      return { success: false, error: 'No verification code found for this email' };
    }
    
    if (stored.expires < Date.now()) {
      verificationCodes.delete(email);
      return { success: false, error: 'Verification code has expired' };
    }
    
    if (stored.code !== code) {
      return { success: false, error: 'Invalid verification code' };
    }
    
    // Mark user as verified
    const user = users.get(email);
    if (user) {
      user.isVerified = true;
      users.set(email, user);
    }
    
    verificationCodes.delete(email);
    return { success: true, message: 'Email verified successfully!' };
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
    
    if (!user.isVerified) {
      return { success: false, error: 'Email not verified' };
    }
    
    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        tier: user.tier,
        isVerified: user.isVerified
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
    
    if (!user.isVerified) {
      return { success: false, error: 'Email not verified' };
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
    
    if (!user.isVerified) {
      return { success: false, error: 'Email not verified' };
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
  },

  // Store verification code for email verification
  storeVerificationCode(email: string, code: string, userId: string): void {
    const expires = Date.now() + (10 * 60 * 1000); // 10 minutes
    verificationCodes.set(email, { code, expires, userId });
    
    // Clean up expired codes
    for (const [key, value] of verificationCodes.entries()) {
      if (value.expires < Date.now()) {
        verificationCodes.delete(key);
      }
    }
  }
};


