#!/usr/bin/env ruby
# Gumroad Webhook Handler for Ace Paste Cleaner
# This script handles webhook notifications from Gumroad

require 'json'
require 'uri'
require 'net/http'
require 'openssl'

class GumroadWebhookHandler
  def initialize(webhook_secret = nil)
    @webhook_secret = webhook_secret || ENV['GUMROAD_WEBHOOK_SECRET']
  end

  def verify_webhook(payload, signature)
    return false if @webhook_secret.nil? || @webhook_secret.empty?

    expected_signature = calculate_signature(payload)
    signature == expected_signature
  end

  def process_webhook(payload)
    begin
      data = JSON.parse(payload)
      
      case data['event_type']
      when 'sale'
        handle_sale_event(data)
      when 'refund'
        handle_refund_event(data)
      when 'dispute'
        handle_dispute_event(data)
      else
        puts "Unknown event type: #{data['event_type']}"
      end
    rescue JSON::ParserError => e
      puts "Error parsing webhook payload: #{e.message}"
      false
    end
  end

  def handle_sale_event(data)
    sale = data['sale']
    puts "Processing sale event:"
    puts "  Sale ID: #{sale['id']}"
    puts "  Product: #{sale['product_name']}"
    puts "  Amount: $#{sale['amount']}"
    puts "  Customer: #{sale['customer_email']}"
    puts "  Date: #{sale['created_at']}"

    # Determine tier from product name
    tier = determine_tier_from_product(sale['product_name'])
    
    # Update user subscription in your system
    update_user_subscription(sale['customer_email'], tier, sale['id'])
    
    # Send confirmation email (optional)
    send_confirmation_email(sale['customer_email'], tier)
    
    true
  end

  def handle_refund_event(data)
    refund = data['refund']
    puts "Processing refund event:"
    puts "  Refund ID: #{refund['id']}"
    puts "  Sale ID: #{refund['sale_id']}"
    puts "  Amount: $#{refund['amount']}"
    puts "  Customer: #{refund['customer_email']}"

    # Downgrade user to free tier
    downgrade_user_subscription(refund['customer_email'])
    
    true
  end

  def handle_dispute_event(data)
    dispute = data['dispute']
    puts "Processing dispute event:"
    puts "  Dispute ID: #{dispute['id']}"
    puts "  Sale ID: #{dispute['sale_id']}"
    puts "  Status: #{dispute['status']}"
    puts "  Customer: #{dispute['customer_email']}"

    # Handle dispute based on status
    case dispute['status']
    when 'open'
      # Suspend user account temporarily
      suspend_user_account(dispute['customer_email'])
    when 'closed'
      # Reactivate user account
      reactivate_user_account(dispute['customer_email'])
    end
    
    true
  end

  private

  def calculate_signature(payload)
    OpenSSL::HMAC.hexdigest('SHA256', @webhook_secret, payload)
  end

  def determine_tier_from_product(product_name)
    case product_name.downcase
    when /daily/
      'daily'
    when /weekly/
      'weekly'
    when /monthly/
      'monthly'
    when /yearly|annual/
      'yearly'
    when /two.*year|2.*year/
      'two_years'
    when /three.*year|3.*year/
      'three_years'
    when /four.*year|4.*year/
      'four_years'
    when /lifetime|forever/
      'lifetime'
    else
      'free'
    end
  end

  def update_user_subscription(email, tier, sale_id)
    # This would update your user database
    # For now, we'll just log the action
    puts "  Updating user subscription:"
    puts "    Email: #{email}"
    puts "    Tier: #{tier}"
    puts "    Sale ID: #{sale_id}"
    
    # In a real implementation, you would:
    # 1. Update the user's tier in your database
    # 2. Set the subscription expiration date
    # 3. Update their usage limits
    # 4. Send them a welcome email
  end

  def downgrade_user_subscription(email)
    puts "  Downgrading user subscription:"
    puts "    Email: #{email}"
    puts "    New Tier: free"
    
    # In a real implementation, you would:
    # 1. Set user tier to 'free'
    # 2. Reset their usage limits
    # 3. Send them a notification about the refund
  end

  def suspend_user_account(email)
    puts "  Suspending user account:"
    puts "    Email: #{email}"
    
    # In a real implementation, you would:
    # 1. Mark account as suspended
    # 2. Disable access to paid features
    # 3. Send notification to user
  end

  def reactivate_user_account(email)
    puts "  Reactivating user account:"
    puts "    Email: #{email}"
    
    # In a real implementation, you would:
    # 1. Remove suspension flag
    # 2. Restore access to paid features
    # 3. Send notification to user
  end

  def send_confirmation_email(email, tier)
    puts "  Sending confirmation email:"
    puts "    To: #{email}"
    puts "    Tier: #{tier}"
    
    # In a real implementation, you would:
    # 1. Send a welcome email with tier details
    # 2. Include instructions for using the service
    # 3. Provide support contact information
  end
end

# Example usage for testing
if __FILE__ == $0
  puts "Gumroad Webhook Handler for Ace Paste Cleaner"
  puts "=" * 50

  handler = GumroadWebhookHandler.new

  # Example webhook payload (for testing)
  test_payload = {
    event_type: 'sale',
    sale: {
      id: 'test_sale_123',
      product_name: 'Ace Paste Cleaner - Monthly',
      amount: '3.45',
      customer_email: 'test@example.com',
      created_at: Time.now.iso8601
    }
  }.to_json

  puts "Testing webhook processing..."
  handler.process_webhook(test_payload)
end
