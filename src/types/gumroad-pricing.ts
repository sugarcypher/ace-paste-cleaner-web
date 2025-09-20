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
    id: 'monthly',
    name: 'Pro Monthly',
    price: 6.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Unlimited cleanings',
      'Up to 50,000 characters per cleaning',
      'Save 20+ hours per month',
      'All cleaning features',
      'Priority support',
      'Advanced detection',
      'Bulk processing',
      'API access'
    ],
    limits: {
      dailyCleanings: -1, // unlimited
      maxTextLength: 50000,
      advancedFeatures: true,
      prioritySupport: true
    },
    gumroadUrl: 'https://sugarcypher.gumroad.com/l/ace-paste-cleaner-monthly', // Replace with your actual Gumroad URL
    description: 'Save 20+ hours per month - pays for itself in 3 minutes!'
  },
  {
    id: 'quarterly',
    name: 'Pro Quarterly',
    price: 19.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Monthly',
      'Up to 200,000 characters per cleaning',
      'Save 80+ hours per quarter',
      'Save $1 (5% off)',
      'Priority support',
      'Custom integrations',
      'Team management'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: 200000,
      advancedFeatures: true,
      prioritySupport: true
    },
    gumroadUrl: 'https://sugarcypher.gumroad.com/l/ace-paste-cleaner-quarterly', // Replace with your actual Gumroad URL
    description: 'Save 80+ hours per quarter - incredible value!'
  },
  {
    id: 'six-months',
    name: 'Pro 6 Months',
    price: 39.99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Quarterly',
      'Up to 500,000 characters per cleaning',
      'Save 200+ hours per 6 months',
      'Save $2 (5% off)',
      'Priority support',
      'Custom integrations',
      'Team management',
      'White-label options'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: 500000,
      advancedFeatures: true,
      prioritySupport: true
    },
    gumroadUrl: 'https://sugarcypher.gumroad.com/l/ace-paste-cleaner-6months', // Replace with your actual Gumroad URL
    description: 'Save 200+ hours per 6 months - massive time savings!'
  },
  {
    id: 'yearly',
    name: 'Pro Yearly',
    price: 49.99,
    currency: 'USD',
    interval: 'year',
    features: [
      'Everything in 6 Months',
      'Up to 1,000,000 characters per cleaning',
      'Save 400+ hours per year',
      'Save $34 (41% off)',
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
    description: 'Save 400+ hours per year - NO BRAINER at $49.99!'
  },
  {
    id: 'two-years',
    name: 'Pro 2 Years',
    price: 79.99,
    currency: 'USD',
    interval: 'year',
    features: [
      'Everything in Yearly',
      'Up to 1,000,000 characters per cleaning',
      'Save 800+ hours over 2 years',
      'Save $44 (36% off vs yearly)',
      'Priority support',
      'Custom integrations',
      'Team management',
      'White-label options',
      'Dedicated support',
      'Custom branding',
      'Future updates included',
      'Lifetime support'
    ],
    limits: {
      dailyCleanings: -1,
      maxTextLength: 1000000,
      advancedFeatures: true,
      prioritySupport: true
    },
    gumroadUrl: 'https://sugarcypher.gumroad.com/l/ace-paste-cleaner-2years', // Replace with your actual Gumroad URL
    description: 'Save 800+ hours over 2 years - ULTIMATE VALUE at $79.99!'
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
