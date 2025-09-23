#!/usr/bin/env ruby
require 'httparty'
require 'json'

access_token = "M5n2xDP-vvr0VRt3cxMqu0wwhBQNSAIinzm9OC0GlnQ"

puts "🔍 Testing Gumroad v1 API"
puts "=" * 40

# Test v1 API endpoints
endpoints = [
  "https://api.gumroad.com/v1/products",
  "https://api.gumroad.com/v1/product",
  "https://api.gumroad.com/v1/create_product"
]

endpoints.each do |endpoint|
  puts "\nTesting: #{endpoint}"
  
  # Test GET
  response = HTTParty.get(endpoint, 
    headers: { "Authorization" => "Bearer #{access_token}" }
  )
  puts "  GET: #{response.code}"
  
  # Test POST
  response = HTTParty.post(endpoint, 
    headers: { 
      "Authorization" => "Bearer #{access_token}",
      "Content-Type" => "application/json"
    },
    body: { name: "Test Product", price: 100 }.to_json
  )
  puts "  POST: #{response.code}"
  
  if response.code != 404
    puts "  Response: #{response.parsed_response}"
  end
end

# Try without /v2 prefix
puts "\n🧪 Testing without version prefix..."
endpoints = [
  "https://api.gumroad.com/products",
  "https://api.gumroad.com/product"
]

endpoints.each do |endpoint|
  puts "\nTesting: #{endpoint}"
  
  response = HTTParty.post(endpoint, 
    headers: { 
      "Authorization" => "Bearer #{access_token}",
      "Content-Type" => "application/json"
    },
    body: { name: "Test Product", price: 100 }.to_json
  )
  puts "  POST: #{response.code}"
  
  if response.code != 404
    puts "  Response: #{response.parsed_response}"
  end
end

# Try with different authentication method
puts "\n🔐 Testing different auth methods..."
response = HTTParty.post("https://api.gumroad.com/v2/products", 
  headers: { 
    "Authorization" => "Bearer #{access_token}",
    "Content-Type" => "application/json",
    "Accept" => "application/json"
  },
  body: { 
    name: "Test Product",
    price: 100,
    access_token: access_token
  }.to_json
)
puts "With access_token in body: #{response.code}"
if response.code != 404
  puts "Response: #{response.parsed_response}"
end
