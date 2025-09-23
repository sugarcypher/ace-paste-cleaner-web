#!/usr/bin/env ruby
require 'httparty'
require 'json'

access_token = "M5n2xDP-vvr0VRt3cxMqu0wwhBQNSAIinzm9OC0GlnQ"

puts "🔍 Checking existing products and API capabilities"
puts "=" * 50

# Get existing products
puts "\n📦 Getting existing products..."
response = HTTParty.get("https://api.gumroad.com/v2/products", 
  headers: { "Authorization" => "Bearer #{access_token}" }
)

puts "Status: #{response.code}"
if response.code == 200
  products = response.parsed_response['products'] || []
  puts "Found #{products.length} existing products:"
  products.each do |product|
    puts "  - #{product['name']} (#{product['id']})"
    puts "    URL: #{product['short_url'] || 'No URL'}"
    puts "    Price: $#{product['price']/100.0}"
  end
else
  puts "Failed to get products: #{response.parsed_response}"
end

# Check user info
puts "\n👤 Getting user info..."
response = HTTParty.get("https://api.gumroad.com/v2/user", 
  headers: { "Authorization" => "Bearer #{access_token}" }
)

if response.code == 200
  user = response.parsed_response['user']
  puts "User: #{user['name']}"
  puts "Email: #{user['email']}"
  puts "Seller ID: #{user['id']}"
end

# Check if there's a different way to create products
puts "\n🔍 Checking API documentation endpoints..."
endpoints = [
  "https://api.gumroad.com/v2/",
  "https://api.gumroad.com/v2/docs",
  "https://api.gumroad.com/v2/help"
]

endpoints.each do |endpoint|
  response = HTTParty.get(endpoint, 
    headers: { "Authorization" => "Bearer #{access_token}" }
  )
  puts "#{endpoint}: #{response.code}"
end
