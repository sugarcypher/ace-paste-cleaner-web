#!/usr/bin/env ruby
require 'httparty'
require 'json'

seller_id = "ka9mnwESCE0aBZzyBF1EUg=="
access_token = "M5n2xDP-vvrOVRt3cxMqu0wwhBQNSAlinzm9OCOGInQ"

puts "🔍 Testing different authentication methods with seller_id"
puts "=" * 60

# Test 1: Using seller_id as query parameter
puts "\n1. Testing seller_id as query parameter:"
response = HTTParty.get("https://api.gumroad.com/v2/user?seller_id=#{seller_id}")
puts "Status: #{response.code}"
puts "Response: #{response.parsed_response}"

# Test 2: Using seller_id in headers
puts "\n2. Testing seller_id in headers:"
response = HTTParty.get("https://api.gumroad.com/v2/user", 
  headers: { "seller_id" => seller_id }
)
puts "Status: #{response.code}"
puts "Response: #{response.parsed_response}"

# Test 3: Using seller_id in form data
puts "\n3. Testing seller_id in form data:"
response = HTTParty.post("https://api.gumroad.com/v2/user", 
  body: { seller_id: seller_id }
)
puts "Status: #{response.code}"
puts "Response: #{response.parsed_response}"

# Test 4: Using both access_token and seller_id
puts "\n4. Testing both access_token and seller_id:"
response = HTTParty.get("https://api.gumroad.com/v2/user", 
  headers: { "Authorization" => "Bearer #{access_token}" },
  query: { seller_id: seller_id }
)
puts "Status: #{response.code}"
puts "Response: #{response.parsed_response}"

# Test 5: Try creating a product with seller_id
puts "\n5. Testing product creation with seller_id:"
product_data = {
  name: "Test Product",
  price: 100,
  description: "Test product",
  short_description: "Test",
  customizable_price: false,
  require_shipping: false,
  digital: true,
  seller_id: seller_id
}

response = HTTParty.post("https://api.gumroad.com/v2/products", 
  headers: { 
    "Authorization" => "Bearer #{access_token}",
    "Content-Type" => "application/json"
  },
  body: product_data.to_json
)

puts "Create product status: #{response.code}"
puts "Response: #{response.parsed_response}"

# Test 6: Try with seller_id as query parameter
puts "\n6. Testing product creation with seller_id as query:"
response = HTTParty.post("https://api.gumroad.com/v2/products?seller_id=#{seller_id}", 
  headers: { 
    "Authorization" => "Bearer #{access_token}",
    "Content-Type" => "application/json"
  },
  body: product_data.to_json
)

puts "Create product status: #{response.code}"
puts "Response: #{response.parsed_response}"
