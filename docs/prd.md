# Product Requirements Document (PRD)
## AI-Powered Google Review Management for Restaurants

**Version:** 2.0
**Last Updated:** February 14, 2026
**Status:** MVP Development

---

## Executive Summary

### Product Vision
An AI-powered service that helps successful restaurants (4.0-4.5 stars) convert Google reviews into reservations through professional, automated response management.

### Problem Statement
Restaurants rated 4.0-4.5 stars receive steady review volume but lack time to respond professionally. Unanswered reviews mean missed opportunities to convert browsers into bookers. These restaurants have the budget and motivation to invest in growth — they just need the right tool.

### Solution Overview
An automated service that:
1. Monitors Google Business Profile for new reviews (weekly batch processing)
2. Generates professional, growth-focused responses using Claude AI
3. Posts responses directly to Google (MVP) or via approval workflow (future)
4. Tracks booking conversion impact and ROI

### Success Metrics (6-Month Target)
- **Customers:** 50+ restaurants signed
- **MRR:** €6,980+
- **Response Rate:** 95%+ of reviews receive responses
- **Booking Conversion:** 30%+ increase in reservation inquiries
- **Client Retention:** 90%+ monthly

---

## Target Market

### Primary Audience
**Growth-Focused Restaurants in Het Gooi Region, Netherlands**
- Location: Hilversum, Bussum, Naarden, Laren, Huizen (171 prospects)
- Current Rating: 4.0-4.5 stars on Google Maps
- Size: Independent restaurants, 5-50 employees
- Profile: Established, profitable, ready to invest in growth
- Pain Point: No time to respond to reviews professionally, missing reservation opportunities

### Pricing
**€149/month** — Professional review management
- All reviews monitored and responded to
- Growth-focused AI responses (booking language, return visit invitations)
- ROI: €900+ in estimated additional monthly revenue

---

## Core Features

### 1. Google Business Profile Integration
**Priority:** P0 (Critical)

- OAuth 2.0 authentication (Manager access level)
- Fetch reviews via Google My Business API v4.9+
- Filter out spam and already-responded reviews
- Weekly batch processing (Monday 6am)
- Rate limit handling (1,500 requests/day)
- Automatic OAuth token refresh

### 2. AI Response Generation
**Priority:** P0 (Critical)

- Model: Claude Sonnet 4.5
- Growth-focused response framework:
  - **For positive reviews (4-5 stars):** Thank sincerely, reference specifics, invite return visit, suggest booking
  - **For mixed reviews (3 stars):** Acknowledge feedback, highlight positives, invite to experience improvements
  - **For negative reviews (1-2 stars):** Apologize professionally, address issues, offer direct contact
- All responses include reservation/booking language
- Professional, warm tone (growth-focused)
- 50-150 words per response
- Dutch language support (primary) + English
- Fallback to generic template if AI fails
- Max 3 retries per generation

### 3. Response Posting
**Priority:** P0 (Critical)

- Direct posting via Google My Business API (MVP — no approval workflow)
- Response status tracking (queued, posted, failed)
- Automatic retry for failed posts (max 3 attempts)
- Basic logging of all actions

### 4. Workflow Automation (n8n)
**Priority:** P0 (Critical)

**Workflow 1 — Review Monitor:**
```
Trigger: Weekly cron (Monday 6am)
→ Authenticate with Google My Business API
→ Fetch reviews from last 7 days
→ Filter out spam + already-responded
→ Store new reviews in Airtable
→ Trigger Workflow 2 for each new review
```

**Workflow 2 — Response Generator & Poster:**
```
Trigger: Called by Workflow 1
→ Receive review data (rating, text, reviewer name)
→ Generate response using Claude AI
→ Post response to Google via API
→ Log result in Airtable
```

### 5. Database (Airtable MVP)
**Priority:** P0 (Critical)

See [airtable-schema.md](../database/airtable-schema.md) for full schema.

Core tables: Reviews, Restaurants, Performance Metrics, Waitlist

Migration path: Airtable → Supabase PostgreSQL at 20+ customers.

---

## Technical Architecture

```
┌─────────────────────┐
│   Landing Pages     │
│  (GitHub Pages)     │
└──────────┬──────────┘
           │
┌──────────▼──────────┐
│    n8n Workflows    │
├─────────────────────┤
│ • Review Monitor    │
│ • Response Gen+Post │
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
┌───▼────┐   ┌───▼──────┐
│ Google │   │ Airtable │
│My Biz  │   │ Database │
│  API   │   │          │
└────────┘   └──────────┘
```

### Tech Stack
- **AI:** Claude Sonnet 4.5 (via Anthropic API)
- **Automation:** n8n (cloud-hosted)
- **Database:** Airtable (MVP) → Supabase (scale)
- **API:** Google My Business API (OAuth 2.0)
- **Hosting:** GitHub Pages (static site)
- **Forms:** Typeform (waitlist capture)
- **Domain:** reviewrecovery.nl

---

## AI Prompt Template

```
You are responding to a Google Maps review for {restaurant_name},
a successful restaurant in {location}.

Review Details:
- Star Rating: {rating}
- Review Text: "{review_text}"
- Reviewer Name: {reviewer_name}

Generate a professional, warm response that:
1. Thanks the customer sincerely
2. References specific details from their review
3. Includes a natural invitation to return or book again
4. Is 50-150 words
5. Sounds authentic and human (not templated)
6. Uses {language} (Dutch or English, matching the review)

Response:
```

---

## Data Model (Key Fields)

### Review Record
```javascript
{
  google_review_id: "ChIJ...",
  reviewer_name: "Sarah M.",
  star_rating: 5,
  review_text: "Best pizza in town!",
  review_date: "2026-01-20T18:30:00Z",
  response_text: "Thank you so much, Sarah!...",
  response_posted: true,
  conversion_tracked: false,
  response_tone: "professional"
}
```

---

## Timeline

**Week 1:**
- [ ] Google OAuth integration
- [ ] Review fetching workflow (n8n)
- [ ] Airtable database setup

**Week 2:**
- [ ] AI response generation
- [ ] Response posting workflow
- [ ] End-to-end testing with real restaurant

---

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Google API access revoked | Monitor errors, manual fallback |
| AI generates poor response | Content filters, logging, fallback templates |
| Rate limit exceeded | Batch processing, respect quotas |
| Low conversion from reviews | Track metrics, optimize response language |

---

## Future Enhancements (Post-MVP)
1. Human approval workflow before posting
2. Brand voice customization per restaurant
3. Analytics dashboard with ROI tracking
4. Multi-location support
5. Strategic posting delays (human-like timing)
6. Email digest notifications
7. TripAdvisor / TheFork integration
