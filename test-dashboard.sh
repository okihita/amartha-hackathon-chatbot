#!/bin/bash

# Dashboard Navigation Test Script
# Tests all pages and navigation consistency

BASE_URL="https://whatsapp-bot-435783355893.asia-southeast2.run.app"

echo "🧪 Testing Amartha Dashboard Navigation"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

# Function to test page
test_page() {
    local page_name=$1
    local url=$2
    local search_text=$3
    
    echo -n "Testing $page_name... "
    
    response=$(curl -s "$url")
    
    if echo "$response" | grep -q "$search_text"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

# Function to test navigation link
test_navigation() {
    local page_name=$1
    local url=$2
    local link_text=$3
    
    echo -n "  → Checking '$link_text' link... "
    
    response=$(curl -s "$url")
    
    if echo "$response" | grep -q "$link_text"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        ((FAILED++))
        return 1
    fi
}

echo "📄 Page Load Tests"
echo "-------------------"

# Test main pages
test_page "Users Page" "$BASE_URL/" "Users - Amartha Dashboard"
test_page "Majelis Page" "$BASE_URL/majelis" "Majelis - Amartha Dashboard"
test_page "Business Types Page" "$BASE_URL/business-types" "Business Types - Amartha Dashboard"
test_page "Financial Literacy Page" "$BASE_URL/financial-literacy" "Financial Literacy Course"

echo ""
echo "🔗 Navigation Link Tests"
echo "------------------------"

# Test navigation on Users page
echo "Users Page Navigation:"
test_navigation "Users" "$BASE_URL/" "👥 Users"
test_navigation "Users" "$BASE_URL/" "📅 Majelis"
test_navigation "Users" "$BASE_URL/" "🏪 Business Types"
test_navigation "Users" "$BASE_URL/" "📚 Financial Literacy"

# Test navigation on Majelis page
echo ""
echo "Majelis Page Navigation:"
test_navigation "Majelis" "$BASE_URL/majelis" "👥 Users"
test_navigation "Majelis" "$BASE_URL/majelis" "📅 Majelis"
test_navigation "Majelis" "$BASE_URL/majelis" "🏪 Business Types"
test_navigation "Majelis" "$BASE_URL/majelis" "📚 Financial Literacy"

# Test navigation on Business Types page
echo ""
echo "Business Types Page Navigation:"
test_navigation "Business Types" "$BASE_URL/business-types" "👥 Users"
test_navigation "Business Types" "$BASE_URL/business-types" "📅 Majelis"
test_navigation "Business Types" "$BASE_URL/business-types" "🏪 Business Types"
test_navigation "Business Types" "$BASE_URL/business-types" "📚 Financial Literacy"

# Test navigation on Financial Literacy page
echo ""
echo "Financial Literacy Page Navigation:"
test_navigation "Financial Literacy" "$BASE_URL/financial-literacy" "👥 Users"
test_navigation "Financial Literacy" "$BASE_URL/financial-literacy" "📅 Majelis"
test_navigation "Financial Literacy" "$BASE_URL/financial-literacy" "🏪 Business Types"
test_navigation "Financial Literacy" "$BASE_URL/financial-literacy" "📚 Financial Literacy"

echo ""
echo "🎨 Enterprise Layout Tests"
echo "--------------------------"

# Test for enterprise header
test_navigation "Enterprise Header" "$BASE_URL/" "Amartha Admin Dashboard"
test_navigation "Gradient Background" "$BASE_URL/" "linear-gradient"

echo ""
echo "📊 API Endpoint Tests"
echo "---------------------"

# Test API endpoints
test_page "Users API" "$BASE_URL/api/users" "phone"
test_page "Majelis API" "$BASE_URL/api/majelis" "name"
test_page "Financial Literacy API" "$BASE_URL/api/financial-literacy" "week_number"

echo ""
echo "🎯 Financial Literacy Features"
echo "-------------------------------"

# Test Financial Literacy specific features
test_navigation "Module Grouping" "$BASE_URL/financial-literacy" "Module"
test_navigation "Week Cards" "$BASE_URL/financial-literacy" "Week"
test_navigation "Quiz Questions" "$BASE_URL/financial-literacy" "questions"

echo ""
echo "========================================"
echo "📈 Test Results Summary"
echo "========================================"
echo -e "Passed: ${GREEN}$PASSED${NC}"
echo -e "Failed: ${RED}$FAILED${NC}"
echo "Total:  $((PASSED + FAILED))"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC} 🎉"
    exit 0
else
    echo -e "${RED}✗ Some tests failed.${NC} Please review the output above."
    exit 1
fi
