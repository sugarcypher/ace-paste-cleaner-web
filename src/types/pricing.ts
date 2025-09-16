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
    id: 'daily',
    name: 'Daily',
    price: 1.23,
    currency: 'USD',
    interval: 'day',
    features: [
      'Unlimited cleanings',
      'Up to 50,000 characters',
      'All cleaning features',
      'Priority support',
      'Advanced detection'
    ],
    limits: {
      dailyCleanings: -1, // unlimited
      maxTextLength: 50000,
      advancedFeatures: true,
      prioritySupport: true
    },
    stripePriceId: 'price_daily'
  },
  {
    id: 'weekly',
    name: 'Weekly',
    price: 2.34,
    currency: 'USD',
    interval: 'week',
    features: [
      'Unlimited cleanings',
      'Up to 100,000 characters',
      'All cleaning features',
      'Priority support',
      'Advanced detection',
      'Bulk processing'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: 100000,
      advancedFeatures: true,
      prioritySupport: true
    },
    stripePriceId: 'price_weekly'
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 3.45,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited cleanings',
      'Unlimited text length',
      'All cleaning features',
      'Priority support',
      'Advanced detection',
      'Bulk processing',
      'API access'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: -1, // unlimited
      advancedFeatures: true,
      prioritySupport: true
    },
    stripePriceId: 'price_monthly'
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 45.67,
    currency: 'USD',
    interval: 'year',
    features: [
      'Everything in Monthly',
      '2 months free',
      'Priority support',
      'Custom integrations',
      'Team management'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: -1,
      advancedFeatures: true,
      prioritySupport: true
    },
    stripePriceId: 'price_yearly'
  },
  {
    id: 'two_years',
    name: '2 Years',
    price: 56.78,
    currency: 'USD',
    interval: 'year',
    features: [
      'Everything in Yearly',
      '4 months free',
      'Priority support',
      'Custom integrations',
      'Team management',
      'White-label options'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: -1,
      advancedFeatures: true,
      prioritySupport: true
    },
    stripePriceId: 'price_two_years'
  },
  {
    id: 'three_years',
    name: '3 Years',
    price: 67.89,
    currency: 'USD',
    interval: 'year',
    features: [
      'Everything in 2 Years',
      '6 months free',
      'Priority support',
      'Custom integrations',
      'Team management',
      'White-label options',
      'Dedicated support'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: -1,
      advancedFeatures: true,
      prioritySupport: true
    },
    stripePriceId: 'price_three_years'
  },
  {
    id: 'four_years',
    name: '4 Years',
    price: 78.90,
    currency: 'USD',
    interval: 'year',
    features: [
      'Everything in 3 Years',
      '8 months free',
      'Priority support',
      'Custom integrations',
      'Team management',
      'White-label options',
      'Dedicated support',
      'Custom branding'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: -1,
      advancedFeatures: true,
      prioritySupport: true
    },
    stripePriceId: 'price_four_years'
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: 99.99,
    currency: 'USD',
    interval: 'lifetime',
    features: [
      'Everything forever',
      'Unlimited everything',
      'Priority support',
      'Custom integrations',
      'Team management',
      'White-label options',
      'Dedicated support',
      'Custom branding',
      'Future updates included'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: -1,
      advancedFeatures: true,
      prioritySupport: true
    },
    stripePriceId: 'price_lifetime'
  }
];
