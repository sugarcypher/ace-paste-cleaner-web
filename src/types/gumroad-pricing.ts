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
    id: 'monthly',
    name: 'Pro Monthly',
    price: 9.99,
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
    gumroadUrl: 'https://sugarcypher.gumroad.com/l/ace-paste-cleaner-monthly', // Replace with your actual Gumroad URL
    description: 'Perfect for trying out Pro features'
  },
  {
    id: 'quarterly',
    name: 'Pro Quarterly',
    price: 24.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Monthly',
      'Save $5 (17% off)',
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
    gumroadUrl: 'https://sugarcypher.gumroad.com/l/ace-paste-cleaner-quarterly', // Replace with your actual Gumroad URL
    description: 'Great value - save 17% vs monthly'
  },
  {
    id: 'six-months',
    name: 'Pro 6 Months',
    price: 44.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Quarterly',
      'Save $15 (25% off)',
      'Priority support',
      'Custom integrations',
      'Team management',
      'White-label options'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: 1000000,
      advancedFeatures: true,
      prioritySupport: true
    },
    gumroadUrl: 'https://sugarcypher.gumroad.com/l/ace-paste-cleaner-6months', // Replace with your actual Gumroad URL
    description: 'Excellent value - save 25% vs monthly'
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: 79.99,
    currency: 'USD',
    interval: 'year',
    features: [
      'Everything in 6 Months',
      'Save $40 (33% off)',
      'Priority support',
      'Custom integrations',
      'Team management',
      'White-label options',
      'Dedicated support',
      'Custom branding'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: 1000000,
      advancedFeatures: true,
      prioritySupport: true
    },
    gumroadUrl: 'https://sugarcypher.gumroad.com/l/ace-paste-cleaner-yearly', // Replace with your actual Gumroad URL
    description: 'Best value - save 33% vs monthly'
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
