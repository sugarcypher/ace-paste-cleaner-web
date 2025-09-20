export interface GumroadProduct {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year' | 'lifetime';
  features: string[];
  limits: {
    dailyCleanings: number;
    maxTextLength: number;
    advancedFeatures: boolean;
    prioritySupport: boolean;
  };
  gumroadUrl: string;
  description: string;
}

export const GUMROAD_PRODUCTS: GumroadProduct[] = [
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
    },
    gumroadUrl: '', // No URL for free tier
    description: 'Perfect for occasional use'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 4.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited cleanings',
      'Up to 1,000,000 characters',
      'All cleaning features',
      'Priority support',
      'Advanced detection',
      'Bulk processing',
      'API access'
    ],
    limits: {
      dailyCleanings: -1, // unlimited
      maxTextLength: 1000000,
      advancedFeatures: true,
      prioritySupport: true
    },
    gumroadUrl: 'https://sugarcypher.gumroad.com/l/ace-paste-cleaner-pro', // Replace with your actual Gumroad URL
    description: 'Perfect for power users and professionals'
  },
  {
    id: 'pro-yearly',
    name: 'Pro (Yearly)',
    price: 49.99,
    currency: 'USD',
    interval: 'year',
    features: [
      'Everything in Pro',
      '2 months free (save $10)',
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
    gumroadUrl: 'https://sugarcypher.gumroad.com/l/ace-paste-cleaner-pro-yearly', // Replace with your actual Gumroad URL
    description: 'Best value - save 17% with yearly billing'
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
      maxTextLength: 1000000,
      advancedFeatures: true,
      prioritySupport: true
    },
    gumroadUrl: 'https://sugarcypher.gumroad.com/l/ace-paste-cleaner-lifetime', // Replace with your actual Gumroad URL
    description: 'One-time payment, lifetime access'
  }
];

// Helper function to get product by ID
export function getGumroadProduct(id: string): GumroadProduct | undefined {
  return GUMROAD_PRODUCTS.find(product => product.id === id);
}

// Helper function to get paid products only
export function getPaidProducts(): GumroadProduct[] {
  return GUMROAD_PRODUCTS.filter(product => product.price > 0);
}
