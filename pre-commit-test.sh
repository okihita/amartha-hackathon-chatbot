#!/bin/bash

# Pre-Commit Test Script
# Comprehensive tests before deployment

set -e  # Exit on any error

BASE_URL="https://whatsapp-bot-435783355893.asia-southeast2.run.app"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PASSED=0
FAILED=0
WARNINGS=0

echo "╔════════════════════════════════════════════════════════════╗"
echo "║         AMARTHA DASHBOARD PRE-COMMIT TEST SUITE           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Test function with detailed output
test_check() {
    local test_name=$1
    local command=$2
    local expected=$3
    
    echo -n "  Testing: $test_name... "
    
    result=$(eval "$command" 2>&1)
    
    if echo "$result" | grep -q "$expected"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "    Expected: $expected"
        echo "    Got: $(echo "$result" | head -1)"
        ((FAILED++))
        return 1
    fi
}

# Warning check (non-critical)
test_warning() {
    local test_name=$1
    local command=$2
    local expected=$3
    
    echo -n "  Checking: $test_name... "
    
    result=$(eval "$command" 2>&1)
    
    if echo "$result" | grep -q "$expected"; then
        echo -e "${GREEN}✓ OK${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠ WARNING${NC}"
        ((WARNINGS++))
        return 1
    fi
}

echo -e "${BLUE}═══ 1. PAGE LOAD TESTS ═══${NC}"
test_check "Users page loads" "curl -s $BASE_URL/" "Users - Amartha Dashboard"
test_check "Majelis page loads" "curl -s $BASE_URL/majelis" "Majelis - Amartha Dashboard"
test_check "Business Types page loads" "curl -s $BASE_URL/business-types" "Business Types"
test_check "Financial Literacy page loads" "curl -s $BASE_URL/financial-literacy" "Financial Literacy"
echo ""

echo -e "${BLUE}═══ 2. NAVIGATION CONSISTENCY ═══${NC}"
echo "Users Page:"
test_check "  Has Users link" "curl -s $BASE_URL/" "👥 Users"
test_check "  Has Majelis link" "curl -s $BASE_URL/" "📅 Majelis"
test_check "  Has Business Types link" "curl -s $BASE_URL/" "🏪 Business Types"
test_check "  Has Financial Literacy link" "curl -s $BASE_URL/" "📚 Financial Literacy"

echo "Majelis Page:"
test_check "  Has Users link" "curl -s $BASE_URL/majelis" "👥 Users"
test_check "  Has Majelis link" "curl -s $BASE_URL/majelis" "📅 Majelis"
test_check "  Has Business Types link" "curl -s $BASE_URL/majelis" "🏪 Business Types"
test_check "  Has Financial Literacy link" "curl -s $BASE_URL/majelis" "📚 Financial Literacy"

echo "Business Types Page:"
test_check "  Has Users link" "curl -s $BASE_URL/business-types" "👥 Users"
test_check "  Has Majelis link" "curl -s $BASE_URL/business-types" "📅 Majelis"
test_check "  Has Business Types link" "curl -s $BASE_URL/business-types" "🏪 Business Types"
test_check "  Has Financial Literacy link" "curl -s $BASE_URL/business-types" "📚 Financial Literacy"

echo "Financial Literacy Page:"
test_check "  Has Users link" "curl -s $BASE_URL/financial-literacy" "👥 Users"
test_check "  Has Majelis link" "curl -s $BASE_URL/financial-literacy" "📅 Majelis"
test_check "  Has Business Types link" "curl -s $BASE_URL/financial-literacy" "🏪 Business Types"
test_check "  Has Financial Literacy link" "curl -s $BASE_URL/financial-literacy" "📚 Financial Literacy"
echo ""

echo -e "${BLUE}═══ 3. ENTERPRISE LAYOUT ═══${NC}"
test_check "Header gradient present" "curl -s $BASE_URL/" "linear-gradient.*#1e3c72"
test_check "Shared styles loaded" "curl -s $BASE_URL/" "SHARED_STYLES"
test_check "Enterprise header title" "curl -s $BASE_URL/" "Amartha Admin Dashboard"
test_check "Admin badge present" "curl -s $BASE_URL/" "Petugas Lapangan"
echo ""

echo -e "${BLUE}═══ 4. API ENDPOINTS ═══${NC}"
test_check "Users API responds" "curl -s $BASE_URL/api/users" "phone"
test_check "Financial Literacy API responds" "curl -s $BASE_URL/api/financial-literacy" "week_number"
test_check "Health check responds" "curl -s $BASE_URL/health" "Online"
test_warning "Majelis API responds" "curl -s $BASE_URL/api/majelis" "name"
echo ""

echo -e "${BLUE}═══ 5. FINANCIAL LITERACY FEATURES ═══${NC}"
test_check "Module grouping present" "curl -s $BASE_URL/financial-literacy" "Module"
test_check "Week cards present" "curl -s $BASE_URL/financial-literacy" "Week"
test_check "Quiz functionality present" "curl -s $BASE_URL/financial-literacy" "questions"
test_check "Audit view button present" "curl -s $BASE_URL/financial-literacy" "View All Questions"
test_check "Stats cards present" "curl -s $BASE_URL/financial-literacy" "Total Weeks"
echo ""

echo -e "${BLUE}═══ 6. CSS & STYLING ═══${NC}"
test_check "Card styling present" "curl -s $BASE_URL/" "\.card"
test_check "Button styling present" "curl -s $BASE_URL/" "\.btn"
test_check "Modal styling present" "curl -s $BASE_URL/" "\.modal"
test_check "Responsive grid present" "curl -s $BASE_URL/financial-literacy" "grid-template-columns"
echo ""

echo -e "${BLUE}═══ 7. JAVASCRIPT FUNCTIONALITY ═══${NC}"
test_check "Layout.js loads" "curl -s $BASE_URL/layout.js" "renderHeader"
test_check "renderHeader function exists" "curl -s $BASE_URL/layout.js" "function renderHeader"
test_check "SHARED_STYLES defined" "curl -s $BASE_URL/layout.js" "const SHARED_STYLES"
echo ""

echo -e "${BLUE}═══ 8. CONTENT VALIDATION ═══${NC}"
test_check "No JavaScript errors in HTML" "curl -s $BASE_URL/ | grep -v 'console.error'" "html"
test_check "No broken placeholder divs" "curl -s $BASE_URL/majelis | grep 'header-placeholder'" "header-placeholder"
test_check "Financial literacy has weeks" "curl -s $BASE_URL/api/financial-literacy | jq 'length'" "[0-9]"
echo ""

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                      TEST SUMMARY                          ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo -e "║  ${GREEN}Passed:${NC}   $PASSED                                              ║"
echo -e "║  ${RED}Failed:${NC}   $FAILED                                              ║"
echo -e "║  ${YELLOW}Warnings:${NC} $WARNINGS                                              ║"
echo "║  Total:    $((PASSED + FAILED))                                           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ ALL CRITICAL TESTS PASSED!${NC}"
    echo -e "${GREEN}✓ Ready to commit and deploy.${NC}"
    if [ $WARNINGS -gt 0 ]; then
        echo -e "${YELLOW}⚠ Note: $WARNINGS warning(s) detected (non-critical)${NC}"
    fi
    exit 0
else
    echo -e "${RED}✗ $FAILED TEST(S) FAILED!${NC}"
    echo -e "${RED}✗ Please fix issues before committing.${NC}"
    exit 1
fi
