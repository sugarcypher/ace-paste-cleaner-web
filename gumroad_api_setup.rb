#!/usr/bin/env ruby
# Gumroad API Setup Script
# This script demonstrates how to use the Gumroad API with the Ruby gem

require 'gumroad'
require 'json'

class GumroadAPISetup
  def initialize(access_token = nil)
    @access_token = access_token || ENV['GUMROAD_ACCESS_TOKEN']
    @session = nil
  end

  def authenticate
    if @access_token.nil? || @access_token.empty?
      puts "❌ Error: Gumroad access token not provided"
      puts "Please set your access token:"
      puts "  export GUMROAD_ACCESS_TOKEN='your_token_here'"
      puts "  or pass it as an argument: GumroadAPISetup.new('your_token_here')"
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

  def get_products
    return unless @session

    begin
      puts "\n📦 Fetching your products..."
      products = @session.products
      
      if products.empty?
        puts "No products found"
        return
      end

      puts "Found #{products.length} product(s):"
      products.each_with_index do |product, index|
        puts "\n#{index + 1}. #{product.name}"
        puts "   ID: #{product.id}"
        puts "   Price: $#{product.price}"
        puts "   URL: #{product.url}"
        puts "   Description: #{product.description[0..100]}..." if product.description
      end
    rescue => e
      puts "❌ Error fetching products: #{e.message}"
    end
  end

  def get_sales
    return unless @session

    begin
      puts "\n💰 Fetching recent sales..."
      sales = @session.sales
      
      if sales.empty?
        puts "No sales found"
        return
      end

      puts "Found #{sales.length} sale(s):"
      sales.first(5).each_with_index do |sale, index|
        puts "\n#{index + 1}. Sale ID: #{sale.id}"
        puts "   Product: #{sale.product_name}"
        puts "   Amount: $#{sale.amount}"
        puts "   Date: #{sale.created_at}"
        puts "   Customer: #{sale.customer_email}"
      end
    rescue => e
      puts "❌ Error fetching sales: #{e.message}"
    end
  end

  def create_product_link(product_id, custom_domain = nil)
    return unless @session

    begin
      puts "\n🔗 Creating product link..."
      link = @session.create_link(product_id, custom_domain)
      puts "✅ Link created successfully:"
      puts "   URL: #{link.url}"
      puts "   Short URL: #{link.short_url}" if link.short_url
    rescue => e
      puts "❌ Error creating link: #{e.message}"
    end
  end

  def test_api
    puts "🧪 Testing Gumroad API..."
    puts "=" * 50

    unless authenticate
      puts "\nPlease set your Gumroad access token and try again."
      return
    end

    get_products
    get_sales

    puts "\n✅ API test completed!"
  end
end

# Usage examples
if __FILE__ == $0
  puts "Gumroad API Setup Script"
  puts "=" * 50

  # Check if access token is provided
  if ARGV.length > 0
    api = GumroadAPISetup.new(ARGV[0])
  else
    api = GumroadAPISetup.new
  end

  api.test_api

  puts "\n📚 Usage Examples:"
  puts "1. Set your access token:"
  puts "   export GUMROAD_ACCESS_TOKEN='your_token_here'"
  puts "   ruby gumroad_api_setup.rb"
  puts ""
  puts "2. Or pass it directly:"
  puts "   ruby gumroad_api_setup.rb 'your_token_here'"
  puts ""
  puts "3. Use in your code:"
  puts "   require_relative 'gumroad_api_setup'"
  puts "   api = GumroadAPISetup.new('your_token')"
  puts "   api.authenticate"
  puts "   api.get_products"
end
