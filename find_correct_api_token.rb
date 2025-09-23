#!/usr/bin/env ruby
require 'httparty'
require 'json'

puts "🔍 Finding the correct Gumroad API authentication method"
puts "=" * 60

# The token you provided
oauth_token = "M5n2xDP-vvrOVRt3cxMqu0wwhBQNSAlinzm9OCOGInQ"

puts "\n📋 Let's check what type of token this is..."

# Test 1: Check if it's a valid OAuth token by trying to get user info
puts "\n1. Testing as OAuth token:"
response = HTTParty.get("https://api.gumroad.com/v2/user", 
  headers: { "Authorization" => "Bearer #{oauth_token}" }
)
puts "Status: #{response.code}"
if response.code == 200
  puts "✅ This is a valid API token!"
  puts "User: #{response.parsed_response['user']['name'] rescue 'Unknown'}"
  puts "Email: #{response.parsed_response['user']['email'] rescue 'Unknown'}"
else
  puts "❌ Not a valid API token"
end

# Test 2: Try different API endpoints
puts "\n2. Testing different API endpoints:"
endpoints = [
  "https://api.gumroad.com/v2/products",
  "https://api.gumroad.com/v2/sales", 
  "https://api.gumroad.com/v2/licenses",
  "https://api.gumroad.com/v2/subscribers"
]

endpoints.each do |endpoint|
  response = HTTParty.get(endpoint, 
    headers: { "Authorization" => "Bearer #{oauth_token}" }
  )
  puts "#{endpoint}: #{response.code}"
end

# Test 3: Try creating a simple product
puts "\n3. Testing product creation:"
product_data = {
  name: "Test Product",
  price: 100, # $1.00 in cents
  description: "Test product for API validation",
  short_description: "Test",
  customizable_price: false,
  require_shipping: false,
  digital: true
}

response = HTTParty.post("https://api.gumroad.com/v2/products", 
  headers: { 
    "Authorization" => "Bearer #{oauth_token}",
    "Content-Type" => "application/json"
  },
  body: product_data.to_json
)

puts "Create product status: #{response.code}"
if response.code == 200
  puts "✅ Product creation works!"
  puts "Response: #{response.parsed_response}"
else
  puts "❌ Product creation failed"
  puts "Response: #{response.parsed_response}"
end

puts "\n🎯 Next steps:"
if response.code == 200
  puts "✅ The token works! We can create products automatically."
else
  puts "❌ Need to find the correct API token or authentication method."
  puts "   Check: https://gumroad.com/settings/advanced for API settings"
end
