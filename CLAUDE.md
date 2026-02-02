# Google Review Bot - Internal Documentation

## Project Overview

Simple bot that monitors Google Business Profile reviews and auto-generates AI responses.

---

## 🎯 Active Scope: MVP

**PRD:** `docs/prd-mvp.md`
**Workflows:** `workflows/mvp-1-*.json`, `workflows/mvp-2-*.json`
**Database:** `database/airtable-schema-mvp.md`

> Full-featured PRD available at `docs/prd.md` (deferred scope)

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

## Workflows (2 total)

### 1. Review Monitor (`mvp-1-review-monitor.json`)
```
Weekly Cron → Fetch Google Reviews → Filter Unanswered → Store in Airtable → Trigger #2
```
**Nodes:** 5

### 2. Response Generator & Poster (`mvp-2-response-generator-poster.json`)
```
Webhook → Extract Data → Claude AI → Post to Google → Update Airtable → Done
```
**Nodes:** 7

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

## Lead Capture (Already Built)

| Component | File | Status |
|-----------|------|--------|
| Landing page | `index.html` | Live |
| Typeform waitlist | External (linked from landing page) | Live |
| Waitlist workflow | `workflows/8-typeform-waitlist-workflow.json` | Ready |
| Waitlist schema | `database/airtable-schema.md` (Waitlist table) | Defined |
| Ads copy | `marketing/ads-copy.md` | Ready |

**Flow:** Ads → Landing page → Typeform → n8n webhook → Airtable Waitlist

**Goal:** 50-60 applicants for market validation

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

### Archived (Full Scope)
| File | Purpose |
|------|---------|
| `docs/prd.md` | Full PRD (deferred) |
| `workflows/1-review-monitor-workflow.json` | Original workflow |
| `workflows/2-response-generator-workflow.json` | Original workflow |
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

1. Add Anthropic credentials to n8n
2. Import `mvp-1-review-monitor.json` to n8n
3. Import `mvp-2-response-generator-poster.json` to n8n
4. Replace `YOUR_*` placeholders with real values
5. Test end-to-end with one review

---

**Last Updated:** February 2, 2026
**Active Scope:** MVP (2 workflows)
