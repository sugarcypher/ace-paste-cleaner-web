#!/usr/bin/env ruby
require 'httparty'
require 'json'

access_token = "M5n2xDP-vvr0VRt3cxMqu0wwhBQNSAIinzm9OC0GlnQ"

puts "🔍 Testing different Gumroad API endpoints"
puts "=" * 50

# Test different endpoints
endpoints = [
  "https://api.gumroad.com/v2/products",
  "https://api.gumroad.com/v2/product",
  "https://api.gumroad.com/v2/create_product",
  "https://api.gumroad.com/v2/seller/products",
  "https://api.gumroad.com/v2/seller/create_product"
]

endpoints.each do |endpoint|
  puts "\nTesting: #{endpoint}"
  
  # Test GET
  response = HTTParty.get(endpoint, 
    headers: { "Authorization" => "Bearer #{access_token}" }
  )
  puts "  GET: #{response.code}"
  
  # Test POST with minimal data
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

# Test with form data instead of JSON
puts "\n🧪 Testing with form data..."
response = HTTParty.post("https://api.gumroad.com/v2/products", 
  headers: { "Authorization" => "Bearer #{access_token}" },
  body: { 
    name: "Test Product",
    price: 100,
    description: "Test",
    short_description: "Test",
    digital: true
  }
)
puts "Form data POST: #{response.code}"
puts "Response: #{response.parsed_response}"
