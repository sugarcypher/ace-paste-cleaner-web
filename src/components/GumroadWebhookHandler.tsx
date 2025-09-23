import { useEffect } from 'react';
import { useUsage } from '../hooks/useUsage';

interface GumroadWebhookHandlerProps {
  webhookUrl?: string;
}

export function GumroadWebhookHandler({ webhookUrl = '/api/gumroad-webhook' }: GumroadWebhookHandlerProps) {
  const { handleGumroadWebhook } = useUsage();

  useEffect(() => {
    // Listen for Gumroad webhook messages (if using postMessage)
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'gumroad_webhook') {
        handleGumroadWebhook(event.data.payload);
      }
    };

    // Listen for URL hash changes (for redirect-based auth)
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.includes('gumroad_success') || hash.includes('gumroad_purchase')) {
        // Parse purchase data from URL hash
        const params = new URLSearchParams(hash.substring(1));
        const purchaseData = {
          product_id: params.get('product_id'),
          sale_id: params.get('sale_id'),
          email: params.get('email'),
          amount: params.get('amount'),
          currency: params.get('currency')
        };
        
        if (purchaseData.product_id) {
          handleGumroadWebhook(purchaseData);
        }
      }
    };

    // Listen for storage events (cross-tab communication)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'gumroad_purchase_data' && event.newValue) {
        try {
          const purchaseData = JSON.parse(event.newValue);
          handleGumroadWebhook(purchaseData);
          // Clear the data after processing
          localStorage.removeItem('gumroad_purchase_data');
        } catch (error) {
          console.error('Error parsing Gumroad purchase data:', error);
        }
      }
    };

    // Add event listeners
    window.addEventListener('message', handleMessage);
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('storage', handleStorageChange);

    // Check for existing purchase data on load
    handleHashChange();

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [handleGumroadWebhook]);

  // This component doesn't render anything
  return null;
}

// Utility function to simulate Gumroad webhook (for testing)
export function simulateGumroadWebhook(purchaseData: any) {
  // Method 1: PostMessage
  window.postMessage({
    type: 'gumroad_webhook',
    payload: purchaseData
  }, window.location.origin);

  // Method 2: Storage event
  localStorage.setItem('gumroad_purchase_data', JSON.stringify(purchaseData));
  localStorage.removeItem('gumroad_purchase_data'); // Trigger storage event

  // Method 3: URL hash (for redirect-based flow)
  const params = new URLSearchParams();
  Object.entries(purchaseData).forEach(([key, value]) => {
    if (value) params.set(key, String(value));
  });
  window.location.hash = params.toString();
}
