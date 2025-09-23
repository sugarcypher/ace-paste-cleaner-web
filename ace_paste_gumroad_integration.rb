#!/usr/bin/env ruby
# Ace Paste Cleaner - Gumroad Integration
# This script handles payment processing and user upgrades

require 'gumroad'
require 'json'
require 'date'

class AcePasteGumroadIntegration
  def initialize(access_token = nil)
    @access_token = access_token || ENV['GUMROAD_ACCESS_TOKEN']
    @session = nil
    @pricing_tiers = {
      'monthly' => { price: 6.99, interval: 'month', max_text_length: 50000 },
      'quarterly' => { price: 19.99, interval: 'quarter', max_text_length: 200000 },
      'six_months' => { price: 34.99, interval: 'month', max_text_length: 500000 },
      'yearly' => { price: 49.99, interval: 'year', max_text_length: 1000000 },
      'two_years' => { price: 79.99, interval: 'year', max_text_length: 2000000 }
    }
    
    @upsell_features = {
      'team_license' => { price: 9.99, interval: 'month', category: 'team' },
      'pro_preset_pack' => { price: 4.99, interval: 'month', category: 'presets' },
      'writers_toolkit' => { price: 7.99, interval: 'month', category: 'writing' },
      'dev_mode' => { price: 5.99, interval: 'month', category: 'development' }
    }
  end

  def authenticate
    if @access_token.nil? || @access_token.empty?
      puts "❌ Error: Gumroad access token not provided"
      return false
    end

    begin
      @session = Gumroad::Session.new(@access_token)
      puts "✅ Successfully authenticated with Gumroad API"
      return true
    rescue => e
      puts "❌ Authentication failed: #{e.message}"
      return false
    end
  end

  def create_payment_link(tier, user_email = nil, custom_domain = nil)
    return nil unless @session

    tier_info = @pricing_tiers[tier]
    return nil unless tier_info

    begin
      # Create a product link for the specific tier
      product_id = get_product_id_for_tier(tier)
      return nil unless product_id

      # Create payment link with optional custom domain
      link = @session.create_link(product_id, custom_domain)
      
      # Add user email to the link if provided
      if user_email
        link.url += "?email=#{user_email}"
      end

      {
        success: true,
        payment_url: link.url,
        short_url: link.short_url,
        tier: tier,
        price: tier_info[:price],
        interval: tier_info[:interval]
      }
    rescue => e
      puts "❌ Error creating payment link: #{e.message}"
      { success: false, error: e.message }
    end
  end

  def verify_payment(sale_id)
    return nil unless @session

    begin
      # Get sale details from Gumroad
      sale = @session.sale(sale_id)
      return nil unless sale

      # Determine tier based on product
      tier = determine_tier_from_product(sale.product_name)
      
      {
        success: true,
        sale_id: sale.id,
        tier: tier,
        amount: sale.amount,
        customer_email: sale.customer_email,
        created_at: sale.created_at,
        status: sale.status
      }
    rescue => e
      puts "❌ Error verifying payment: #{e.message}"
      { success: false, error: e.message }
    end
  end

  def get_user_subscription_status(user_email)
    return nil unless @session

    begin
      # Get all sales for this user
      sales = @session.sales
      user_sales = sales.select { |sale| sale.customer_email == user_email }
      
      return { active: false, tier: 'free' } if user_sales.empty?

      # Find the most recent active sale
      latest_sale = user_sales.max_by { |sale| Date.parse(sale.created_at) }
      tier = determine_tier_from_product(latest_sale.product_name)
      
      # Check if subscription is still active based on tier
      subscription_active = check_subscription_active(latest_sale, tier)
      
      {
        active: subscription_active,
        tier: subscription_active ? tier : 'free',
        last_payment: latest_sale.created_at,
        amount: latest_sale.amount
      }
    rescue => e
      puts "❌ Error checking subscription status: #{e.message}"
      { active: false, tier: 'free', error: e.message }
    end
  end

  def get_pricing_tiers
    @pricing_tiers
  end

  def get_upsell_features
    @upsell_features
  end

  def create_upsell_payment_link(upsell_id, user_email = nil, custom_domain = nil)
    return nil unless @session

    upsell_info = @upsell_features[upsell_id]
    return nil unless upsell_info

    begin
      # Create a product link for the specific upsell
      product_id = get_product_id_for_upsell(upsell_id)
      return nil unless product_id

      # Create payment link with optional custom domain
      link = @session.create_link(product_id, custom_domain)
      
      # Add user email to the link if provided
      if user_email
        link.url += "?email=#{user_email}"
      end

      {
        success: true,
        payment_url: link.url,
        short_url: link.short_url,
        upsell_id: upsell_id,
        price: upsell_info[:price],
        interval: upsell_info[:interval]
      }
    rescue => e
      puts "❌ Error creating upsell payment link: #{e.message}"
      { success: false, error: e.message }
    end
  end

  private

  def get_product_id_for_tier(tier)
    # This would need to be configured with your actual Gumroad product IDs
    # For now, return a placeholder - you'll need to set these up in Gumroad
    product_ids = {
      'monthly' => 'your_monthly_product_id',
      'quarterly' => 'your_quarterly_product_id',
      'six_months' => 'your_six_months_product_id',
      'yearly' => 'your_yearly_product_id',
      'two_years' => 'your_two_years_product_id'
    }
    
    product_ids[tier]
  end

  def get_product_id_for_upsell(upsell_id)
    # This would need to be configured with your actual Gumroad product IDs
    # For now, return a placeholder - you'll need to set these up in Gumroad
    product_ids = {
      'team_license' => 'your_team_license_product_id',
      'pro_preset_pack' => 'your_pro_preset_pack_product_id',
      'writers_toolkit' => 'your_writers_toolkit_product_id',
      'dev_mode' => 'your_dev_mode_product_id'
    }
    
    product_ids[upsell_id]
  end

  def determine_tier_from_product(product_name)
    # Map product names to tiers
    case product_name.downcase
    when /monthly/
      'monthly'
    when /quarterly/
      'quarterly'
    when /six.*month|6.*month/
      'six_months'
    when /yearly|annual/
      'yearly'
    when /two.*year|2.*year/
      'two_years'
    else
      'free'
    end
  end

  def determine_upsell_from_product(product_name)
    # Map product names to upsells
    case product_name.downcase
    when /team.*license|team/
      'team_license'
    when /pro.*preset|preset.*pack/
      'pro_preset_pack'
    when /writer.*toolkit|toolkit/
      'writers_toolkit'
    when /dev.*mode|development/
      'dev_mode'
    else
      nil
    end
  end

  def check_subscription_active(sale, tier)
    return true if tier == 'lifetime'
    
    sale_date = Date.parse(sale.created_at)
    current_date = Date.today
    
    case tier
    when 'monthly'
      (current_date - sale_date) <= 30
    when 'quarterly'
      (current_date - sale_date) <= 90
    when 'six_months'
      (current_date - sale_date) <= 180
    when 'yearly'
      (current_date - sale_date) <= 365
    when 'two_years'
      (current_date - sale_date) <= 730
    else
      false
    end
  end
end

# Example usage
if __FILE__ == $0
  puts "Ace Paste Cleaner - Gumroad Integration"
  puts "=" * 50

  # Initialize the integration
  integration = AcePasteGumroadIntegration.new

  # Test authentication
  if integration.authenticate
    puts "\n📦 Available pricing tiers:"
    integration.get_pricing_tiers.each do |tier, info|
      puts "  #{tier}: $#{info[:price]} per #{info[:interval]}"
    end

    puts "\n🔗 Example: Create payment link for monthly tier"
    result = integration.create_payment_link('monthly', 'user@example.com')
    if result[:success]
      puts "Payment URL: #{result[:payment_url]}"
    else
      puts "Error: #{result[:error]}"
    end
  else
    puts "\nPlease set your Gumroad access token:"
    puts "export GUMROAD_ACCESS_TOKEN='your_token_here'"
  end
end
