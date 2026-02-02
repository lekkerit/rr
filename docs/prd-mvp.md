# Product Requirements Document (PRD) - MVP
## Google Review Bot

**Version:** 1.0
**Last Updated:** February 2, 2026
**Status:** MVP Development

---

## Overview

A simple bot that monitors Google Business Profile reviews and generates AI-powered responses.

### Problem
Restaurant owners don't have time to respond to Google reviews, hurting their ratings and reputation.

### Solution
Automated system that:
1. Fetches new reviews from Google Business Profile
2. Generates appropriate responses using Claude AI
3. Posts responses back to Google

---

## Scope

### In Scope (MVP)
- Single restaurant support
- Google My Business API integration
- AI response generation (Claude Sonnet)
- Direct posting (no approval workflow)
- Basic logging

### Out of Scope (Future)
- Multiple restaurants/locations
- Human approval workflow
- Analytics dashboard
- Brand voice customization
- Tiered pricing
- Email notifications
- Strategic posting delays

---

## Workflows

### Workflow 1: Review Monitor
**Trigger:** Manual or scheduled (weekly cron)

```
1. Authenticate with Google My Business API
2. Fetch reviews from last 7 days
3. Filter out:
   - Already responded reviews
   - Spam reviews
4. Store new reviews in database
5. Trigger Workflow 2 for each new review
```

**Input:** Google Business Profile ID, OAuth token
**Output:** List of new reviews requiring responses

---

### Workflow 2: Response Generator & Poster
**Trigger:** Called by Workflow 1 for each new review

```
1. Receive review data (rating, text, reviewer name)
2. Generate response using Claude AI
3. Post response to Google via API
4. Log result (success/failure)
```

**AI Prompt Template:**
```
You are responding to a Google Maps review for a restaurant.

Review:
- Rating: {rating} stars
- Text: "{review_text}"
- Reviewer: {reviewer_name}

Write a professional, friendly response that:
- Thanks the customer
- Addresses specific points they mentioned
- Is 50-100 words
- Sounds human, not robotic

Response:
```

**Input:** Review object
**Output:** Posted response confirmation

---

## Technical Requirements

### Google My Business API
- OAuth 2.0 authentication
- Endpoints:
  - `accounts.locations.reviews.list` - Fetch reviews
  - `accounts.locations.reviews.updateReply` - Post response
- Rate limit: 1,500 requests/day

### AI Integration
- Model: Claude Sonnet 4.5
- Max tokens: 200 per response
- Fallback: Generic "Thank you for your feedback" if AI fails

### Database (Airtable)
**Reviews Table:**
| Field | Type |
|-------|------|
| id | Auto |
| google_review_id | Text |
| rating | Number |
| review_text | Long text |
| reviewer_name | Text |
| review_date | Date |
| response_text | Long text |
| response_posted | Checkbox |
| created_at | Date |

---

## Success Criteria

- [ ] Successfully fetch reviews from Google API
- [ ] Generate coherent AI responses for 1-5 star reviews
- [ ] Post responses back to Google
- [ ] No duplicate responses
- [ ] Log all actions for debugging

---

## Timeline

**Week 1:**
- [ ] Google OAuth integration
- [ ] Review fetching workflow
- [ ] Database setup

**Week 2:**
- [ ] AI response generation
- [ ] Response posting
- [ ] End-to-end testing with real restaurant

---

## Risks

| Risk | Mitigation |
|------|------------|
| Google API access revoked | Monitor API errors, manual fallback |
| AI generates bad response | Review logs, add content filters |
| Rate limit exceeded | Batch processing, respect quotas |

---

## Future Enhancements (Post-MVP)
1. Human approval before posting
2. Email notifications
3. Analytics dashboard
4. Brand voice customization
5. Multi-location support
