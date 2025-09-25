// Test authentication and Gumroad payment validation
// This shows how the system works

import { simpleAuth } from './simpleAuth';
import { processGumroadWebhook } from './gumroadWebhook';

// Test user registration
export function testUserRegistration() {
  console.log('🧪 Testing user registration...');
  
  // Sign up a test user
  const result = simpleAuth.signUp('test@example.com', 'password123');
  console.log('Sign up result:', result);
  
  // Check if user is authenticated
  const isAuth = simpleAuth.isAuthenticated();
  console.log('Is authenticated:', isAuth);
  
  // Get current user
  const user = simpleAuth.getCurrentUser();
  console.log('Current user:', user);
  
  return result;
}

// Test Gumroad payment simulation
export function testGumroadPayment() {
  console.log('🧪 Testing Gumroad payment simulation...');
  
  // Simulate a Gumroad webhook for monthly subscription
  const webhookData = {
    sale_id: 'sale_123456',
    product_id: 'ace-paste-monthly',
    customer_id: 'customer_789',
    customer_email: 'test@example.com',
    sale_timestamp: new Date().toISOString(),
    product_name: 'Ace Paste Cleaner - Monthly',
    price: 6.99,
    currency: 'USD',
    subscription_id: 'sub_123456',
    subscription_status: 'active',
    subscription_period: 'monthly'
  };
  
  // Process the webhook
  const result = processGumroadWebhook(webhookData);
  console.log('Webhook processing result:', result);
  
  // Check updated user
  const user = simpleAuth.getCurrentUser();
  console.log('Updated user:', user);
  
  return result;
}

// Test subscription validation
export function testSubscriptionValidation() {
  console.log('🧪 Testing subscription validation...');
  
  const user = simpleAuth.getCurrentUser();
  if (!user) {
    console.log('No user found');
    return;
  }
  
  console.log('User tier:', user.tier);
  console.log('Subscription expires at:', user.expiresAt);
  
  // Check if subscription is valid
  const now = new Date();
  const expiresAt = user.expiresAt ? new Date(user.expiresAt) : null;
  const isValid = expiresAt ? now < expiresAt : false;
  
  console.log('Subscription is valid:', isValid);
  
  if (expiresAt) {
    const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    console.log('Days remaining:', daysRemaining);
  }
  
  return isValid;
}

// Run all tests
export function runAllTests() {
  console.log('🚀 Running authentication and payment tests...');
  
  // Test 1: User registration
  testUserRegistration();
  
  // Test 2: Gumroad payment
  testGumroadPayment();
  
  // Test 3: Subscription validation
  testSubscriptionValidation();
  
  console.log('✅ All tests completed!');
}

// Make functions available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testAuth = {
    testUserRegistration,
    testGumroadPayment,
    testSubscriptionValidation,
    runAllTests
  };
}
