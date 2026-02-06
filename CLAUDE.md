# Google Review Bot - Internal Documentation

## Project Overview

**PIVOTED:** Professional review management system that helps successful restaurants (4.0-4.5★) convert more reviews into reservations through AI-generated responses.

**Key Pivot:** From "fixing struggling restaurants" to "helping successful restaurants grow"

---

## 🎯 Active Scope: PIVOTED MVP

**Market Analysis:** `docs/review-recovery-pivot-analysis.md`
**Target:** 4.0-4.5 star restaurants in Het Gooi region
**Value Prop:** "Turn reviews into reservations" - €349/month
**ROI:** +35% booking conversion rate through professional responses

---

## MVP Features

| Feature | Status |
|---------|--------|
| Google My Business API | In Progress |
| Fetch reviews | To Do |
| AI response generation (Claude) | To Do |
| Post responses to Google | To Do |
| Basic logging | To Do |

### Out of Scope (MVP)
- Multi-restaurant support
- Human approval workflow
- Email notifications
- Analytics dashboard
- Brand voice customization
- Tiered pricing
- Strategic posting delays

---

## Workflows (3 active)

All active workflows live in `workflows/`. Old full-scope workflows are in `workflows/archived/`.

### 1. Review Monitor (`mvp-1-review-monitor.json`)
```
Weekly Cron → Fetch Google Reviews → Split Reviews → Filter Unanswered → Check Duplicate → Only New → Prepare Data → Store in Airtable → Trigger #2
```
**Nodes:** 10 | **API:** `mybusiness.googleapis.com/v4`

### 2. Response Generator & Poster (`mvp-2-response-generator-poster.json`)
```
Webhook → Extract Data → Claude AI → AI OK? → [Extract Response | Fallback] → Post to Google → Update Airtable → Respond OK
```
**Nodes:** 9 | **Fallback:** Generic response if Claude fails

### 3. Typeform Waitlist (`8-typeform-waitlist-workflow.json`)
```
Webhook (Typeform) → Transform Data → Create Airtable Record → Send Email → Respond
```
**Nodes:** 5

---

## Database (1 table)

**Table: Reviews**
| Field | Type |
|-------|------|
| google_review_id | Text |
| reviewer_name | Text |
| rating | Select |
| review_text | Long Text |
| response_text | Long Text |
| response_posted | Checkbox |

---

## Target Market (PIVOTED)

**Country:** Netherlands
**Region:** Het Gooi (Hilversum, Bussum, Naarden, Laren, Huizen)
**Target:** Successful restaurants with 4.0-4.5 stars on Google Maps
**Market Size:** ~171 restaurants across the region
**Pricing:** €349-549/month (growth-focused, not damage control)

---

## Lead Capture (Already Built)

| Component | File | Status |
|-----------|------|--------|
| Landing page (EN) | `index.html` | Live |
| Landing page (NL) | `nl.html` | Live |
| Typeform waitlist | External (linked from landing pages) | Live |
| Waitlist workflow | `workflows/8-typeform-waitlist-workflow.json` | Ready |
| Waitlist schema | `database/airtable-schema.md` (Waitlist table) | Defined |
| Ads copy | `marketing/ads-copy.md` | Ready |
| IG outreach playbook | `marketing/ig-outreach-playbook.md` | Ready |
| Response preview tool | `tools/response-preview.html` | Ready |
| Logo generator | `tools/logo-generator.html` | Ready |

**Outreach Flow:** Find restaurant on Google Maps → Find their IG → DM via @reviewrecovery → Send response previews → Typeform → Payment → Onboarding

**Waitlist Flow:** Ads → Landing page (nl.html) → Typeform → n8n webhook → Airtable Waitlist

**Goal:** 100 restaurants contacted → 10 customers signed

---

## Setup Checklist

- [ ] Google Cloud Console project with My Business API enabled
- [ ] OAuth 2.0 credentials configured
- [ ] Airtable base with Reviews table
- [ ] n8n instance running
- [ ] Anthropic API key

### Credentials Needed
1. **Google OAuth2** - For My Business API
2. **Anthropic API** - For Claude responses
3. **Airtable Token** - For database

---

## Key Files

| File | Purpose |
|------|---------|
| `docs/prd-mvp.md` | Active requirements |
| `workflows/mvp-1-review-monitor.json` | n8n workflow #1 |
| `workflows/mvp-2-response-generator-poster.json` | n8n workflow #2 |
| `database/airtable-schema-mvp.md` | Database setup |

### Archived (Full Scope — `workflows/archived/`)
| File | Purpose |
|------|---------|
| `docs/prd.md` | Full PRD (deferred) |
| `workflows/archived/0-onboarding-workflow.json` | Original onboarding |
| `workflows/archived/1-review-monitor-workflow.json` | Original review monitor |
| `workflows/archived/2-response-generator-workflow.json` | Original response generator |
| `workflows/archived/3-approval-handler-workflow.json` | Human approval (V2) |
| `workflows/archived/4-post-scheduler-workflow.json` | Scheduled posting (V2) |
| `workflows/archived/5-analytics-builder-workflow.json` | Analytics (V2) |
| `workflows/archived/6-google-oauth-callback-UPDATED.json` | OAuth callback (V2) |
| `database/airtable-schema.md` | Full schema |

---

## Quick Commands

```bash
# Test Anthropic API
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-sonnet-4-20250514","max_tokens":100,"messages":[{"role":"user","content":"test"}]}'
```

---

## Next Steps

1. Create Reviews table in Airtable (see Database section for fields)
2. Add Anthropic credits at console.anthropic.com/settings/billing
3. Import 3 active workflows to n8n (manually until first customer)
4. Configure credentials in n8n (Google OAuth2, Anthropic, Airtable)
5. Set n8n environment variables: `GOOGLE_BUSINESS_ACCOUNT_ID`, `GOOGLE_BUSINESS_LOCATION_ID`
6. Test end-to-end with one review

---

**Last Updated:** February 5, 2026
**Active Scope:** MVP (3 workflows)
