// Gumroad webhook handler for payment validation
// Validates payments and updates user tiers

import { simpleAuth } from './simpleAuth';

interface GumroadWebhookData {
  sale_id: string;
  product_id: string;
  customer_id: string;
  customer_email: string;
  sale_timestamp: string;
  product_name: string;
  price: number;
  currency: string;
  subscription_id?: string;
  subscription_status?: 'active' | 'cancelled' | 'expired';
  subscription_period?: 'monthly' | 'yearly' | 'lifetime';
}

// Map Gumroad product IDs to our tier IDs
const PRODUCT_TO_TIER_MAP: Record<string, string> = {
  'ace-paste-monthly': 'monthly',
  'ace-paste-quarterly': 'quarterly', 
  'ace-paste-six_months': 'six_months',
  'ace-paste-yearly': 'yearly',
  'ace-paste-two_years': 'two_years',
  'ace-paste-team_license': 'team_license',
  'ace-paste-pro_preset_pack': 'pro_preset_pack',
  'ace-paste-writers_toolkit': 'writers_toolkit',
  'ace-paste-dev_mode': 'dev_mode'
};

// Calculate subscription expiration date
function calculateExpirationDate(period: string, startDate: string): string {
  const start = new Date(startDate);
  
  switch (period) {
    case 'monthly':
      return new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    case 'quarterly':
      return new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString();
    case 'yearly':
      return new Date(start.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString();
    case 'lifetime':
      return new Date(start.getTime() + 100 * 365 * 24 * 60 * 60 * 1000).toISOString(); // 100 years
    default:
      return new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
  }
}

// Validate Gumroad webhook signature (in production, verify with Gumroad's secret)
function validateWebhookSignature(payload: string, signature: string): boolean {
  // In production, you would verify the signature using Gumroad's webhook secret
  // For now, we'll accept all webhooks (you should implement proper validation)
  return true;
}

// Process Gumroad webhook
export function processGumroadWebhook(webhookData: GumroadWebhookData): { success: boolean; message: string } {
  try {
    // Validate webhook data
    if (!webhookData.customer_email || !webhookData.product_id) {
      return { success: false, message: 'Invalid webhook data' };
    }

    // Map product ID to tier
    const tier = PRODUCT_TO_TIER_MAP[webhookData.product_id];
    if (!tier) {
      return { success: false, message: 'Unknown product ID' };
    }

    // Find user by email
    const user = simpleAuth.getCurrentUser();
    if (!user || user.email !== webhookData.customer_email) {
      return { success: false, message: 'User not found or email mismatch' };
    }

    // Calculate expiration date
    const expiresAt = webhookData.subscription_period 
      ? calculateExpirationDate(webhookData.subscription_period, webhookData.sale_timestamp)
      : undefined;

    // Update user tier
    const success = simpleAuth.updateUserTier(
      tier,
      webhookData.subscription_id,
      webhookData.customer_id,
      expiresAt
    );

    if (success) {
      return { 
        success: true, 
        message: `User tier updated to ${tier}` 
      };
    } else {
      return { 
        success: false, 
        message: 'Failed to update user tier' 
      };
    }
  } catch (error) {
    console.error('Gumroad webhook processing error:', error);
    return { 
      success: false, 
      message: 'Webhook processing failed' 
    };
  }
}

// Handle webhook from URL parameters (for testing)
export function handleWebhookFromURL(): void {
  const urlParams = new URLSearchParams(window.location.search);
  const webhookData = urlParams.get('webhook_data');
  
  if (webhookData) {
    try {
      const data = JSON.parse(decodeURIComponent(webhookData));
      const result = processGumroadWebhook(data);
      
      if (result.success) {
        alert(`✅ ${result.message}`);
        // Remove webhook data from URL
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Webhook URL processing error:', error);
      alert('❌ Invalid webhook data');
    }
  }
}

// Check if user's subscription is still valid
export function isSubscriptionValid(user: any): boolean {
  if (!user || !user.expiresAt) return false;
  
  const now = new Date();
  const expiresAt = new Date(user.expiresAt);
  
  return now < expiresAt;
}

// Get subscription status
export function getSubscriptionStatus(user: any): {
  isValid: boolean;
  expiresAt?: string;
  daysRemaining?: number;
} {
  if (!user || !user.expiresAt) {
    return { isValid: false };
  }
  
  const now = new Date();
  const expiresAt = new Date(user.expiresAt);
  const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  return {
    isValid: now < expiresAt,
    expiresAt: user.expiresAt,
    daysRemaining: Math.max(0, daysRemaining)
  };
}
