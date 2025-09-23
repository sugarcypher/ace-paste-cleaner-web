# Gumroad API Integration for Ace Paste Cleaner

This directory contains the Ruby scripts and configuration files needed to integrate Gumroad payment processing with the Ace Paste Cleaner application.

## Files Overview

- `gumroad_api_setup.rb` - Basic Gumroad API testing and setup script
- `ace_paste_gumroad_integration.rb` - Main integration script for payment processing
- `gumroad_webhook_handler.rb` - Webhook handler for payment verification
- `gumroad_config.yml` - Configuration template for Gumroad settings
- `GUMROAD_SETUP.md` - This setup guide

## Prerequisites

1. **Ruby 3.4.6** (already installed at `/opt/homebrew/Cellar/ruby/3.4.6/bin/ruby`)
2. **Gumroad API Access Token** (get from your Gumroad account)
3. **Gumroad Products** (create products for each pricing tier)

## Setup Instructions

### 1. Get Your Gumroad Access Token

1. Log into your Gumroad account
2. Go to Settings → Advanced → API
3. Generate a new access token
4. Copy the token (you'll need it for the next steps)

### 2. Set Up Environment Variables

```bash
# Set your Gumroad access token
export GUMROAD_ACCESS_TOKEN='your_actual_token_here'

# Optional: Set webhook secret for security
export GUMROAD_WEBHOOK_SECRET='your_webhook_secret_here'
```

### 3. Create Products in Gumroad

You need to create products in Gumroad for each pricing tier:

1. **Daily** - $1.23
2. **Weekly** - $2.34  
3. **Monthly** - $3.45
4. **Yearly** - $45.67
5. **2 Years** - $56.78
6. **3 Years** - $67.89
7. **4 Years** - $78.90
8. **Lifetime** - $99.99

For each product:
- Use the naming convention: "Ace Paste Cleaner - [Tier]"
- Set the price as specified above
- Add description: "[Tier] access to Ace Paste Cleaner with 1M character limit"
- Note down the Product ID for each

### 4. Update Configuration

1. Copy `gumroad_config.yml` to `gumroad_config_local.yml`
2. Fill in your actual access token and product IDs
3. Update the custom domain to `acepaste.xyz`

### 5. Test the Integration

```bash
# Test basic API connection
/opt/homebrew/Cellar/ruby/3.4.6/bin/ruby gumroad_api_setup.rb

# Test payment link creation
/opt/homebrew/Cellar/ruby/3.4.6/bin/ruby ace_paste_gumroad_integration.rb

# Test webhook handler
/opt/homebrew/Cellar/ruby/3.4.6/bin/ruby gumroad_webhook_handler.rb
```

## Integration with Ace Paste Cleaner

### Frontend Integration

The Ace Paste Cleaner frontend should:

1. **Check User Subscription Status**
   ```javascript
   // Call your backend API to check subscription
   const response = await fetch('/api/user/subscription');
   const { tier, active } = await response.json();
   ```

2. **Create Payment Links**
   ```javascript
   // When user clicks upgrade
   const response = await fetch('/api/payment/create-link', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ tier: 'monthly', email: userEmail })
   });
   const { payment_url } = await response.json();
   window.open(payment_url, '_blank');
   ```

3. **Handle Payment Success**
   ```javascript
   // After successful payment, redirect back to app
   const urlParams = new URLSearchParams(window.location.search);
   const payment_success = urlParams.get('payment_success');
   if (payment_success === 'true') {
     // Refresh user data and show success message
   }
   ```

### Backend Integration

Your backend should:

1. **Expose API endpoints** for:
   - `/api/user/subscription` - Check user subscription status
   - `/api/payment/create-link` - Create payment links
   - `/api/webhooks/gumroad` - Handle webhook notifications

2. **Use the Ruby scripts** to:
   - Verify payments
   - Update user subscriptions
   - Handle webhooks

3. **Store user data** in your database:
   - User email
   - Subscription tier
   - Subscription expiration date
   - Payment history

## Webhook Setup

1. **In Gumroad Dashboard**:
   - Go to Settings → Advanced → Webhooks
   - Add webhook URL: `https://acepaste.xyz/api/webhooks/gumroad`
   - Select events: `sale`, `refund`, `dispute`
   - Set webhook secret

2. **In Your Backend**:
   - Create endpoint to receive webhooks
   - Use `gumroad_webhook_handler.rb` to process events
   - Update user subscriptions based on events

## Testing

### Test Payment Flow

1. Set up test products in Gumroad (use $0.01 for testing)
2. Create payment link using the integration script
3. Complete test payment
4. Verify webhook is received
5. Check user subscription is updated

### Test Webhook Handler

```bash
# Test with sample data
/opt/homebrew/Cellar/ruby/3.4.6/bin/ruby gumroad_webhook_handler.rb
```

## Security Considerations

1. **Never expose access tokens** in frontend code
2. **Verify webhook signatures** before processing
3. **Use HTTPS** for all webhook endpoints
4. **Validate payment amounts** before granting access
5. **Log all payment events** for audit purposes

## Troubleshooting

### Common Issues

1. **"Access token not provided"**
   - Make sure `GUMROAD_ACCESS_TOKEN` environment variable is set
   - Check token is valid in Gumroad dashboard

2. **"Product not found"**
   - Verify product IDs in configuration
   - Check products exist in Gumroad dashboard

3. **"Webhook verification failed"**
   - Check webhook secret matches
   - Verify webhook URL is accessible

### Debug Mode

Add debug logging to see what's happening:

```ruby
# In your Ruby scripts
puts "Debug: #{variable.inspect}"
```

## Next Steps

1. Set up your Gumroad products
2. Configure the integration scripts
3. Test the payment flow
4. Integrate with your Ace Paste Cleaner backend
5. Deploy to production

## Support

- Gumroad API Documentation: https://gumroad.com/api
- Ruby Gem Documentation: https://rubygems.org/gems/gumroad
- Ace Paste Cleaner Repository: https://github.com/sugarcypher/Ace-Paste-Cleaner
