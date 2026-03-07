# Architecture — Review Recovery

## Pipeline A: Review Monitor & Response

The core product pipeline. Runs weekly per restaurant.

```
GBP API
  │  (OAuth 2.0, google_refresh_token_encrypted)
  ▼
n8n — Weekly Trigger
  │  workflows/mvp-1-review-monitor.json
  ▼
Airtable: Reviews table
  │  (store raw review data, sentiment analysis)
  ▼
Claude Sonnet 4.5
  │  tools/prompts/review-response.md
  │  + Brand_Voice_Profiles context
  ▼
Airtable: Generated_Responses (approval_status: Pending)
  ▼
Email Digest → Restaurant Owner
  │  (Approval_Emails table tracks delivery)
  ▼
Owner approves / edits / rejects
  ▼
Airtable: Generated_Responses (approval_status: Approved/Edited)
  ▼
n8n — Post workflow
  │  workflows/mvp-2-response-generator-poster.json
  ▼
GBP API (post response)
  ▼
Airtable: Generated_Responses (post_status: Posted)
         Reviews (response_posted: true)
```

**Key env vars:** `ANTHROPIC_API_KEY`, `AIRTABLE_API_KEY`, `AIRTABLE_BASE_ID`, Google OAuth credentials

---

## Pipeline B: Outreach & Onboarding

Prospecting pipeline to acquire new restaurant customers.

```
Walk-in visit (Het Gooi region)
  ▼
WhatsApp follow-up
  │  tools/prompts/outreach-whatsapp.md
  ▼
Typeform signup (waitlist)
  │  workflows/8-typeform-waitlist-workflow.json
  ▼
Airtable: Waitlist (application_status: New)
  ▼
Manual review → Approved
  ▼
Onboarding (see docs/runbooks/deploy-new-client.md)
  ▼
Airtable: Restaurants (status: Active)
```

**Lead research (supplementary):**
```
Apify — Google Maps scraper
  ▼
prospects.csv (projects/whatsapp-outreach/)
  ▼
Airtable: Waitlist
```

---

## Tech Stack Summary

| Layer | Tool | Purpose |
|---|---|---|
| AI | Claude Sonnet 4.5 | Review response generation |
| Database | Airtable → Supabase (20+ clients) | All persistent data |
| Automation | n8n (cloud) | Workflow orchestration |
| Review source | GBP API (OAuth 2.0) | Fetch + post reviews |
| Outreach | Walk-in + WhatsApp | New customer acquisition |
| Lead research | Apify (Google Maps) | Prospect discovery |
| Demo | Next.js on Vercel | Sales tool |

---

## File References

| Component | Path |
|---|---|
| Review monitor workflow | `workflows/mvp-1-review-monitor.json` |
| Response generator workflow | `workflows/mvp-2-response-generator-poster.json` |
| Typeform waitlist workflow | `workflows/8-typeform-waitlist-workflow.json` |
| Review fetch script | `scripts/fetch_reviews.py` |
| Sentiment analysis | `scripts/analyse_sentiment.py` |
| WA outreach script | `projects/whatsapp-outreach/wa-outreach.js` |
| Demo app | `demo/` |
