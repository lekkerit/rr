# Airtable Schema — Quick Reference

Full schema: `docs/airtable-schema.md`

## Tables (exact names)

| Table | Purpose |
|---|---|
| `Restaurants` | Core profiles, OAuth tokens, subscription status |
| `Brand_Voice_Profiles` | Per-restaurant tone/personality settings |
| `Reviews` | Raw GBP review data + sentiment metadata |
| `Generated_Responses` | AI responses + approval workflow |
| `Analytics_Snapshots` | Daily metrics per restaurant |
| `Common_Themes` | Topic trends across reviews |
| `API_Usage_Logs` | Google API call tracking |
| `Approval_Emails` | Email digest delivery tracking |
| `Waitlist` | Typeform applicant queue |

## Key Fields

### Restaurants
- `restaurant_id` (primary), `restaurant_name`, `owner_email`
- `google_business_profile_id` — Google location ID
- `google_refresh_token_encrypted` — encrypted OAuth token
- `subscription_status`: `Trial` | `Active` | `Paused` | `Cancelled`
- `status`: `Onboarding` | `Active` | `Suspended`
- `timezone`: `Europe/Amsterdam`

### Brand_Voice_Profiles
- `restaurant` (link → Restaurants)
- `tone`: `Very Formal` | `Professional but Warm` | `Casual and Friendly` | `Very Casual`
- `personality` (multi-select): `Formal`, `Casual`, `Fun & Playful`, `Traditional`, `Family-Friendly`, etc.
- `emoji_usage`: `Never` | `Rarely` | `Sometimes` | `Often`
- `self_reference`: `We` | `Restaurant Name` | `Owner Name`
- `response_length_preference`: `Brief` | `Moderate` | `Detailed`
- `signature_phrases` (JSON array), `prohibited_words` (JSON array)

### Reviews
- `review_id` (primary), `restaurant` (link), `reviewer_name`
- `star_rating`: `1 Star` | `2 Stars` | `3 Stars` | `4 Stars` | `5 Stars`
- `review_text`, `review_date`, `retrieved_at`
- `sentiment`: `Positive` | `Neutral` | `Negative`
- `language_detected`: `Dutch` | `English` | `Other`
- `is_spam` (checkbox), `is_answered` (checkbox)

### Generated_Responses
- `response_id` (primary), `review` (link), `restaurant` (link)
- `generated_text`, `ai_model_used` (e.g. `claude-sonnet-4.5`)
- `approval_status`: `Pending` | `Approved` | `Edited` | `Rejected`
- `post_status`: `Queued` | `Posted` | `Failed` | `Cancelled`
- `edited_text` (if owner edited), `rejection_reason`

**Status flow:**
```
Pending → Approved | Edited | Rejected
Approved/Edited → Queued → Posted | Failed
```

### Waitlist
- `application_status`: `New` | `Under Review` | `Approved` | `Rejected` | `Onboarded`
- `current_rating`: `4.0-4.2 stars` | `4.3-4.5 stars`
- `source`: `Typeform` | `Direct` | `Referral`

## Relationships
```
Restaurants (1) → Reviews (Many)
Restaurants (1) → Generated_Responses (Many)
Restaurants (1) → Brand_Voice_Profiles (1)
Restaurants (1) → Analytics_Snapshots (Many)
Reviews (1) → Generated_Responses (1)
```

## Migration Trigger
Migrate Airtable → Supabase PostgreSQL at **20 customers**.
