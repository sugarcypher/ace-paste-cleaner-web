#!/usr/bin/env ruby
require 'gumroad'

access_token = "M5n2xDP-vvrOVRt3cxMqu0wwhBQNSAlinzm9OCOGInQ"

begin
  session = Gumroad::Session.new(access_token, {})
  puts "✅ Successfully authenticated with Gumroad API"
  
  puts "\n📋 Available methods on Gumroad::Session:"
  puts session.methods.sort.grep(/^[a-z]/).join(", ")
  
  puts "\n🔍 Checking for product-related methods:"
  product_methods = session.methods.grep(/product|link|sale|purchase/)
  puts product_methods.any? ? product_methods.join(", ") : "No product-related methods found"
  
rescue => e
  puts "❌ Error: #{e.message}"
end
