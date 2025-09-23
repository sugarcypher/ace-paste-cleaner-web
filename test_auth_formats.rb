#!/usr/bin/env ruby
require 'httparty'
require 'base64'

access_token = "M5n2xDP-vvrOVRt3cxMqu0wwhBQNSAlinzm9OCOGInQ"

puts "🔍 Testing different authentication formats..."

# Test 1: Bearer token
puts "\n1. Testing Bearer token format:"
response = HTTParty.get("https://api.gumroad.com/v2/user", 
  headers: { "Authorization" => "Bearer #{access_token}" }
)
puts "Status: #{response.code}"
puts "Response: #{response.parsed_response}"

# Test 2: Basic auth with token
puts "\n2. Testing Basic auth format:"
response = HTTParty.get("https://api.gumroad.com/v2/user", 
  headers: { "Authorization" => "Basic #{Base64.strict_encode64("#{access_token}:")}" }
)
puts "Status: #{response.code}"
puts "Response: #{response.parsed_response}"

# Test 3: Query parameter
puts "\n3. Testing query parameter format:"
response = HTTParty.get("https://api.gumroad.com/v2/user?access_token=#{access_token}")
puts "Status: #{response.code}"
puts "Response: #{response.parsed_response}"

# Test 4: Form data
puts "\n4. Testing form data format:"
response = HTTParty.post("https://api.gumroad.com/v2/user", 
  body: { access_token: access_token }
)
puts "Status: #{response.code}"
puts "Response: #{response.parsed_response}"

# Test 5: Check if it's an OAuth token
puts "\n5. Testing OAuth endpoints:"
response = HTTParty.get("https://api.gumroad.com/v2/oauth/token", 
  headers: { "Authorization" => "Bearer #{access_token}" }
)
puts "Status: #{response.code}"
puts "Response: #{response.parsed_response}"
