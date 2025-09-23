#!/usr/bin/env ruby
require 'httparty'
require 'json'

access_token = "M5n2xDP-vvr0VRt3cxMqu0wwhBQNSAIinzm9OC0GlnQ"

puts "🔍 Debugging Gumroad API product creation"
puts "=" * 50

# First, let's see what the GET /products returns to understand the format
puts "\n📦 Getting existing products to understand format..."
response = HTTParty.get("https://api.gumroad.com/v2/products", 
  headers: { "Authorization" => "Bearer #{access_token}" }
)

puts "Status: #{response.code}"
if response.code == 200
  puts "Response structure:"
  puts JSON.pretty_generate(response.parsed_response)
else
  puts "Failed: #{response.parsed_response}"
end

# Try different product creation approaches
puts "\n🧪 Testing different product creation methods..."

# Method 1: Minimal required fields
puts "\n1. Testing minimal required fields..."
minimal_product = {
  name: "Test Product Minimal",
  price: 100
}

response = HTTParty.post("https://api.gumroad.com/v2/products", 
  headers: { 
    "Authorization" => "Bearer #{access_token}",
    "Content-Type" => "application/json"
  },
  body: minimal_product.to_json
)
puts "Minimal POST: #{response.code}"
puts "Response: #{response.parsed_response}"

# Method 2: With all common fields
puts "\n2. Testing with common fields..."
common_product = {
  name: "Test Product Common",
  price: 100,
  description: "Test description",
  short_description: "Test short",
  customizable_price: false,
  require_shipping: false,
  digital: true
}

response = HTTParty.post("https://api.gumroad.com/v2/products", 
  headers: { 
    "Authorization" => "Bearer #{access_token}",
    "Content-Type" => "application/json"
  },
  body: common_product.to_json
)
puts "Common POST: #{response.code}"
puts "Response: #{response.parsed_response}"

# Method 3: Try with form data instead of JSON
puts "\n3. Testing with form data..."
response = HTTParty.post("https://api.gumroad.com/v2/products", 
  headers: { "Authorization" => "Bearer #{access_token}" },
  body: {
    name: "Test Product Form",
    price: 100,
    description: "Test description",
    short_description: "Test short",
    customizable_price: false,
    require_shipping: false,
    digital: true
  }
)
puts "Form POST: #{response.code}"
puts "Response: #{response.parsed_response}"

# Method 4: Try different endpoint variations
puts "\n4. Testing different endpoint variations..."
endpoints = [
  "https://api.gumroad.com/v2/products",
  "https://api.gumroad.com/v2/product",
  "https://api.gumroad.com/v2/seller/products"
]

endpoints.each do |endpoint|
  response = HTTParty.post(endpoint, 
    headers: { 
      "Authorization" => "Bearer #{access_token}",
      "Content-Type" => "application/json"
    },
    body: { name: "Test", price: 100 }.to_json
  )
  puts "#{endpoint}: #{response.code}"
  if response.code != 404
    puts "  Response: #{response.parsed_response}"
  end
end
