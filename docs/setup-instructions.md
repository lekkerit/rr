# n8n Setup Instructions

## 1. Install and Start n8n

```bash
# Install n8n globally
npm install -g n8n

# Start n8n (will be available at http://localhost:5678)
n8n start
```

## 2. Configure Credentials

In the n8n web interface (http://localhost:5678):

### Google OAuth2 Credentials
1. Go to Settings > Credentials
2. Click "Create New Credential"
3. Search for "Google OAuth2 API"
4. Fill in:
   - **Client ID**: *(get from Google Cloud Console — do not commit to repo)*
   - **Client Secret**: `GOCSPX-YOUR_CLIENT_SECRET_HERE` *(you need to provide this)*
   - **Scope**: `https://www.googleapis.com/auth/business.manage`
   - **Auth URI**: `https://accounts.google.com/o/oauth2/v2/auth`
   - **Access Token URI**: `https://oauth2.googleapis.com/token`
5. Name it: "Google My Business OAuth2"
6. Test & Save

### Anthropic API Credentials
1. Create New Credential > Search "Anthropic"
2. Fill in:
   - **API Key**: `YOUR_ANTHROPIC_API_KEY_HERE`
3. Name it: "Anthropic Claude API"
4. Test & Save

### Airtable Credentials
1. Create New Credential > Search "Airtable"
2. Choose "Airtable Personal Access Token"
3. Fill in:
   - **Access Token**: `YOUR_AIRTABLE_PERSONAL_ACCESS_TOKEN_HERE`
4. Name it: "Airtable Personal Access Token"
5. Test & Save

## 3. Import Workflows

1. In n8n, go to Workflows
2. Click "Import from file"
3. Import these files in order:
   - `workflows/mvp-1-review-monitor.json`
   - `workflows/mvp-2-response-generator-poster.json`

## 4. Configure Missing Values

You still need to provide:
- **Google Client Secret** (from Google Cloud Console)
- **Google My Business Account ID** and **Location ID**
- Obtain these by:
  1. Going to Google Cloud Console
  2. Enable My Business API
  3. Get your account/location IDs from the API

## 5. Test the Setup

1. Activate both workflows in n8n
2. Run the review monitor workflow manually first
3. Check that data flows to Airtable
4. Test the webhook response generator

## Airtable Configuration

Your Airtable base: *(get Base ID from Airtable URL — do not commit to repo)*
Table: `Reviews` (as referenced in workflows)

Required fields in the Reviews table:
- google_review_id (Text)
- reviewer_name (Text)
- rating (Number)
- review_text (Long text)
- review_date (Date)
- response_text (Long text)
- response_posted (Checkbox)

## Next Steps

1. Get Google Client Secret from Google Cloud Console
2. Get your Google My Business Account ID and Location ID
3. Update the workflow URLs with your actual business location
4. Test end-to-end flow