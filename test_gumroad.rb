#!/usr/bin/env ruby
require 'gumroad'

puts "Testing Gumroad gem..."
puts "Gumroad version: #{Gumroad::VERSION rescue 'unknown'}"

# Try different ways to initialize
access_token = "M5n2xDP-vvrOVRt3cxMqu0wwhBQNSAlinzm9OCOGInQ"

begin
  puts "Trying Gumroad::Session.new(access_token)..."
  session = Gumroad::Session.new(access_token)
  puts "✅ Success with single argument"
rescue => e
  puts "❌ Failed with single argument: #{e.message}"
end

begin
  puts "Trying Gumroad::Session.new(access_token, {})..."
  session = Gumroad::Session.new(access_token, {})
  puts "✅ Success with two arguments"
rescue => e
  puts "❌ Failed with two arguments: #{e.message}"
end

begin
  puts "Trying Gumroad.new(access_token)..."
  client = Gumroad.new(access_token)
  puts "✅ Success with Gumroad.new"
rescue => e
  puts "❌ Failed with Gumroad.new: #{e.message}"
end
