# Quick Reference: n8n Workflows

## 📁 Files Included

| File Name | Type | Import Order | Purpose |
|-----------|------|--------------|---------|
| `6-onboarding-workflow.json` | n8n Workflow | 1st | New restaurant signup & setup |
| `7-google-oauth-callback.json` | n8n Workflow | 2nd | Handles Google OAuth authorization |
| `1-review-monitor-workflow.json` | n8n Workflow | 3rd | Fetches new Google reviews weekly |
| `2-response-generator-workflow.json` | n8n Workflow | 4th | Generates AI responses with Claude |
| `3-approval-handler-workflow.json` | n8n Workflow | 7th | Sends weekly approval emails |
| `4-post-scheduler-workflow.json` | n8n Workflow | 5th | Posts approved responses hourly |
| `5-analytics-builder-workflow.json` | n8n Workflow | 6th | Calculates daily analytics |
| `IMPLEMENTATION_GUIDE.md` | Documentation | - | Complete setup instructions |
| `ONBOARDING_FLOW_GUIDE.md` | Documentation | - | Restaurant onboarding flow details |
| `QUICK_REFERENCE.md` | Documentation | - | This file |

## 🚀 Quick Start (5 Steps)

### Step 1: Import All Workflows
```
1. Open n8n
2. Click "Add Workflow" → "Import from File"
3. Import all 7 JSON files (6, 7, 1, 2, 3, 4, 5)
```

### Step 2: Set Up Credentials
```
Required credentials:
✓ Airtable Personal Access Token
✓ Google OAuth2 Client ID & Secret
✓ Anthropic API (Header Auth)
✓ SMTP Email
```

### Step 3: Update Configuration
```
In EACH workflow, update:
- YOUR_AIRTABLE_BASE_ID → Your actual base ID
- YOUR_GOOGLE_CLIENT_ID → Your OAuth client ID
- YOUR_GOOGLE_CLIENT_SECRET → Your OAuth secret
- YOUR_N8N_INSTANCE → Your n8n URL
- All credential references
```

### Step 4: Test Each Workflow
```
1. Manual execution
2. Check outputs
3. Verify data in Airtable
```

### Step 5: Activate in Order
```
CRITICAL ORDER (prevents webhook 404 errors):
1. Workflow 6 - Onboarding (webhook: /onboard-restaurant)
2. Workflow 7 - OAuth Callback (webhook: /google-oauth-callback)
3. Workflow 2 - Response Generator (webhook ready first!)
4. Workflow 1 - Review Monitor (triggers workflow 2)
5. Workflow 4 - Post Scheduler
6. Workflow 5 - Analytics Builder
7. Workflow 3 - Approval Handler
2. Review Monitor (triggers #1)
3. Post Scheduler (processes approvals)
4. Analytics Builder (independent)
5. Approval Handler (sends emails)
```

## 🔧 Key Configuration Points

### Workflow 1: Review Monitor
- **Cron:** `0 6 * * 1` (Monday 6am)
- **Update:** Webhook URL to trigger Response Generator
- **Update:** Airtable credentials and base ID

### Workflow 2: Response Generator
- **Webhook:** `/webhook/generate-response`
- **Update:** Anthropic API credentials
- **Update:** All Airtable nodes

### Workflow 3: Approval Handler
- **Cron:** `0 9 * * 1` (Monday 9am)
- **Update:** All n8n URLs in email template
- **Update:** SMTP credentials and sender email

### Workflow 4: Post Scheduler
- **Cron:** `0 * * * *` (Every hour)
- **Update:** Google OAuth2 credentials
- **Check:** Business hours logic (9am-8pm)

### Workflow 5: Analytics Builder
- **Cron:** `0 2 * * *` (Daily 2am)
- **Update:** Airtable credentials
- **Review:** Analytics calculation logic

## 📊 Expected Data Flow

```
Monday 6am:  Review Monitor runs
             ↓
             Fetches new reviews from Google
             ↓
             Triggers Response Generator for each review
             ↓
             AI generates responses
             ↓
Monday 9am:  Approval Handler runs
             ↓
             Sends email digest to restaurant owners
             ↓
Owner clicks "Approve"
             ↓
Hourly:      Post Scheduler checks for approved responses
             ↓
             Posts during business hours (9am-8pm)
             ↓
Daily 2am:   Analytics Builder runs
             ↓
             Calculates metrics for dashboard
```

## 🎯 Testing Checklist

Before going live:

- [ ] All 5 workflows imported
- [ ] All credentials configured
- [ ] All IDs/URLs updated
- [ ] Manual test of each workflow successful
- [ ] Email delivery tested
- [ ] Google posting tested
- [ ] Analytics accurate
- [ ] Error handling works
- [ ] Workflows activated in correct order

## 🐛 Quick Troubleshooting

| Problem | Quick Fix |
|---------|-----------|
| "Credentials not found" | Re-save credentials in Settings → Credentials |
| Webhook 404 error | Ensure Response Generator is ACTIVE |
| Google API error | Check OAuth scope includes `business.manage` |
| Email not sending | Verify SMTP credentials and test connection |
| Reviews not posting | Check business hours and approval status |

## 📈 Performance Benchmarks

| Workflow | Expected Time | Records Processed |
|----------|---------------|-------------------|
| Review Monitor | 2-5 minutes | 50-100 reviews |
| Response Generator | 5-15 seconds | 1 review |
| Approval Handler | 1-3 minutes | 10-50 responses |
| Post Scheduler | 10-30 seconds | 5-20 responses |
| Analytics Builder | 3-10 minutes | All reviews |

## 🔗 Important URLs to Update

When configuring, replace these placeholders:

| Placeholder | Example Replacement |
|-------------|---------------------|
| `YOUR_AIRTABLE_BASE_ID` | `appXXXXXXXXXXXXXX` |
| `YOUR_N8N_INSTANCE` | `https://n8n.yourdomain.com` |
| `YOUR_AIRTABLE_CREDENTIALS` | Select from dropdown |
| `YOUR_GOOGLE_OAUTH_CREDENTIALS` | Select from dropdown |
| `YOUR_ANTHROPIC_CREDENTIALS` | Select from dropdown |
| `YOUR_SMTP_CREDENTIALS` | Select from dropdown |

## 📞 Need Help?

1. **Check Implementation Guide:** See `IMPLEMENTATION_GUIDE.md` for detailed instructions
2. **Review PRD:** See your project's `docs/prd.md` for business logic
3. **Check Database Schema:** See `database/airtable-schema.md` for data structure
4. **n8n Community:** https://community.n8n.io/
5. **n8n Docs:** https://docs.n8n.io/

## ✅ Success Criteria

You've successfully implemented when:

✓ All 5 workflows show "Active" status
✓ Review Monitor fetches reviews successfully  
✓ Response Generator creates quality AI responses
✓ Approval emails are received and formatted correctly
✓ Responses post to Google during business hours
✓ Analytics dashboard shows accurate metrics
✓ No critical errors in execution history
✓ Pilot restaurant onboarded and working end-to-end

---

**Ready to launch!** 🚀

For detailed setup instructions, configuration guides, and troubleshooting, refer to `IMPLEMENTATION_GUIDE.md`.
