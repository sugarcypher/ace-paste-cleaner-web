import { PRICING_TIERS } from '../types/pricing';

export interface Subscription {
  id: string;
  userId: string;
  tier: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: string;
  endDate: string;
  gumroadProductId?: string;
  gumroadPurchaseId?: string;
}

export interface SubscriptionManager {
  getActiveSubscription(): Subscription | null;
  setSubscription(subscription: Subscription): void;
  isSubscriptionActive(): boolean;
  getSubscriptionTier(): string;
  checkSubscriptionExpiry(): void;
  clearSubscription(): void;
}

class LocalSubscriptionManager implements SubscriptionManager {
  private readonly STORAGE_KEY = 'acepaste_subscription';

  getActiveSubscription(): Subscription | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const subscription: Subscription = JSON.parse(stored);
      
      // Check if subscription is expired
      if (new Date(subscription.endDate) < new Date()) {
        subscription.status = 'expired';
        this.setSubscription(subscription);
        return null;
      }
      
      return subscription.status === 'active' ? subscription : null;
    } catch (error) {
      console.error('Error loading subscription:', error);
      return null;
    }
  }

  setSubscription(subscription: Subscription): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(subscription));
    } catch (error) {
      console.error('Error saving subscription:', error);
    }
  }

  isSubscriptionActive(): boolean {
    const subscription = this.getActiveSubscription();
    return subscription !== null && subscription.status === 'active';
  }

  getSubscriptionTier(): string {
    const subscription = this.getActiveSubscription();
    return subscription?.tier || 'free';
  }

  checkSubscriptionExpiry(): void {
    const subscription = this.getActiveSubscription();
    if (subscription && new Date(subscription.endDate) < new Date()) {
      subscription.status = 'expired';
      this.setSubscription(subscription);
    }
  }

  clearSubscription(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Calculate subscription end date based on tier and interval
  calculateEndDate(startDate: string, tier: string): string {
    const start = new Date(startDate);
    const tierData = PRICING_TIERS.find(t => t.id === tier);
    
    if (!tierData) return startDate;
    
    const end = new Date(start);
    
    switch (tierData.interval) {
      case 'month':
        end.setMonth(end.getMonth() + 1);
        break;
      case 'quarter':
        end.setMonth(end.getMonth() + 3);
        break;
      case 'year':
        end.setFullYear(end.getFullYear() + 1);
        break;
      case 'lifetime':
        end.setFullYear(end.getFullYear() + 100); // Effectively lifetime
        break;
      default:
        end.setMonth(end.getMonth() + 1);
    }
    
    return end.toISOString();
  }

  // Create subscription from Gumroad webhook data
  createFromGumroadWebhook(webhookData: any): Subscription {
    const tier = this.mapGumroadProductToTier(webhookData.product_id);
    const startDate = new Date().toISOString();
    
    return {
      id: `sub_${Date.now()}`,
      userId: webhookData.email || `user_${Date.now()}`,
      tier,
      status: 'active',
      startDate,
      endDate: this.calculateEndDate(startDate, tier),
      gumroadProductId: webhookData.product_id,
      gumroadPurchaseId: webhookData.sale_id
    };
  }

  private mapGumroadProductToTier(productId: string): string {
    // Map Gumroad product IDs to our tier system
    // This should match your Gumroad product configuration
    const productMap: Record<string, string> = {
      'monthly_product_id': 'monthly',
      'quarterly_product_id': 'quarterly',
      'six_months_product_id': 'six_months',
      'yearly_product_id': 'yearly',
      'two_years_product_id': 'two_years'
    };
    
    return productMap[productId] || 'free';
  }
}

export const subscriptionManager = new LocalSubscriptionManager();

// Check subscription expiry on app load
if (typeof window !== 'undefined') {
  subscriptionManager.checkSubscriptionExpiry();
}
