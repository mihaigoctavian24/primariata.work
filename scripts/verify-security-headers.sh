#!/bin/bash

###############################################################################
# Security Headers Verification Script
#
# Purpose: Verify that all security headers are properly configured
# Usage:
#   ./scripts/verify-security-headers.sh [URL]
#
# Examples:
#   ./scripts/verify-security-headers.sh http://localhost:3000
#   ./scripts/verify-security-headers.sh https://develop.primariata.work
#   ./scripts/verify-security-headers.sh https://primariata.work
#
# Author: ATLAS Backend Architect
# Date: 2026-01-14
###############################################################################

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default URL
URL="${1:-http://localhost:3000}"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Security Headers Verification${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "Target: ${YELLOW}${URL}${NC}"
echo ""

# Fetch headers
HEADERS=$(curl -s -I "$URL" 2>&1)

if [ $? -ne 0 ]; then
  echo -e "${RED}✗ Failed to fetch URL${NC}"
  echo "Error: $HEADERS"
  exit 1
fi

# Function to check header presence
check_header() {
  local header_name="$1"
  local required="$2"
  local header_value=$(echo "$HEADERS" | grep -i "^${header_name}:" | sed "s/^${header_name}: //i" | tr -d '\r')

  if [ -n "$header_value" ]; then
    echo -e "${GREEN}✓${NC} ${header_name}"
    echo -e "  ${BLUE}→${NC} ${header_value:0:100}..."
    return 0
  else
    if [ "$required" = "required" ]; then
      echo -e "${RED}✗${NC} ${header_name} ${RED}(MISSING)${NC}"
      return 1
    else
      echo -e "${YELLOW}⚠${NC} ${header_name} ${YELLOW}(optional, not present)${NC}"
      return 2
    fi
  fi
}

# Check required headers
echo -e "${BLUE}━━━ Required Security Headers ━━━${NC}"
REQUIRED_PASSED=0
REQUIRED_FAILED=0

check_header "Content-Security-Policy" "required"
[ $? -eq 0 ] && ((REQUIRED_PASSED++)) || ((REQUIRED_FAILED++))

check_header "X-Frame-Options" "required"
[ $? -eq 0 ] && ((REQUIRED_PASSED++)) || ((REQUIRED_FAILED++))

check_header "X-Content-Type-Options" "required"
[ $? -eq 0 ] && ((REQUIRED_PASSED++)) || ((REQUIRED_FAILED++))

check_header "Referrer-Policy" "required"
[ $? -eq 0 ] && ((REQUIRED_PASSED++)) || ((REQUIRED_FAILED++))

check_header "Permissions-Policy" "required"
[ $? -eq 0 ] && ((REQUIRED_PASSED++)) || ((REQUIRED_FAILED++))

check_header "X-XSS-Protection" "required"
[ $? -eq 0 ] && ((REQUIRED_PASSED++)) || ((REQUIRED_FAILED++))

echo ""
echo -e "${BLUE}━━━ Optional Security Headers ━━━${NC}"

check_header "Strict-Transport-Security" "optional"
HSTS_STATUS=$?

check_header "X-DNS-Prefetch-Control" "optional"

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}   Results${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo -e "Required headers: ${GREEN}${REQUIRED_PASSED} passed${NC}, ${RED}${REQUIRED_FAILED} failed${NC}"

# Check if this is localhost (HSTS should be absent)
if [[ "$URL" =~ ^http://localhost ]]; then
  if [ $HSTS_STATUS -eq 1 ]; then
    echo -e "${YELLOW}⚠ Warning: HSTS present on localhost${NC}"
    echo -e "  ${BLUE}→${NC} HSTS should only be enabled in production (HTTPS)"
  else
    echo -e "${GREEN}✓${NC} HSTS correctly absent on localhost"
  fi
else
  if [ $HSTS_STATUS -eq 0 ]; then
    echo -e "${GREEN}✓${NC} HSTS present (production environment)"
  else
    echo -e "${YELLOW}⚠ Warning: HSTS missing in production${NC}"
    echo -e "  ${BLUE}→${NC} HSTS should be enabled for HTTPS deployments"
  fi
fi

echo ""

# Overall status
if [ $REQUIRED_FAILED -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}   ✓ All required security headers are configured correctly${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 0
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}   ✗ Some required security headers are missing${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 1
fi
