#!/bin/bash
# Restaurant Review AI - Environment Setup Script
# Run this script to set up your development environment

set -e  # Exit on error

echo "🚀 Initializing Restaurant Review AI..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check for required tools
echo "📋 Checking required tools..."

check_tool() {
    if command -v $1 &> /dev/null; then
        echo -e "  ${GREEN}✓${NC} $1 found"
        return 0
    else
        echo -e "  ${RED}✗${NC} $1 not found"
        return 1
    fi
}

MISSING_TOOLS=0

check_tool "node" || MISSING_TOOLS=1
check_tool "npm" || MISSING_TOOLS=1
check_tool "python3" || MISSING_TOOLS=1
check_tool "git" || MISSING_TOOLS=1

if [ $MISSING_TOOLS -eq 1 ]; then
    echo ""
    echo -e "${RED}Error: Some required tools are missing. Please install them first.${NC}"
    exit 1
fi

echo ""

# Create required directories
echo "📁 Creating directory structure..."
mkdir -p .tmp
mkdir -p execution
mkdir -p directives
echo -e "  ${GREEN}✓${NC} Directories created"
echo ""

# Check for .env file
echo "🔐 Checking environment configuration..."
if [ -f ".env" ]; then
    echo -e "  ${GREEN}✓${NC} .env file exists"
else
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo -e "  ${YELLOW}!${NC} Created .env from .env.example"
        echo -e "  ${YELLOW}!${NC} Please edit .env and add your API keys"
    else
        echo -e "  ${YELLOW}!${NC} No .env file found. Create one with your API keys."
    fi
fi
echo ""

# Install Node.js dependencies
echo "📦 Installing Node.js dependencies..."
if [ -f "package.json" ]; then
    npm install --silent
    echo -e "  ${GREEN}✓${NC} Node.js dependencies installed"
else
    echo -e "  ${YELLOW}!${NC} No package.json found, skipping npm install"
fi
echo ""

# Create Python virtual environment (optional)
echo "🐍 Setting up Python environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo -e "  ${GREEN}✓${NC} Python virtual environment created"
else
    echo -e "  ${GREEN}✓${NC} Python virtual environment already exists"
fi

# Install Python dependencies if requirements.txt exists
if [ -f "requirements.txt" ]; then
    source venv/bin/activate
    pip install -r requirements.txt --quiet
    echo -e "  ${GREEN}✓${NC} Python dependencies installed"
fi
echo ""

# Check for Google OAuth credentials
echo "🔑 Checking OAuth credentials..."
if [ -f "credentials.json" ]; then
    echo -e "  ${GREEN}✓${NC} credentials.json found"
else
    echo -e "  ${YELLOW}!${NC} credentials.json not found"
    echo -e "      Download from Google Cloud Console"
fi

if [ -f "token.json" ]; then
    echo -e "  ${GREEN}✓${NC} token.json found (authenticated)"
else
    echo -e "  ${YELLOW}!${NC} token.json not found (needs authentication)"
fi
echo ""

# Verify required environment variables
echo "🔍 Checking required environment variables..."
REQUIRED_VARS=("ANTHROPIC_API_KEY" "AIRTABLE_API_KEY" "GOOGLE_BUSINESS_ACCOUNT_ID")

if [ -f ".env" ]; then
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" .env && ! grep -q "^${var}=$" .env && ! grep -q "^${var}=your_" .env; then
            echo -e "  ${GREEN}✓${NC} $var is set"
        else
            echo -e "  ${YELLOW}!${NC} $var needs to be configured in .env"
        fi
    done
else
    echo -e "  ${YELLOW}!${NC} No .env file - cannot check variables"
fi
echo ""

# Initialize progress tracking
echo "📊 Setting up progress tracking..."
if [ ! -f "claude-progress.txt" ]; then
    cat > claude-progress.txt << 'EOF'
# Claude Progress Log
# Project: Restaurant Review AI
# Started: $(date +%Y-%m-%d)

## Current Session
- [ ] No active tasks

## Completed
(No completed tasks yet)

## Blocked
(No blocked tasks)

## Notes
- Project initialized with 3-layer architecture
- See features.json for comprehensive feature list
EOF
    echo -e "  ${GREEN}✓${NC} claude-progress.txt created"
else
    echo -e "  ${GREEN}✓${NC} claude-progress.txt already exists"
fi
echo ""

# Summary
echo "═══════════════════════════════════════════════════════"
echo ""
echo -e "${GREEN}✅ Environment setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Configure .env with your API keys"
echo "  2. Add credentials.json from Google Cloud Console"
echo "  3. Run authentication flow for Google OAuth"
echo "  4. Import workflows to n8n"
echo ""
echo "Key files:"
echo "  • features.json    - Feature tracking (207 features)"
echo "  • claude-progress.txt - Session progress"
echo "  • directives/      - SOPs for AI agents"
echo "  • execution/       - Python scripts"
echo ""
echo "═══════════════════════════════════════════════════════"
