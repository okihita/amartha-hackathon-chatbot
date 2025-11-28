#!/bin/bash

# Unified Integration Test Suite
# Combines dashboard, API, and production tests

set -e

# Configuration
BASE_URL="${TEST_URL:-http://localhost:8080}"
VERBOSE="${VERBOSE:-false}"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0;33m'

# Counters
PASSED=0
FAILED=0
WARNINGS=0
TOTAL=0

# Test results array
declare -a FAILED_TESTS

# Utility functions
log_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Test function
test_check() {
    local test_name=$1
    local command=$2
    local expected=$3
    local is_critical=${4:-true}
    
    ((TOTAL++))
    
    if [ "$VERBOSE" = "true" ]; then
        echo -n "  Testing: $test_name... "
    fi
    
    result=$(eval "$command" 2>&1)
    
    if echo "$result" | grep -q "$expected"; then
        if [ "$VERBOSE" = "true" ]; then
            log_success "PASS"
        fi
        ((PASSED++))
        return 0
    else
        if [ "$is_critical" = "true" ]; then
            if [ "$VERBOSE" = "true" ]; then
                log_error "FAIL"
            fi
            ((FAILED++))
            FAILED_TESTS+=("$test_name")
        else
            if [ "$VERBOSE" = "true" ]; then
                log_warning "WARNING"
            fi
            ((WARNINGS++))
        fi
        return 1
    fi
}

# Test suites
run_health_checks() {
    echo ""
    echo "═══ Health Checks ═══"
    test_check "Health endpoint" "curl -s $BASE_URL/health" "Online"
    test_check "Server responds" "curl -s -o /dev/null -w '%{http_code}' $BASE_URL/" "200"
}

run_page_tests() {
    echo ""
    echo "═══ Page Load Tests ═══"
    test_check "Users page" "curl -s $BASE_URL/" "Users - Amartha Dashboard"
    test_check "Majelis page" "curl -s $BASE_URL/majelis" "Majelis - Amartha Dashboard"
    test_check "Business Types page" "curl -s $BASE_URL/business-types" "Business Types"
    test_check "Financial Literacy page" "curl -s $BASE_URL/financial-literacy" "Financial Literacy"
}

run_api_tests() {
    echo ""
    echo "═══ API Endpoint Tests ═══"
    test_check "Users API" "curl -s $BASE_URL/api/users" "phone"
    test_check "Majelis API" "curl -s $BASE_URL/api/majelis" "name" false
    test_check "Business Types API" "curl -s $BASE_URL/api/business-types" "business_type"
    test_check "Financial Literacy API" "curl -s $BASE_URL/api/financial-literacy" "week_number"
}

run_navigation_tests() {
    echo ""
    echo "═══ Navigation Tests ═══"
    test_check "Users nav link" "curl -s $BASE_URL/" "👥 Users"
    test_check "Majelis nav link" "curl -s $BASE_URL/" "📅 Majelis"
    test_check "Business Types nav link" "curl -s $BASE_URL/" "🏪 Business Types"
    test_check "Financial Literacy nav link" "curl -s $BASE_URL/" "📚 Financial Literacy"
}

run_css_tests() {
    echo ""
    echo "═══ CSS & Styling Tests ═══"
    test_check "Styles.css loads" "curl -s $BASE_URL/styles.css" "container"
    test_check "Layout.js loads" "curl -s $BASE_URL/layout.js" "renderHeader"
    test_check "Enterprise gradient" "curl -s $BASE_URL/" "linear-gradient"
}

run_feature_tests() {
    echo ""
    echo "═══ Feature Tests ═══"
    test_check "Financial Literacy modules" "curl -s $BASE_URL/financial-literacy" "Module"
    test_check "Week cards" "curl -s $BASE_URL/financial-literacy" "Week"
    test_check "Quiz functionality" "curl -s $BASE_URL/financial-literacy" "questions"
    test_check "Stats cards" "curl -s $BASE_URL/financial-literacy" "Total Weeks"
}

# Main execution
main() {
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║         AMARTHA DASHBOARD INTEGRATION TEST SUITE           ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    log_info "Testing: $BASE_URL"
    
    run_health_checks
    run_page_tests
    run_api_tests
    run_navigation_tests
    run_css_tests
    run_feature_tests
    
    # Summary
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                      TEST SUMMARY                          ║"
    echo "╠════════════════════════════════════════════════════════════╣"
    printf "║  %-10s %-45s ║\n" "Passed:" "$PASSED"
    printf "║  %-10s %-45s ║\n" "Failed:" "$FAILED"
    printf "║  %-10s %-45s ║\n" "Warnings:" "$WARNINGS"
    printf "║  %-10s %-45s ║\n" "Total:" "$TOTAL"
    echo "╚════════════════════════════════════════════════════════════╝"
    
    # Failed tests details
    if [ $FAILED -gt 0 ]; then
        echo ""
        log_error "Failed Tests:"
        for test in "${FAILED_TESTS[@]}"; do
            echo "  - $test"
        done
    fi
    
    echo ""
    if [ $FAILED -eq 0 ]; then
        log_success "ALL CRITICAL TESTS PASSED!"
        if [ $WARNINGS -gt 0 ]; then
            log_warning "$WARNINGS non-critical warning(s)"
        fi
        exit 0
    else
        log_error "$FAILED test(s) failed"
        exit 1
    fi
}

# Run tests
main
