#!/usr/bin/env ruby
require 'httparty'
require 'json'

# Get OAuth credentials from environment variables
client_id = ENV['GUMROAD_APPLICATION_ID']
client_secret = ENV['GUMROAD_APPLICATION_SECRET']
access_token = ENV['GUMROAD_ACCESS_TOKEN']

# Validate environment variables
if !client_id || !client_secret || !access_token
  puts "❌ Error: Missing environment variables!"
  puts "Please set:"
  puts "  - GUMROAD_APPLICATION_ID" unless client_id
  puts "  - GUMROAD_APPLICATION_SECRET" unless client_secret
  puts "  - GUMROAD_ACCESS_TOKEN" unless access_token
  exit 1
end

puts "🚀 Creating Ace Paste Cleaner Products"
puts "=" * 50

# Test the access token first
puts "\n🔐 Testing access token..."
response = HTTParty.get("https://api.gumroad.com/v2/user", 
  headers: { "Authorization" => "Bearer #{access_token}" }
)

if response.code == 200
  puts "✅ Access token works!"
  puts "User: #{response.parsed_response['user']['name'] rescue 'Unknown'}"
else
  puts "❌ Access token failed: #{response.code}"
  puts "Response: #{response.parsed_response}"
  exit 1
end

# Products to create (matching your app's pricing structure)
products = [
  {
    name: "Ace Paste Cleaner - Monthly",
    price: 699, # $6.99
    description: "Monthly subscription for Ace Paste Cleaner - Save 20+ hours per month by eliminating manual text cleaning. What takes you hours, we do in seconds.",
    short_description: "Pro Monthly - $6.99/month",
    customizable_price: false,
    require_shipping: false,
    digital: true,
    url: "ace-paste-cleaner-monthly"
  },
  {
    name: "Ace Paste Cleaner - Quarterly", 
    price: 1999, # $19.99
    description: "Quarterly subscription for Ace Paste Cleaner - Save 80+ hours per quarter. 5% savings vs monthly plan.",
    short_description: "Pro Quarterly - $19.99/quarter",
    customizable_price: false,
    require_shipping: false,
    digital: true,
    url: "ace-paste-cleaner-quarterly"
  },
  {
    name: "Ace Paste Cleaner - 6 Months",
    price: 3499, # $34.99
    description: "6-month subscription for Ace Paste Cleaner - Save 200+ hours per 6 months. 17% savings vs monthly plan.",
    short_description: "Pro 6 Months - $34.99 (17% off)",
    customizable_price: false,
    require_shipping: false,
    digital: true,
    url: "ace-paste-cleaner-6months"
  },
  {
    name: "Ace Paste Cleaner - Yearly",
    price: 4999, # $49.99
    description: "Yearly subscription for Ace Paste Cleaner - Save 400+ hours per year. 40% savings vs monthly plan. Most popular!",
    short_description: "Pro Yearly - $49.99/year (40% off)",
    customizable_price: false,
    require_shipping: false,
    digital: true,
    url: "ace-paste-cleaner-yearly"
  },
  {
    name: "Ace Paste Cleaner - 2 Years",
    price: 7999, # $79.99
    description: "2-year subscription for Ace Paste Cleaner - Save 800+ hours over 2 years. 52% savings vs monthly plan.",
    short_description: "Pro 2 Years - $79.99 (52% off)",
    customizable_price: false,
    require_shipping: false,
    digital: true,
    url: "ace-paste-cleaner-2years"
  },
  {
    name: "Ace Paste Cleaner - Lifetime",
    price: 12300, # $123.00
    description: "Lifetime Pro access to Ace Paste Cleaner - Save 1000+ hours forever. Limited to 50 people only!",
    short_description: "Lifetime Pro - $123 (LIMITED)",
    customizable_price: false,
    require_shipping: false,
    digital: true,
    url: "ace-paste-cleaner-lifetime"
  }
]

# Create products
puts "\n📦 Creating products..."
created_products = []

products.each do |product|
  puts "\nCreating: #{product[:name]}"
  
  response = HTTParty.post("https://api.gumroad.com/v2/products", 
    headers: { 
      "Authorization" => "Bearer #{access_token}",
      "Content-Type" => "application/json"
    },
    body: product.to_json
  )
  
  if response.code == 200 || response.code == 201
    product_data = response.parsed_response['product']
    gumroad_url = "https://#{product_data['seller']['username']}.gumroad.com/l/#{product[:url]}"
    
    puts "✅ Created successfully!"
    puts "   URL: #{gumroad_url}"
    puts "   Product ID: #{product_data['id']}"
    
    created_products << {
      id: product[:url].gsub('ace-paste-cleaner-', ''),
      name: product[:name],
      gumroad_url: gumroad_url,
      product_id: product_data['id']
    }
  else
    puts "❌ Failed: #{response.code}"
    puts "   Response: #{response.parsed_response}"
  end
end

# Generate URLs for the app
puts "\n🔗 Generated URLs for your app:"
puts "=" * 50
created_products.each do |product|
  puts "#{product[:id]}: '#{product[:gumroad_url]}'"
end

puts "\n✅ Product creation complete!"
puts "Copy the URLs above and update your src/types/gumroad-pricing.ts file"