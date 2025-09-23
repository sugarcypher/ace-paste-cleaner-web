export interface PricingTier {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'quarter' | 'year' | 'lifetime';
  features: string[];
  limits: {
    dailyCleanings: number;
    maxTextLength: number;
    advancedFeatures: boolean;
    prioritySupport: boolean;
  };
  savings?: string;
  stripePriceId?: string;
}

export interface UpsellFeature {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime';
  features: string[];
  category: 'team' | 'presets' | 'writing' | 'development';
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
      '3 cleanings per day',
      'Up to 2,000 characters',
      'Basic cleaning features',
      'Community support'
    ],
    limits: {
      dailyCleanings: 3,
      maxTextLength: 2000,
      advancedFeatures: false,
      prioritySupport: false
    }
  },
  {
    id: 'admin',
    name: 'Admin',
    price: 0,
    currency: 'USD',
    interval: 'forever',
    features: [
      'Unlimited cleanings',
      'Unlimited character limit',
      'All premium features',
      'Priority support',
      'Admin access'
    ],
    limits: {
      dailyCleanings: -1, // unlimited
      maxTextLength: -1, // unlimited
      advancedFeatures: true,
      prioritySupport: true
    }
  },
  {
    id: 'monthly',
    name: 'Monthly',
    price: 6.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited cleanings',
      'Up to 50,000 characters',
      '20+ hours of processing',
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
    stripePriceId: 'price_monthly'
  },
  {
    id: 'quarterly',
    name: 'Quarterly',
    price: 19.99,
    currency: 'USD',
    interval: 'quarter',
    features: [
      'Everything in Monthly',
      'Up to 200,000 characters',
      '80+ hours of processing',
      '5% savings',
      'Priority support',
      'Advanced detection',
      'Bulk processing'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: 200000,
      advancedFeatures: true,
      prioritySupport: true
    },
    savings: '5% off',
    stripePriceId: 'price_quarterly'
  },
  {
    id: 'six_months',
    name: '6 Months',
    price: 34.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Quarterly',
      'Up to 500,000 characters',
      '200+ hours of processing',
      '17% savings',
      'Priority support',
      'Advanced detection',
      'Bulk processing',
      'API access'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: 500000,
      advancedFeatures: true,
      prioritySupport: true
    },
    savings: '⭐ 17% off',
    stripePriceId: 'price_six_months'
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 49.99,
    currency: 'USD',
    interval: 'year',
    features: [
      'Everything in 6 Months',
      'Up to 1,000,000 characters',
      '400+ hours of processing',
      '40% savings',
      'Priority support',
      'Custom integrations',
      'Team management'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: 1000000,
      advancedFeatures: true,
      prioritySupport: true
    },
    savings: '🔥 40% off',
    stripePriceId: 'price_yearly'
  },
  {
    id: 'two_years',
    name: '2 Years',
    price: 79.99,
    currency: 'USD',
    interval: 'year',
    features: [
      'Everything in Yearly',
      'Up to 2,000,000 characters',
      '800+ hours of processing',
      '52% savings',
      'Priority support',
      'Custom integrations',
      'Team management',
      'White-label options'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: 2000000,
      advancedFeatures: true,
      prioritySupport: true
    },
    savings: '💎 52% off',
    stripePriceId: 'price_two_years'
  }
];

export const UPSELL_FEATURES: UpsellFeature[] = [
  {
    id: 'team_license',
    name: 'Team License',
    description: 'Shared preset pack + priority support',
    price: 9.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Shared preset library',
      'Team collaboration tools',
      'Priority support',
      'Team usage analytics',
      'Custom team branding'
    ],
    category: 'team'
  },
  {
    id: 'pro_preset_pack',
    name: 'Pro Preset Pack',
    description: 'CMS-focused: WordPress, Notion, Substack, HubSpot',
    price: 4.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'WordPress optimization',
      'Notion formatting',
      'Substack styling',
      'HubSpot integration',
      'One-click CMS cleaning'
    ],
    category: 'presets'
  },
  {
    id: 'writers_toolkit',
    name: 'Writers\' Toolkit',
    description: 'Sentence-case rules + style-safe clean',
    price: 7.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Style-safe cleaning',
      'Sentence case rules',
      'Writing style preservation',
      'Author-specific presets',
      'Publishing optimization'
    ],
    category: 'writing'
  },
  {
    id: 'dev_mode',
    name: 'Dev Mode',
    description: 'Preserve code fences, tabs/spaces, escape sequences',
    price: 5.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Code fence preservation',
      'Tab/space handling',
      'Escape sequence support',
      'Syntax highlighting safe',
      'Developer presets'
    ],
    category: 'development'
  }
];
