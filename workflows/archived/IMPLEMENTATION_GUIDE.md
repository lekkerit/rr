# n8n Workflow Implementation Guide

## 📋 Overview

This guide provides step-by-step instructions for implementing all 5 core workflows for your Restaurant Review Response Automation system in n8n.

---

## 📊 Workflow Summary

| # | Workflow Name | Trigger | Frequency | Purpose |
|---|---------------|---------|-----------|---------|
| 1 | Review Monitor | Cron | Weekly (Mon 6am) | Fetch new reviews from Google My Business |
| 2 | Response Generator | Webhook | On-demand | Generate AI responses using Claude |
| 3 | Approval Handler | Cron | Weekly (Mon 9am) | Send email digests for approval |
| 4 | Post Scheduler | Cron | Hourly | Post approved responses to Google |
| 5 | Analytics Builder | Cron | Daily (2am) | Calculate metrics and analytics |

---

## 🚀 Prerequisites

### Required Credentials

| Service | Credential Type | Purpose | Setup Link |
|---------|----------------|---------|-----------|
| Airtable | Personal Access Token | Database operations | https://airtable.com/create/tokens |
| Google OAuth2 | OAuth2 | Google My Business API | https://console.cloud.google.com/ |
| Anthropic | API Key | Claude AI responses | https://console.anthropic.com/ |
| SMTP | Email credentials | Send approval emails | Your email provider |

### Setup Checklist

- [ ] n8n instance running (cloud or self-hosted)
- [ ] Airtable base created with schema from `database/airtable-schema.md`
- [ ] Google Cloud project with My Business API enabled
- [ ] Anthropic API key obtained
- [ ] Email SMTP credentials ready

---

## 📥 Import Instructions

### Step 1: Download Workflow Files

All 5 workflow JSON files are included:
1. `1-review-monitor-workflow.json`
2. `2-response-generator-workflow.json`
3. `3-approval-handler-workflow.json`
4. `4-post-scheduler-workflow.json`
5. `5-analytics-builder-workflow.json`

### Step 2: Import into n8n

For each workflow:

1. **Open n8n** and navigate to Workflows
2. **Click "Add Workflow"** (+ button)
3. **Click the three dots menu** → "Import from File"
4. **Select the JSON file** for the workflow
5. **Click "Import"**

Repeat for all 5 workflows.

---

## 🔧 Configuration Steps

### Workflow 1: Review Monitor

**Purpose:** Fetches new reviews from Google My Business every Monday at 6am

#### Configuration Table

| Node | Setting | Value to Update |
|------|---------|----------------|
| Get Active Restaurants | Base ID | Your Airtable base ID |
| Get Active Restaurants | Credentials | Your Airtable token |
| Fetch Reviews from Google | Credentials | Your Google OAuth2 |
| Store New Reviews | Base ID | Your Airtable base ID |
| Trigger Response Generator | URL | Your n8n webhook URL |

#### Step-by-Step

1. **Get Active Restaurants node:**
   - Click on the node
   - Select your Airtable credentials
   - Enter your base ID
   - Verify filter formula: `AND({subscription_status}='Active', {status}='Active')`

2. **Fetch Reviews from Google node:**
   - Click on the node
   - Select your Google OAuth2 credentials
   - Test the connection

3. **Store New Reviews node:**
   - Configure Airtable credentials
   - Verify field mappings match your schema

4. **Trigger Response Generator node:**
   - Update URL to: `http://YOUR_N8N_INSTANCE/webhook/generate-response`
   - Replace with your actual n8n instance URL

---

### Workflow 2: Response Generator

**Purpose:** Generates AI responses when triggered by new reviews

#### Configuration Table

| Node | Setting | Value to Update |
|------|---------|----------------|
| Webhook Trigger | Path | `generate-response` (default) |
| Get Review Data | Credentials | Your Airtable token |
| Get Restaurant Profile | Credentials | Your Airtable token |
| Generate Response with Claude | Credentials | Your Anthropic API key |
| Store Generated Response | Credentials | Your Airtable token |

#### Step-by-Step

1. **Webhook Trigger:**
   - Note the webhook URL (will be shown after activation)
   - Use this URL in Workflow #1's "Trigger Response Generator" node

2. **Generate Response with Claude:**
   - Click on the node
   - Add Anthropic API credentials:
     - Credential Type: "Header Auth"
     - Name: `x-api-key`
     - Value: Your Anthropic API key
   - Verify model is `claude-sonnet-4-20250514`

3. **All Airtable nodes:**
   - Update base IDs
   - Verify table names match your schema

---

### Workflow 3: Approval Handler

**Purpose:** Sends weekly email digests for response approval

#### Configuration Table

| Node | Setting | Value to Update |
|------|---------|----------------|
| Get Active Restaurants | Credentials | Your Airtable token |
| Get Pending Responses | Credentials | Your Airtable token |
| Build Email Digest | Webhook URLs | Your n8n instance URLs |
| Send Email Digest | SMTP Credentials | Your email credentials |
| Send Email Digest | From Email | Your sender email |

#### Step-by-Step

1. **Build Email Digest node:**
   - Click on the node
   - Update all `YOUR_N8N_INSTANCE` URLs to your actual n8n URL
   - Example: `http://n8n.yourdomain.com/webhook/approve-response`

2. **Send Email Digest node:**
   - Configure SMTP credentials:
     - Host: Your SMTP server
     - Port: Usually 587 or 465
     - User: Your email address
     - Password: Your email password
   - Update `fromEmail` to your sender address

3. **Create Approval Webhook** (Additional Step):
   - Create a new workflow with webhook trigger
   - Path: `approve-response`
   - Handle approve/edit/reject actions
   - Update response status in Airtable

---

### Workflow 4: Post Scheduler

**Purpose:** Posts approved responses during business hours

#### Configuration Table

| Node | Setting | Value to Update |
|------|---------|----------------|
| Get Responses Ready to Post | Credentials | Your Airtable token |
| Get Restaurant OAuth | Credentials | Your Airtable token |
| Post Response to Google | Credentials | Your Google OAuth2 |
| All Update nodes | Credentials | Your Airtable token |

#### Step-by-Step

1. **Get Responses Ready to Post:**
   - Verify filter formula includes business hours check
   - Formula: `AND({approval_status}='Approved', {post_status}='Queued', {scheduled_post_time} <= NOW())`

2. **Post Response to Google:**
   - Configure Google OAuth2 credentials
   - Verify retry settings (3 retries, 60s delay)

3. **Error Handling:**
   - Verify "Update Response Status - Failed" node is connected
   - Test error logging to API_Usage_Logs table

---

### Workflow 5: Analytics Builder

**Purpose:** Calculates daily analytics for all restaurants

#### Configuration Table

| Node | Setting | Value to Update |
|------|---------|----------------|
| Get Active Restaurants | Credentials | Your Airtable token |
| Get All Reviews | Credentials | Your Airtable token |
| Store Analytics Snapshot | Credentials | Your Airtable token |
| Store Themes | Credentials | Your Airtable token |

#### Step-by-Step

1. **Calculate Analytics node:**
   - Review the JavaScript code
   - Verify it matches your analytics requirements
   - Customize theme keywords if needed

2. **Store Analytics Snapshot:**
   - Verify all field mappings
   - Test with a sample restaurant

3. **Store Themes:**
   - Configure theme categorization logic
   - Test sentiment detection

---

## ⚙️ Credentials Setup Guide

### 1. Airtable Personal Access Token

**Steps:**

1. Go to https://airtable.com/create/tokens
2. Click "Create new token"
3. Name: `n8n Restaurant Review AI`
4. Add scopes:
   - `data.records:read`
   - `data.records:write`
   - `schema.bases:read`
5. Add access to your specific base
6. Click "Create token"
7. Copy token immediately (shown only once)

**In n8n:**

1. Go to Credentials
2. Click "Add Credential"
3. Search for "Airtable"
4. Select "Airtable Personal Access Token"
5. Paste your token
6. Save

---

### 2. Google OAuth2 API

**Steps:**

1. Go to https://console.cloud.google.com/
2. Create new project or select existing
3. Enable APIs:
   - Google My Business API
   - Google Business Profile API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen (if not done)
6. Application type: "Web application"
7. Authorized redirect URIs:
   - Add: `https://YOUR_N8N_INSTANCE/rest/oauth2-credential/callback`
8. Copy Client ID and Client Secret

**In n8n:**

1. Go to Credentials
2. Click "Add Credential"
3. Search for "Google OAuth2 API"
4. Enter Client ID and Client Secret
5. Scopes: `https://www.googleapis.com/auth/business.manage`
6. Click "Connect my account"
7. Complete OAuth flow
8. Save

---

### 3. Anthropic API

**Steps:**

1. Go to https://console.anthropic.com/
2. Navigate to "API Keys"
3. Click "Create Key"
4. Copy the API key

**In n8n:**

1. Go to Credentials
2. Click "Add Credential"
3. Select "Header Auth"
4. Name: `Anthropic API`
5. Header name: `x-api-key`
6. Header value: Your API key
7. Save

---

### 4. SMTP Email

**Gmail Example:**

1. Enable 2-factor authentication on your Google account
2. Generate app password:
   - Go to Google Account → Security
   - 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Copy 16-character password

**In n8n:**

1. Go to Credentials
2. Click "Add Credential"
3. Search for "SMTP"
4. Configuration:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - SSL/TLS: Enable
   - User: Your Gmail address
   - Password: App password (16-char)
5. Save

---

## 🧪 Testing Guide

### Test Each Workflow Individually

#### Workflow 1: Review Monitor

1. **Manual Execution:**
   - Open workflow
   - Click "Execute Workflow"
   - Verify data flows through all nodes

2. **Expected Results:**
   - Active restaurants fetched from Airtable
   - Reviews fetched from Google for each restaurant
   - Spam reviews filtered out
   - Already-answered reviews excluded
   - New reviews stored in Airtable
   - Response Generator triggered for each new review

3. **Troubleshooting:**
   - If no reviews: Check Google Business Profile has reviews
   - If spam filter blocks all: Review spam detection logic
   - If API errors: Verify Google OAuth credentials

---

#### Workflow 2: Response Generator

1. **Manual Trigger:**
   - Use webhook URL
   - Send POST request with:
     ```json
     {
       "review_id": "YOUR_TEST_REVIEW_ID",
       "restaurant_id": "YOUR_TEST_RESTAURANT_ID"
     }
     ```

2. **Expected Results:**
   - Review data fetched
   - Restaurant profile loaded
   - Brand voice applied (if Pro tier)
   - AI response generated
   - Response stored in Airtable
   - Review marked as `response_generated: true`

3. **Verify:**
   - Check Generated_Responses table
   - Review AI response quality
   - Confirm word count is 50-150

---

#### Workflow 3: Approval Handler

1. **Manual Execution:**
   - Ensure you have pending responses in Airtable
   - Set approval_status to "Pending"
   - Execute workflow

2. **Expected Results:**
   - Email sent to restaurant owner
   - Email contains all pending responses
   - Approval links generated
   - Tokens stored in Approval_Tokens table

3. **Check Email:**
   - Verify HTML formatting
   - Test approve/edit/reject buttons
   - Confirm 72-hour deadline shown

---

#### Workflow 4: Post Scheduler

1. **Setup Test Data:**
   - Create approved response
   - Set `post_status` to "Queued"
   - Set `scheduled_post_time` to current time
   - Ensure current time is within business hours (9am-8pm)

2. **Manual Execution:**
   - Execute workflow
   - Watch response post to Google

3. **Expected Results:**
   - Business hours checked
   - Response posted to Google
   - Status updated to "Posted"
   - Review marked as answered
   - API usage logged

---

#### Workflow 5: Analytics Builder

1. **Manual Execution:**
   - Ensure you have review data
   - Execute workflow

2. **Expected Results:**
   - Analytics calculated for each restaurant
   - Snapshot stored in Analytics_Snapshots
   - Common themes extracted
   - Themes stored in Common_Themes table

3. **Verify Calculations:**
   - Check average rating accuracy
   - Verify rating change calculations
   - Review sentiment distribution
   - Confirm theme extraction

---

## 🔄 Activation Schedule

Activate workflows in this order:

| Order | Workflow | Activation | Notes |
|-------|----------|-----------|-------|
| 1 | Response Generator | Activate first | Must be ready to receive webhooks |
| 2 | Review Monitor | Activate second | Will trigger workflow #1 |
| 3 | Post Scheduler | Activate third | Processes approved responses |
| 4 | Analytics Builder | Activate fourth | Runs independently |
| 5 | Approval Handler | Activate last | Sends emails after responses generated |

**To Activate:**
1. Open workflow
2. Toggle "Active" switch in top right
3. Verify cron schedule is correct
4. Save

---

## 📊 Monitoring & Maintenance

### Daily Checks

- [ ] Check executions for errors (n8n dashboard)
- [ ] Verify email delivery rates
- [ ] Monitor API usage logs
- [ ] Review failed response posts

### Weekly Tasks

- [ ] Review approval rates
- [ ] Check AI response quality
- [ ] Verify analytics accuracy
- [ ] Monitor Airtable record counts

### Monthly Maintenance

- [ ] Review Google API quota usage
- [ ] Check Anthropic API credit usage
- [ ] Optimize slow workflows
- [ ] Update spam detection logic

---

## 🐛 Common Issues & Solutions

### Issue 1: "Credentials not found"

**Solution:**
1. Go to Settings → Credentials
2. Verify all credentials are saved
3. Re-connect OAuth credentials if needed
4. Update credential IDs in workflow nodes

### Issue 2: "Webhook not found"

**Solution:**
1. Ensure Response Generator workflow is active
2. Copy webhook URL from webhook node
3. Update URL in Review Monitor workflow
4. Test with manual POST request

### Issue 3: "Google API rate limit exceeded"

**Solution:**
1. Check API_Usage_Logs table
2. Reduce cron frequency if needed
3. Implement request queuing
4. Consider multiple Google projects

### Issue 4: "Emails not sending"

**Solution:**
1. Verify SMTP credentials
2. Check spam folder
3. Review email logs
4. Test with simple test email

### Issue 5: "Reviews not posting"

**Solution:**
1. Verify business hours check
2. Confirm Google OAuth scope includes posting
3. Check response text doesn't violate Google policies
4. Review API error logs

---

## 🔐 Security Best Practices

### Environment Variables

Store sensitive data in n8n environment variables:

1. Go to Settings → Variables
2. Add variables:
   - `AIRTABLE_BASE_ID`
   - `N8N_INSTANCE_URL`
   - `SMTP_FROM_EMAIL`

3. Reference in workflows: `{{$env.VARIABLE_NAME}}`

### Credential Rotation

- Rotate Airtable tokens every 90 days
- Refresh Google OAuth tokens regularly
- Update Anthropic API keys if compromised
- Change SMTP passwords periodically

### Access Control

- Limit n8n user access
- Use separate credentials for production
- Enable audit logging
- Review execution history regularly

---

## 📈 Performance Optimization

### Workflow Performance

| Workflow | Expected Duration | Optimization Tips |
|----------|------------------|-------------------|
| Review Monitor | 2-5 min | Batch process restaurants |
| Response Generator | 5-15 sec | Cache brand voice profiles |
| Approval Handler | 1-3 min | Pre-build email templates |
| Post Scheduler | 10-30 sec | Parallel processing |
| Analytics Builder | 3-10 min | Incremental calculations |

### Database Optimization

- Index frequently queried fields in Airtable
- Archive old analytics snapshots
- Limit review history to 2 years
- Use views to pre-filter data

---

## 🎯 Next Steps

After successfully implementing all workflows:

1. **Test with Pilot Restaurant:**
   - Onboard 1 test restaurant
   - Run through complete workflow cycle
   - Validate end-to-end functionality

2. **Optimize Based on Results:**
   - Adjust AI prompts for better responses
   - Fine-tune spam detection
   - Optimize business hours logic

3. **Scale to Production:**
   - Onboard 3 pilot restaurants
   - Monitor performance
   - Gather feedback
   - Iterate and improve

4. **Consider Migration:**
   - At 20 customers, evaluate migration from MindStudio to n8n
   - Plan Airtable to Supabase migration
   - Implement advanced features

---

## 📞 Support Resources

- **n8n Documentation:** https://docs.n8n.io/
- **n8n Community:** https://community.n8n.io/
- **Google My Business API:** https://developers.google.com/my-business
- **Anthropic API Docs:** https://docs.anthropic.com/
- **Airtable API:** https://airtable.com/developers/web/api

---

## ✅ Implementation Checklist

Use this checklist to track your progress:

### Setup Phase
- [ ] n8n instance running
- [ ] Airtable base created with schema
- [ ] Google Cloud project configured
- [ ] Anthropic API key obtained
- [ ] SMTP credentials ready

### Credentials Phase
- [ ] Airtable credentials configured
- [ ] Google OAuth2 credentials configured
- [ ] Anthropic API credentials configured
- [ ] SMTP credentials configured

### Import Phase
- [ ] Workflow 1 imported
- [ ] Workflow 2 imported
- [ ] Workflow 3 imported
- [ ] Workflow 4 imported
- [ ] Workflow 5 imported

### Configuration Phase
- [ ] Workflow 1 configured and tested
- [ ] Workflow 2 configured and tested
- [ ] Workflow 3 configured and tested
- [ ] Workflow 4 configured and tested
- [ ] Workflow 5 configured and tested

### Activation Phase
- [ ] All workflows activated
- [ ] Cron schedules verified
- [ ] Webhook URLs updated
- [ ] Error handling tested

### Production Phase
- [ ] Pilot restaurant onboarded
- [ ] End-to-end test completed
- [ ] Monitoring dashboard set up
- [ ] Ready for launch!

---

**Good luck with your implementation!** 🎉

If you encounter any issues not covered in this guide, refer to the n8n documentation or reach out to the n8n community for support.
