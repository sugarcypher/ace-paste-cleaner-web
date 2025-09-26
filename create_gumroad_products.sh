#!/bin/bash

# Check environment variables
if [ -z "$GUMROAD_ACCESS_TOKEN" ]; then
    echo "❌ Error: GUMROAD_ACCESS_TOKEN environment variable is not set"
    exit 1
fi

echo "🚀 Creating Ace Paste Cleaner Products"
echo "======================================="

# Test access token
echo ""
echo "🔐 Testing access token..."
USER_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
    -H "Authorization: Bearer $GUMROAD_ACCESS_TOKEN" \
    "https://api.gumroad.com/v2/user")

HTTP_STATUS=$(echo $USER_RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
USER_BODY=$(echo $USER_RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')

if [ $HTTP_STATUS -eq 200 ]; then
    echo "✅ Access token works!"
    USERNAME=$(echo $USER_BODY | grep -o '"username":"[^"]*' | cut -d'"' -f4)
    echo "Username: $USERNAME"
else
    echo "❌ Access token failed: HTTP $HTTP_STATUS"
    echo "Response: $USER_BODY"
    exit 1
fi

echo ""
echo "📦 Creating products..."

# Function to create a product
create_product() {
    local name="$1"
    local price="$2"
    local description="$3"
    local short_description="$4"
    local url="$5"
    
    echo ""
    echo "Creating: $name"
    
    RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST \
        -H "Authorization: Bearer $GUMROAD_ACCESS_TOKEN" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"$name\",
            \"price\": $price,
            \"description\": \"$description\",
            \"short_description\": \"$short_description\",
            \"customizable_price\": false,
            \"require_shipping\": false,
            \"digital\": true,
            \"url\": \"$url\"
        }" \
        "https://api.gumroad.com/v2/products")
    
    HTTP_STATUS=$(echo $RESPONSE | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    RESPONSE_BODY=$(echo $RESPONSE | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ $HTTP_STATUS -eq 200 ] || [ $HTTP_STATUS -eq 201 ]; then
        echo "✅ Created successfully!"
        echo "   URL: https://$USERNAME.gumroad.com/l/$url"
        PRODUCT_ID=$(echo $RESPONSE_BODY | grep -o '"id":"[^"]*' | cut -d'"' -f4)
        echo "   Product ID: $PRODUCT_ID"
        
        # Store for later use
        echo "$url|https://$USERNAME.gumroad.com/l/$url" >> /tmp/gumroad_urls.txt
    else
        echo "❌ Failed: HTTP $HTTP_STATUS"
        echo "   Response: $RESPONSE_BODY"
    fi
}

# Clear previous URLs
rm -f /tmp/gumroad_urls.txt

# Create all products
create_product "Ace Paste Cleaner - Monthly" 699 "Monthly subscription for Ace Paste Cleaner - Save 20+ hours per month by eliminating manual text cleaning. What takes you hours, we do in seconds." "Pro Monthly - \$6.99/month" "ace-paste-cleaner-monthly"

create_product "Ace Paste Cleaner - Quarterly" 1999 "Quarterly subscription for Ace Paste Cleaner - Save 80+ hours per quarter. 5% savings vs monthly plan." "Pro Quarterly - \$19.99/quarter" "ace-paste-cleaner-quarterly"

create_product "Ace Paste Cleaner - 6 Months" 3499 "6-month subscription for Ace Paste Cleaner - Save 200+ hours per 6 months. 17% savings vs monthly plan." "Pro 6 Months - \$34.99 (17% off)" "ace-paste-cleaner-6months"

create_product "Ace Paste Cleaner - Yearly" 4999 "Yearly subscription for Ace Paste Cleaner - Save 400+ hours per year. 40% savings vs monthly plan. Most popular!" "Pro Yearly - \$49.99/year (40% off)" "ace-paste-cleaner-yearly"

create_product "Ace Paste Cleaner - 2 Years" 7999 "2-year subscription for Ace Paste Cleaner - Save 800+ hours over 2 years. 52% savings vs monthly plan." "Pro 2 Years - \$79.99 (52% off)" "ace-paste-cleaner-2years"

create_product "Ace Paste Cleaner - Lifetime" 12300 "Lifetime Pro access to Ace Paste Cleaner - Save 1000+ hours forever. Limited to 50 people only!" "Lifetime Pro - \$123 (LIMITED)" "ace-paste-cleaner-lifetime"

echo ""
echo "🔗 Generated URLs for your app:"
echo "==============================="

if [ -f /tmp/gumroad_urls.txt ]; then
    while IFS='|' read -r product_key gumroad_url; do
        # Convert product key to match your app's structure
        case $product_key in
            "ace-paste-cleaner-monthly") echo "monthly: '$gumroad_url'" ;;
            "ace-paste-cleaner-quarterly") echo "quarterly: '$gumroad_url'" ;;
            "ace-paste-cleaner-6months") echo "six-months: '$gumroad_url'" ;;
            "ace-paste-cleaner-yearly") echo "yearly: '$gumroad_url'" ;;
            "ace-paste-cleaner-2years") echo "two-years: '$gumroad_url'" ;;
            "ace-paste-cleaner-lifetime") echo "lifetime: '$gumroad_url'" ;;
        esac
    done < /tmp/gumroad_urls.txt
    
    echo ""
    echo "✅ Product creation complete!"
    echo "Copy the URLs above and update your src/types/gumroad-pricing.ts file"
    
    rm -f /tmp/gumroad_urls.txt
else
    echo "❌ No URLs were generated successfully"
fi