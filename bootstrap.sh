#!/usr/bin/env bash
# bootstrap.sh — Pre-flight environment check for ReviewRecovery project
# Run before starting any Claude Code session: bash bootstrap.sh

set -euo pipefail

PASS="✓"
FAIL="✗"
WARN="!"
errors=0

echo "=== ReviewRecovery Environment Check ==="
echo ""

# 1. Working directory
if [[ "$PWD" == */Projects/rr ]]; then
  echo "$PASS Working directory: $PWD"
else
  echo "$WARN Working directory is $PWD (expected .../Projects/rr)"
  echo "   Run: cd /Users/barryobrien/Projects/rr"
fi

# 2. Required CLI tools
echo ""
echo "--- CLI Tools ---"
tools=("node" "python3" "git" "npx")
for tool in "${tools[@]}"; do
  if command -v "$tool" &>/dev/null; then
    echo "$PASS $tool: $(command -v $tool)"
  else
    echo "$FAIL $tool: NOT FOUND — install it before proceeding"
    ((errors++))
  fi
done

# Check ffmpeg separately (optional but flagged)
if command -v ffmpeg &>/dev/null; then
  echo "$PASS ffmpeg: $(command -v ffmpeg)"
else
  echo "$WARN ffmpeg: not installed (needed for MP4 generation)"
  echo "   Fix: brew install ffmpeg"
fi

# 3. .env file
echo ""
echo "--- Environment Variables ---"
if [[ -f ".env" ]]; then
  echo "$PASS .env file found"
  required_vars=("AIRTABLE_API_KEY" "ANTHROPIC_API_KEY")
  for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env 2>/dev/null; then
      echo "$PASS $var: set"
    else
      echo "$FAIL $var: missing from .env"
      ((errors++))
    fi
  done
  optional_vars=("TWILIO_ACCOUNT_SID" "TWILIO_AUTH_TOKEN" "TRELLO_API_KEY" "TRELLO_TOKEN")
  for var in "${optional_vars[@]}"; do
    if grep -q "^${var}=" .env 2>/dev/null; then
      echo "$PASS $var: set"
    else
      echo "$WARN $var: not set (optional — needed for Twilio/Trello features)"
    fi
  done
else
  echo "$FAIL .env file missing — copy .env.example or create it"
  ((errors++))
fi

# 4. Airtable token test
echo ""
echo "--- API Connectivity ---"
if [[ -f ".env" ]] && grep -q "^AIRTABLE_API_KEY=" .env 2>/dev/null; then
  TOKEN=$(grep "^AIRTABLE_API_KEY=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
  if [[ -n "$TOKEN" ]]; then
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
      -H "Authorization: Bearer $TOKEN" \
      "https://api.airtable.com/v0/meta/whoami")
    if [[ "$HTTP_STATUS" == "200" ]]; then
      echo "$PASS Airtable API token: valid"
    elif [[ "$HTTP_STATUS" == "401" ]]; then
      echo "$FAIL Airtable API token: invalid or expired (HTTP 401)"
      echo "   Fix: generate a new token at airtable.com/create/tokens"
      ((errors++))
    else
      echo "$WARN Airtable API: unexpected status $HTTP_STATUS"
    fi
  else
    echo "$FAIL AIRTABLE_API_TOKEN is empty in .env"
    ((errors++))
  fi
fi

# 5. Google credentials
echo ""
echo "--- Google OAuth ---"
if [[ -f "credentials.json" ]]; then
  echo "$PASS credentials.json: present"
else
  echo "$WARN credentials.json: missing (needed for Google Business Profile API)"
fi
if [[ -f "token.json" ]]; then
  echo "$PASS token.json: present"
else
  echo "$WARN token.json: missing (run OAuth flow to generate)"
fi

# 6. Credential leak scan
echo ""
echo "--- Security Scan ---"
LEAKED=$(grep -rn 'pat_[a-zA-Z0-9]\{20,\}\|sk-[a-zA-Z0-9T]\{20,\}\|key_[a-zA-Z0-9]\{20,\}' \
  --include='*.js' --include='*.html' --include='*.py' \
  --exclude-dir=node_modules --exclude-dir=.git . 2>/dev/null || true)
if [[ -z "$LEAKED" ]]; then
  echo "$PASS No hardcoded API keys detected in source files"
else
  echo "$FAIL Possible hardcoded API keys found:"
  echo "$LEAKED"
  ((errors++))
fi

# Summary
echo ""
echo "==============================="
if [[ $errors -eq 0 ]]; then
  echo "$PASS All checks passed. Ready to go."
else
  echo "$FAIL $errors issue(s) found. Fix above before proceeding."
fi
echo ""
