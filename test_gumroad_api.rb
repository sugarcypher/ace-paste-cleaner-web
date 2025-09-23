#!/usr/bin/env ruby
require 'gumroad'
require 'json'

access_token = "M5n2xDP-vvrOVRt3cxMqu0wwhBQNSAlinzm9OCOGInQ"

begin
  session = Gumroad::Session.new(access_token, {})
  puts "✅ Successfully authenticated with Gumroad API"
  
  puts "\n🔗 Testing links method:"
  begin
    links_result = session.links
    puts "Links result: #{links_result.inspect}"
  rescue => e
    puts "❌ Links method failed: #{e.message}"
  end
  
  puts "\n📦 Testing products endpoint:"
  begin
    # Try to get products
    products_result = session.get("products")
    puts "Products result: #{products_result.inspect}"
  rescue => e
    puts "❌ Products GET failed: #{e.message}"
  end
  
  puts "\n🆕 Testing create product:"
  begin
    # Try to create a test product
    product_data = {
      name: "Ace Paste Cleaner - Monthly",
      price: 699, # in cents
      description: "Monthly subscription for Ace Paste Cleaner",
      short_description: "Clean text monthly",
      customizable_price: false,
      max_purchase_count: nil,
      require_shipping: false,
      digital: true
    }
    
    create_result = session.post("products", product_data)
    puts "Create product result: #{create_result.inspect}"
  rescue => e
    puts "❌ Create product failed: #{e.message}"
  end
  
rescue => e
  puts "❌ Error: #{e.message}"
end
