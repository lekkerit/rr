# n8n Setup Guide for Beginners - Review Recovery

## Overview
This guide walks you through setting up 8 automated workflows in n8n to run your Review Recovery service. **Total setup time: 2-3 hours**

---

## Part 1: Setting Up Credentials (Do This First!)

Before importing workflows, set up your API credentials in n8n.

### Step 1.1: Airtable Credentials

1. **Get Airtable Personal Access Token:**
   - Go to https://airtable.com/create/tokens
   - Click "Create new token"
   - Name: "n8n Review Recovery"
   - Add scopes: `data.records:read`, `data.records:write`, `schema.bases:read`
   - Add access to base: Select "Restaurant Review AI" (YOUR_AIRTABLE_BASE_ID)
   - Click "Create token"
   - **Copy the token** (you'll only see it once!)

2. **Add to n8n:**
   - In n8n, click your profile icon (top right) → "Settings" → "Credentials"
   - Click "Add Credential"
   - Search for "Airtable"
   - Select "Airtable Personal Access Token"
   - Paste your token
   - Name it: "Airtable - Review Recovery"
   - Click "Save"

---

### Step 1.2: Google OAuth Credentials

1. **Get Google OAuth Credentials:**
   - You mentioned you already have Google Cloud project + credentials
   - You need: Client ID and Client Secret
   - From: https://console.cloud.google.com/apis/credentials

2. **Add to n8n:**
   - In n8n Credentials page
   - Click "Add Credential"
   - Search for "Google OAuth2 API"
   - Fill in:
     - **Client ID:** (from Google Cloud Console)
     - **Client Secret:** (from Google Cloud Console)
     - **Scope:** `https://www.googleapis.com/auth/business.manage`
   - Click "Connect my account" (will open Google auth)
   - Grant permissions
   - Name it: "Google My Business OAuth"
   - Click "Save"

---

### Step 1.3: Anthropic Claude API

1. **Get Anthropic API Key:**
   - Go to https://console.anthropic.com/
   - Click "API Keys" → "Create Key"
   - Name: "n8n Review Recovery"
   - Copy the key

2. **Add to n8n:**
   - In n8n Credentials page
   - Click "Add Credential"
   - Search for "Anthropic" or "HTTP Header Auth"
   - If using HTTP Header Auth:
     - Name: `x-api-key`
     - Value: (paste your Anthropic API key)
   - Name it: "Anthropic Claude API"
   - Click "Save"

---

### Step 1.4: SMTP Email (For Sending Emails)

**Option A: Gmail (Easiest)**
1. **Enable Gmail App Password:**
   - Go to https://myaccount.google.com/apppasswords
   - Create app password for "Mail"
   - Copy the 16-character password

2. **Add to n8n:**
   - In n8n Credentials page
   - Click "Add Credential"
   - Search for "SMTP"
   - Fill in:
     - **User:** your-email@gmail.com
     - **Password:** (paste app password)
     - **Host:** smtp.gmail.com
     - **Port:** 587
     - **SSL/TLS:** Enable
   - Name it: "Gmail SMTP"
   - Click "Save"

**Option B: SendGrid, Mailgun, or other ESP**
- Follow their SMTP setup instructions
- Port is usually 587 or 465

---

## Part 2: Import Workflows

### Step 2.1: Download Workflow Files

1. **Navigate to workflows folder:**
   ```bash
   cd /Users/barryobrien/Projects/restaurant-review-ai/automation/workflows
   ```

2. **Files to import (in this order):**
   - ✅ `8-typeform-waitlist-workflow.json`
   - ✅ `2-response-generator-workflow.json`
   - ✅ `3-approval-handler-workflow.json`
   - ✅ `4-post-scheduler-workflow.json`
   - ✅ `5-analytics-builder-workflow.json`
   - ✅ `1-review-monitor-workflow.json`
   - ✅ `0-onboarding-workflow.json`
   - ✅ `6-google-oauth-callback-UPDATED.json`

---

### Step 2.2: Import First Workflow (Typeform Waitlist)

1. **In n8n:**
   - Click "Workflows" in left sidebar
   - Click "+ Add workflow" button (top right)
   - You'll see a blank canvas

2. **Import the workflow:**
   - Click the **3-dot menu** (⋮) in top right corner
   - Select "Import from File"
   - Choose `8-typeform-waitlist-workflow.json`
   - Click "Open"

3. **Workflow appears!** You'll see connected nodes:
   - Webhook (Typeform)
   - Transform Typeform Data
   - Create Airtable Record
   - Send Admin Notification
   - Respond to Typeform

---

### Step 2.3: Update Credentials in Workflow

**For EACH node with a red warning triangle:**

1. **Click the node** (e.g., "Create Airtable Record")
2. **Update credential:**
   - Find the "Credential" dropdown
   - Select "Airtable - Review Recovery" (the one you created)
3. **Update Base ID:**
   - Find field with `YOUR_AIRTABLE_BASE_ID`
   - Replace with: `YOUR_AIRTABLE_BASE_ID`
4. **Update Table name:**
   - Should be "Waitlist" (check it's correct)
5. Click outside node to close

**Repeat for:**
- "Create Airtable Record" node → Airtable credential
- "Send Admin Notification" node → SMTP credential

---

### Step 2.4: Save & Activate Workflow

1. **Click "Save" button** (top right)
2. **Rename workflow:**
   - Click "My workflow" at top
   - Rename to: "8. Typeform Waitlist Handler"
3. **Activate workflow:**
   - Toggle the switch in top right (should turn green)
4. **Copy webhook URL:**
   - Click "Webhook (Typeform)" node
   - Click "Test URL" or "Production URL"
   - Copy the URL (you'll add this to Typeform)

---

### Step 2.5: Repeat for Other 7 Workflows

**For each workflow (2, 3, 4, 5, 1, 0, 6):**

1. Create new workflow (+ Add workflow)
2. Import JSON file
3. Update credentials in ALL nodes:
   - Airtable nodes → "Airtable - Review Recovery"
   - Google API nodes → "Google My Business OAuth"
   - Claude API nodes → "Anthropic Claude API"
   - Email nodes → "Gmail SMTP"
4. Update `YOUR_AIRTABLE_BASE_ID` → `YOUR_AIRTABLE_BASE_ID`
5. Update `YOUR_SMTP_CREDENTIALS` (if any)
6. Save workflow
7. **DON'T activate yet!** (we'll do that in order)

---

## Part 3: Configure Airtable Tables

### Step 3.1: Verify Tables Exist

In your Airtable base (YOUR_AIRTABLE_BASE_ID), you need these 9 tables:

1. ✅ **Waitlist** (should already exist with Typeform connection)
2. **Restaurants**
3. **Brand_Voice_Profiles**
4. **Reviews**
5. **Generated_Responses**
6. **Analytics_Snapshots**
7. **Common_Themes**
8. **API_Usage_Logs**
9. **Approval_Emails**

**If tables are missing:**
- Use schema from `/docs/airtable-schema.md`
- Create manually in Airtable
- Match field names EXACTLY (case-sensitive!)

---

### Step 3.2: Create Views in Airtable

**In Restaurants table:**
- View: "Active Restaurants" → Filter: `status = "Active"`

**In Reviews table:**
- View: "Pending Responses" → Filter: `response_generated = false AND is_spam = false`

**In Generated_Responses table:**
- View: "Pending Approval" → Filter: `approval_status = "Pending"`
- View: "Ready to Post" → Filter: `approval_status = "Approved" AND post_status = "Queued"`

---

## Part 4: Testing Workflows

### Step 4.1: Test Typeform Waitlist (Workflow 8)

1. **In n8n:**
   - Open "8. Typeform Waitlist Handler" workflow
   - Click "Webhook (Typeform)" node
   - Copy the **Production URL**

2. **In Typeform:**
   - Go to your form settings
   - Find "Connect" or "Integrations"
   - Add webhook endpoint (paste n8n URL)

3. **Test:**
   - Submit a test application via your Typeform
   - Check n8n executions (left sidebar → "Executions")
   - Verify record appears in Airtable Waitlist table
   - Check admin email received

---

### Step 4.2: Manual Test of Response Generator (Workflow 2)

**Before testing workflows 1-7, you need test data:**

1. **Manually add a test restaurant to Airtable:**
   - Open Restaurants table
   - Add record:
     - `restaurant_id`: "rest_test_001"
     - `restaurant_name`: "Test Pizza Place"
     - `owner_email`: your-test-email@gmail.com
     - `tier`: "Starter"
     - `subscription_status`: "Active"
     - `monthly_response_limit`: 100
     - `monthly_response_count`: 0
     - `status`: "Active"
     - Leave Google OAuth fields empty for now

2. **Manually add a test review:**
   - Open Reviews table
   - Add record:
     - `review_id`: "rev_test_001"
     - `restaurant`: Link to "Test Pizza Place"
     - `google_review_id`: "test_review_123"
     - `reviewer_name`: "Test Customer"
     - `star_rating`: "5 Stars"
     - `review_text`: "Amazing pizza! Best in town!"
     - `review_date`: (today's date)
     - `retrieved_at`: (now)
     - `is_spam`: false
     - `is_answered`: false
     - `sentiment`: "Positive"
     - `response_generated`: false

3. **In n8n:**
   - Open "2. Response Generator" workflow
   - Click "Execute Workflow" button
   - Watch it run
   - Check if response created in Generated_Responses table

---

## Part 5: Activate Workflows in Order

**IMPORTANT: Activate in this specific order to prevent errors**

### Activation Order:

1. ✅ **Workflow 8** - Typeform Waitlist (already active)
2. **Workflow 2** - Response Generator (activate now)
3. **Workflow 4** - Post Scheduler
4. **Workflow 5** - Analytics Builder
5. **Workflow 3** - Approval Handler
6. **Workflow 1** - Review Monitor (runs weekly)
7. **Workflow 0** - Onboarding
8. **Workflow 6** - OAuth Callback

**How to activate:**
- Open each workflow
- Click toggle switch in top right (turns green)
- Verify no error messages

---

## Part 6: Connect Real Restaurant (Onboarding)

### Step 6.1: Google OAuth Setup

1. **In Google Cloud Console:**
   - Add OAuth redirect URI: `https://lekkerit.app.n8n.cloud/webhook/google-oauth-callback`
   - (Get exact URL from Workflow 6)

2. **Test OAuth flow:**
   - Use `/scripts/oauth-test/server.js` to get OAuth tokens
   - Or build onboarding form that triggers Workflow 0

---

### Step 6.2: First Real Restaurant

1. **Manually onboard your first pilot restaurant:**
   - Add to Restaurants table
   - Complete Google OAuth flow
   - Store tokens in Airtable (encrypted)

2. **Verify workflows run:**
   - Workflow 1 fetches reviews (Monday 6am)
   - Workflow 2 generates responses
   - Workflow 3 sends approval email
   - Restaurant owner approves
   - Workflow 4 posts to Google

---

## Troubleshooting

### Common Issues:

**Error: "Credential not found"**
- Solution: Re-select credential in node dropdown

**Error: "Table not found"**
- Solution: Verify Airtable table name matches exactly (case-sensitive)

**Error: "Invalid API key"**
- Solution: Regenerate API key and update credential

**Workflow doesn't trigger**
- Solution: Check activation toggle is ON (green)
- Verify cron expression for scheduled workflows

**Email not sending**
- Solution: Test SMTP credential separately
- Check Gmail app password is correct

---

## Next Steps After Setup

1. **Monitor executions:**
   - Check n8n Executions tab daily
   - Look for failed workflows

2. **Adjust schedule:**
   - Workflow 1 runs Monday 6am (change if needed)
   - Edit cron expression in trigger node

3. **Add more restaurants:**
   - Onboard from Waitlist table
   - Move status: "Approved" → run onboarding

4. **Track metrics:**
   - Check Analytics_Snapshots table
   - Monitor response posting success rate

---

## Quick Reference

### Your n8n Instance
- URL: https://lekkerit.app.n8n.cloud
- Workflow IDs will be generated after import

### Your Airtable Base
- Base ID: `YOUR_AIRTABLE_BASE_ID`
- Tables: 9 total (see Part 3)

### Support Docs
- n8n docs: https://docs.n8n.io
- Airtable API: https://airtable.com/developers/web/api/introduction
- Google My Business API: https://developers.google.com/my-business

---

**Setup Checklist:**

- [ ] Part 1: All 4 credentials created in n8n
- [ ] Part 2: All 8 workflows imported
- [ ] Part 2: All workflows have correct credentials
- [ ] Part 2: All `YOUR_AIRTABLE_BASE_ID` replaced
- [ ] Part 3: All 9 Airtable tables created
- [ ] Part 3: Airtable views configured
- [ ] Part 4: Typeform test passed
- [ ] Part 4: Test data added to Airtable
- [ ] Part 5: All workflows activated in order
- [ ] Part 6: First restaurant onboarded
- [ ] Part 6: End-to-end test completed

**Target: Launch by Feb 9, 2026**

---

Last updated: February 1, 2026
