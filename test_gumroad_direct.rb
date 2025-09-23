#!/usr/bin/env ruby
require 'httparty'
require 'json'

access_token = "M5n2xDP-vvrOVRt3cxMqu0wwhBQNSAlinzm9OCOGInQ"

# Test direct API calls to Gumroad
puts "🔍 Testing Gumroad API directly..."

# Test getting products
puts "\n📦 Testing GET /products:"
response = HTTParty.get("https://api.gumroad.com/v2/products", 
  headers: { "Authorization" => "Bearer #{access_token}" }
)
puts "Status: #{response.code}"
puts "Response: #{response.parsed_response}"

# Test creating a product
puts "\n🆕 Testing POST /products:"
product_data = {
  name: "Ace Paste Cleaner - Monthly",
  price: 699, # in cents
  description: "Monthly subscription for Ace Paste Cleaner - Clean text, every time",
  short_description: "Clean text monthly",
  customizable_price: false,
  max_purchase_count: nil,
  require_shipping: false,
  digital: true
}

response = HTTParty.post("https://api.gumroad.com/v2/products", 
  headers: { 
    "Authorization" => "Bearer #{access_token}",
    "Content-Type" => "application/json"
  },
  body: product_data.to_json
)
puts "Status: #{response.code}"
puts "Response: #{response.parsed_response}"
