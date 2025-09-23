#!/usr/bin/env ruby
# Generate Gumroad URLs for Ace Paste Cleaner products
# These URLs will work once you create the products in your Gumroad dashboard

puts "🚀 Ace Paste Cleaner - Gumroad Product URLs"
puts "=" * 50

# Your Gumroad username (from the URL you showed me)
username = "sugarcypher"

# Pricing tiers
tiers = {
  'monthly' => { price: 6.99, name: 'Ace Paste Cleaner - Monthly' },
  'quarterly' => { price: 19.99, name: 'Ace Paste Cleaner - Quarterly' },
  'six_months' => { price: 34.99, name: 'Ace Paste Cleaner - 6 Months' },
  'yearly' => { price: 49.99, name: 'Ace Paste Cleaner - Yearly' },
  'two_years' => { price: 79.99, name: 'Ace Paste Cleaner - 2 Years' }
}

# Upsell features
upsells = {
  'team_license' => { price: 9.99, name: 'Ace Paste Cleaner - Team License' },
  'pro_preset_pack' => { price: 4.99, name: 'Ace Paste Cleaner - Pro Preset Pack' },
  'writers_toolkit' => { price: 7.99, name: 'Ace Paste Cleaner - Writers Toolkit' },
  'dev_mode' => { price: 5.99, name: 'Ace Paste Cleaner - Dev Mode' }
}

puts "\n📦 SUBSCRIPTION PLANS:"
puts "-" * 30
tiers.each do |key, tier|
  url = "https://#{username}.gumroad.com/l/ace-paste-#{key}"
  puts "#{tier[:name]}: $#{tier[:price]}"
  puts "  URL: #{url}"
  puts
end

puts "\n🔧 ADD-ON FEATURES:"
puts "-" * 30
upsells.each do |key, upsell|
  url = "https://#{username}.gumroad.com/l/ace-paste-#{key}"
  puts "#{upsell[:name]}: $#{upsell[:price]}"
  puts "  URL: #{url}"
  puts
end

puts "\n📋 NEXT STEPS:"
puts "-" * 30
puts "1. Go to https://gumroad.com/dashboard/products"
puts "2. Create products with these exact names and prices"
puts "3. Use the URLs above for your product links"
puts "4. The app will automatically redirect users to these URLs"
puts
puts "✅ Your app is already configured to use these URLs!"
