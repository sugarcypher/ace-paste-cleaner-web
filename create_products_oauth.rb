#!/usr/bin/env ruby
require 'httparty'
require 'json'

# OAuth credentials
client_id = "163Em-6_BOxx5xUegeQv2kXPd_xj4-CTzeUpx8qO-yg"
client_secret = "R4_VWCJ8ePGV04cbc-cvl5_YovXt5j6lTCQWlE-Wkyw"
access_token = "M5n2xDP-vvr0VRt3cxMqu0wwhBQNSAIinzm9OC0GlnQ"
seller_id = "ka9mnwESCE0aBZzyBF1EUg=="

puts "🚀 Creating Ace Paste Cleaner Products with OAuth"
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
  
  # Try to get a new access token using OAuth
  puts "\n🔄 Trying to get new access token..."
  token_response = HTTParty.post("https://api.gumroad.com/v2/oauth/token", 
    body: {
      client_id: client_id,
      client_secret: client_secret,
      grant_type: "client_credentials"
    }
  )
  
  if token_response.code == 200
    new_token = token_response.parsed_response['access_token']
    puts "✅ Got new access token!"
    access_token = new_token
  else
    puts "❌ Failed to get new token: #{token_response.code}"
    puts "Response: #{token_response.parsed_response}"
    exit 1
  end
end

# Products to create
products = [
  {
    name: "Ace Paste Cleaner - Monthly",
    price: 699,
    description: "Monthly subscription for Ace Paste Cleaner - Clean text, every time. Remove invisible characters, normalize formatting, and clean messy text with one click.",
    short_description: "Clean text monthly - $6.99/month",
    customizable_price: false,
    max_purchase_count: nil,
    require_shipping: false,
    digital: true,
    url: "ace-paste-monthly"
  },
  {
    name: "Ace Paste Cleaner - Quarterly", 
    price: 1999,
    description: "Quarterly subscription for Ace Paste Cleaner - Clean text, every time. Remove invisible characters, normalize formatting, and clean messy text with one click.",
    short_description: "Clean text quarterly - $19.99/quarter",
    customizable_price: false,
    max_purchase_count: nil,
    require_shipping: false,
    digital: true,
    url: "ace-paste-quarterly"
  },
  {
    name: "Ace Paste Cleaner - 6 Months",
    price: 3499,
    description: "6-month subscription for Ace Paste Cleaner - Clean text, every time. Remove invisible characters, normalize formatting, and clean messy text with one click.",
    short_description: "Clean text for 6 months - $34.99",
    customizable_price: false,
    max_purchase_count: nil,
    require_shipping: false,
    digital: true,
    url: "ace-paste-six_months"
  },
  {
    name: "Ace Paste Cleaner - Yearly",
    price: 4999,
    description: "Yearly subscription for Ace Paste Cleaner - Clean text, every time. Remove invisible characters, normalize formatting, and clean messy text with one click.",
    short_description: "Clean text yearly - $49.99/year",
    customizable_price: false,
    max_purchase_count: nil,
    require_shipping: false,
    digital: true,
    url: "ace-paste-yearly"
  },
  {
    name: "Ace Paste Cleaner - 2 Years",
    price: 7999,
    description: "2-year subscription for Ace Paste Cleaner - Clean text, every time. Remove invisible characters, normalize formatting, and clean messy text with one click.",
    short_description: "Clean text for 2 years - $79.99",
    customizable_price: false,
    max_purchase_count: nil,
    require_shipping: false,
    digital: true,
    url: "ace-paste-two_years"
  }
]

# Upsell products
upsells = [
  {
    name: "Ace Paste Cleaner - Team License",
    price: 999,
    description: "Team license for Ace Paste Cleaner - Share with your team. Includes shared preset pack and priority support.",
    short_description: "Team license - $9.99/month",
    customizable_price: false,
    max_purchase_count: nil,
    require_shipping: false,
    digital: true,
    url: "ace-paste-team_license"
  },
  {
    name: "Ace Paste Cleaner - Pro Preset Pack",
    price: 499,
    description: "Pro preset pack for Ace Paste Cleaner - CMS-focused presets for WordPress, Notion, Substack, and HubSpot.",
    short_description: "Pro presets - $4.99/month",
    customizable_price: false,
    max_purchase_count: nil,
    require_shipping: false,
    digital: true,
    url: "ace-paste-pro_preset_pack"
  },
  {
    name: "Ace Paste Cleaner - Writers Toolkit",
    price: 799,
    description: "Writers toolkit for Ace Paste Cleaner - Sentence-case rules and style-safe cleaning for writers.",
    short_description: "Writers toolkit - $7.99/month",
    customizable_price: false,
    max_purchase_count: nil,
    require_shipping: false,
    digital: true,
    url: "ace-paste-writers_toolkit"
  },
  {
    name: "Ace Paste Cleaner - Dev Mode",
    price: 599,
    description: "Dev mode for Ace Paste Cleaner - Preserve code fences, tabs/spaces, and escape sequences for developers.",
    short_description: "Dev mode - $5.99/month",
    customizable_price: false,
    max_purchase_count: nil,
    require_shipping: false,
    digital: true,
    url: "ace-paste-dev_mode"
  }
]

# Create subscription products
puts "\n📦 Creating subscription products..."
products.each do |product|
  puts "\nCreating: #{product[:name]}"
  
  response = HTTParty.post("https://api.gumroad.com/v2/products", 
    headers: { 
      "Authorization" => "Bearer #{access_token}",
      "Content-Type" => "application/json"
    },
    body: product.to_json
  )
  
  if response.code == 200
    puts "✅ Created successfully!"
    puts "   URL: https://thinkwelllabs.gumroad.com/l/#{product[:url]}"
    puts "   Product ID: #{response.parsed_response['product']['id'] rescue 'Unknown'}"
  else
    puts "❌ Failed: #{response.code}"
    puts "   Response: #{response.parsed_response}"
  end
end

# Create upsell products
puts "\n🔧 Creating upsell products..."
upsells.each do |upsell|
  puts "\nCreating: #{upsell[:name]}"
  
  response = HTTParty.post("https://api.gumroad.com/v2/products", 
    headers: { 
      "Authorization" => "Bearer #{access_token}",
      "Content-Type" => "application/json"
    },
    body: upsell.to_json
  )
  
  if response.code == 200
    puts "✅ Created successfully!"
    puts "   URL: https://thinkwelllabs.gumroad.com/l/#{upsell[:url]}"
    puts "   Product ID: #{response.parsed_response['product']['id'] rescue 'Unknown'}"
  else
    puts "❌ Failed: #{response.code}"
    puts "   Response: #{response.parsed_response}"
  end
end

puts "\n🎉 Product creation complete!"
puts "\n📋 Summary:"
puts "All products should now be available at:"
puts "https://thinkwelllabs.gumroad.com/"
puts "\nTest the app at: https://acepaste.xyz"
