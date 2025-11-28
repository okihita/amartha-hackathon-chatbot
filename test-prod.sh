#!/bin/bash

# Test Production Endpoints
PROD_URL="https://whatsapp-bot-435783355893.asia-southeast2.run.app"

echo "🧪 Testing Production Endpoints..."
echo "=================================="
echo ""

# Test health endpoint
echo "1. Testing /health"
HEALTH=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL/health)
if [ "$HEALTH" = "200" ]; then
    echo "   ✅ Health check: OK"
else
    echo "   ❌ Health check: FAILED (HTTP $HEALTH)"
fi
echo ""

# Test users page
echo "2. Testing / (Users page)"
USERS=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL/)
if [ "$USERS" = "200" ]; then
    echo "   ✅ Users page: OK"
else
    echo "   ❌ Users page: FAILED (HTTP $USERS)"
fi
echo ""

# Test majelis page
echo "3. Testing /majelis"
MAJELIS=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL/majelis)
if [ "$MAJELIS" = "200" ]; then
    echo "   ✅ Majelis page: OK"
else
    echo "   ❌ Majelis page: FAILED (HTTP $MAJELIS)"
fi
echo ""

# Test business types page
echo "4. Testing /business-types"
BUSINESS=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL/business-types)
if [ "$BUSINESS" = "200" ]; then
    echo "   ✅ Business Types page: OK"
else
    echo "   ❌ Business Types page: FAILED (HTTP $BUSINESS)"
fi
echo ""

# Test API endpoints
echo "5. Testing /api/users"
API_USERS=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL/api/users)
if [ "$API_USERS" = "200" ]; then
    echo "   ✅ Users API: OK"
else
    echo "   ❌ Users API: FAILED (HTTP $API_USERS)"
fi
echo ""

echo "6. Testing /api/majelis"
API_MAJELIS=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL/api/majelis)
if [ "$API_MAJELIS" = "200" ]; then
    echo "   ✅ Majelis API: OK"
else
    echo "   ❌ Majelis API: FAILED (HTTP $API_MAJELIS)"
fi
echo ""

echo "7. Testing /api/business-types"
API_BUSINESS=$(curl -s -o /dev/null -w "%{http_code}" $PROD_URL/api/business-types)
if [ "$API_BUSINESS" = "200" ]; then
    echo "   ✅ Business Types API: OK"
    
    # Get count
    COUNT=$(curl -s $PROD_URL/api/business-types | jq '. | length')
    echo "   📊 Business types in database: $COUNT"
else
    echo "   ❌ Business Types API: FAILED (HTTP $API_BUSINESS)"
fi
echo ""

echo "=================================="
echo "✅ Testing complete!"
echo ""
echo "To deploy latest changes, run:"
echo "  ./deploy.sh"
