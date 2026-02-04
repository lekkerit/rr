#!/bin/bash

# Secure Credential Setup Script
# This script helps you set up credentials securely without exposing them in git

echo "🔐 Setting up secure credentials for Restaurant Review AI"
echo ""

# Create credentials directory if it doesn't exist
mkdir -p credentials

# Check if .env already exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Backing up to .env.backup"
    cp .env .env.backup
fi

# Create .env file from template
echo "📝 Creating .env file from template..."
cat > .env << 'EOF'
# Google OAuth2 Credentials
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback
GOOGLE_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_BUSINESS_ACCOUNT_ID=your_business_account_id_here
GOOGLE_BUSINESS_LOCATION_ID=your_business_location_id_here

# Anthropic API
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Airtable
AIRTABLE_API_KEY=your_airtable_personal_access_token_here
AIRTABLE_BASE_ID=appvashRUw01RzXY7

# Application
NODE_ENV=development
PORT=3000
N8N_WEBHOOK_URL=http://localhost:5678/webhook/generate-and-post
EOF

# Create actual credentials file for n8n (gitignored)
echo "📝 Creating n8n credentials template..."
cp n8n-credentials.json n8n-credentials-actual.json

echo ""
echo "✅ Template files created!"
echo ""
echo "🔧 Next steps:"
echo "1. Edit .env with your actual API credentials"
echo "2. Edit n8n-credentials-actual.json with your actual credentials"
echo "3. Never commit these files to git (they're in .gitignore)"
echo ""
echo "📋 You'll need to get these credentials:"
echo "• Google Client ID & Secret: Google Cloud Console"
echo "• Google Business Account/Location ID: From Google My Business API"
echo "• Anthropic API Key: From Anthropic Console"
echo "• Airtable Personal Access Token: From Airtable Account settings"
echo ""
echo "🚨 IMPORTANT: Keep these credentials secure and never share them!"