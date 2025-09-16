export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  limits: {
    dailyCleanings: number;
    maxTextLength: number;
    advancedFeatures: boolean;
    prioritySupport: boolean;
  };
  stripePriceId?: string;
}

export interface UsageStats {
  dailyCleanings: number;
  totalCleanings: number;
  lastResetDate: string;
  currentTier: string;
}

export interface User {
  id: string;
  email: string;
  tier: string;
  usage: UsageStats;
  subscriptionId?: string;
  customerId?: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: [
      '5 cleanings per day',
      'Up to 10,000 characters',
      'Basic cleaning features',
      'Community support'
    ],
    limits: {
      dailyCleanings: 5,
      maxTextLength: 10000,
      advancedFeatures: false,
      prioritySupport: false
    }
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited cleanings',
      'Up to 100,000 characters',
      'All cleaning features',
      'Priority support',
      'Bulk processing',
      'API access'
    ],
    limits: {
      dailyCleanings: -1, // unlimited
      maxTextLength: 100000,
      advancedFeatures: true,
      prioritySupport: true
    },
    stripePriceId: 'price_pro_monthly' // You'll need to create this in Stripe
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 29.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Pro',
      'Unlimited text length',
      'Custom integrations',
      'Dedicated support',
      'Team management',
      'White-label options'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: -1, // unlimited
      advancedFeatures: true,
      prioritySupport: true
    },
    stripePriceId: 'price_enterprise_monthly'
  }
];
