# Airtable Database Schema

## Overview
Database schema for Restaurant Review Response Automation using Airtable as the data store. Designed for quick setup with migration path to Supabase for production scaling. Targets 4.0-4.5 star restaurants in Het Gooi region, Netherlands.

## Schema Design Principles
- Normalized tables with clear relationships
- All sensitive data encrypted (Google tokens, PII)
- Growth-focused metrics (conversion tracking, booking inquiries, ROI)
- Analytics-ready structure for reporting
- Migration-friendly field types

---

## Table 1: Restaurants

**Purpose:** Core restaurant profile and subscription data
**Record Limit:** ~50 restaurants for MVP (well under Airtable's 1,200 record limit)

### Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `restaurant_id` | Single line text (Primary) | Yes | Unique identifier | `rest_2Jk9XmN4` |
| `restaurant_name` | Single line text | Yes | Business name | `Bella Italia Restaurant` |
| `owner_name` | Single line text | Yes | Owner/contact name | `Marco Rossi` |
| `owner_email` | Email | Yes | Primary contact email | `marco@bellaitalia.com` |
| `phone_number` | Phone number | No | Restaurant phone | `(555) 123-4567` |
| `address` | Long text | No | Full business address | `123 Main St, New York, NY 10001` |
| `timezone` | Single select | Yes | Local timezone for posting | `America/New_York` |
| `google_business_profile_id` | Single line text | Yes | Google location ID | `ChIJN1t_tDeuEmsRUsoyG83frY4` |
| `google_refresh_token_encrypted` | Long text | Yes | Encrypted OAuth refresh token | `encrypted:AES256:...` |
| `google_access_token_encrypted` | Long text | No | Encrypted current access token | `encrypted:AES256:...` |
| `google_token_expires_at` | Date & time | No | Token expiry timestamp | `2026-01-27 15:30:00` |
| `target_rating` | Single select | Yes | Client segment | `GROWTH_FOCUSED`, `MAINTENANCE` |
| `subscription_status` | Single select | Yes | Current status | `Trial`, `Active`, `Paused`, `Cancelled` |
| `monthly_review_volume` | Number | No | Reviews per month | `25` |
| `monthly_response_count` | Number | Yes | Current month usage | `42` |
| `response_count_reset_date` | Date | Yes | Next quota reset | `2026-02-01` |
| `created_at` | Date & time | Yes | Account creation | `2026-01-26 10:00:00` |
| `onboarded_at` | Date & time | No | Onboarding completion | `2026-01-26 10:30:00` |
| `last_active_at` | Date & time | No | Last login/approval | `2026-01-26 14:20:00` |
| `status` | Single select | Yes | Account status | `Onboarding`, `Active`, `Suspended` |

### Timezone Options
```
Europe/Amsterdam
```

---

## Table 2: Brand_Voice_Profiles

**Purpose:** Brand voice customization settings
**Linked to:** Restaurants (Many-to-One)

### Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `voice_profile_id` | Single line text (Primary) | Yes | Unique identifier | `voice_8Kx2MpQ9` |
| `restaurant` | Link to record | Yes | Restaurant reference | → Restaurants table |
| `personality` | Multiple select | Yes | Brand personality traits | `Casual`, `Family-Friendly` |
| `tone` | Single select | Yes | Communication tone | `Professional`, `Casual`, `Warm` |
| `emoji_usage` | Single select | Yes | Emoji frequency | `Never`, `Rarely`, `Sometimes`, `Often` |
| `self_reference` | Single select | Yes | How restaurant refers to itself | `We`, `Restaurant Name`, `Owner Name` |
| `owner_name_for_responses` | Single line text | No | If using owner name | `Marco` |
| `response_length_preference` | Single select | Yes | Preferred length | `Brief`, `Moderate`, `Detailed` |
| `signature_phrases` | Long text | No | Always use phrases (JSON array) | `["family recipes", "homemade pasta"]` |
| `prohibited_words` | Long text | No | Never use phrases (JSON array) | `["sorry for inconvenience"]` |
| `policies_to_mention` | Long text | No | Policies/guarantees (JSON) | `{"satisfaction_guarantee": "100% money back"}` |
| `contact_info_for_complaints` | Single line text | No | Direct contact for issues | `manager@bellaitalia.com` |
| `example_responses` | Long text | No | User-provided examples (JSON) | `[{"review": "...", "response": "..."}]` |
| `created_at` | Date & time | Yes | Profile creation | `2026-01-26 10:15:00` |
| `last_updated_at` | Date & time | Yes | Last modification | `2026-01-26 14:30:00` |

### Personality Options
```
Formal, Casual, Fun & Playful, Sophisticated, Traditional, Family-Friendly,
Trendy & Hip, Professional
```

### Tone Options
```
Very Formal, Professional but Warm, Casual and Friendly, Very Casual
```

---

## Table 3: Reviews

**Purpose:** Google Business Profile review data and metadata
**Linked to:** Restaurants (Many-to-One)

### Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `review_id` | Single line text (Primary) | Yes | Unique identifier | `rev_9Lm3PnR5` |
| `restaurant` | Link to record | Yes | Restaurant reference | → Restaurants table |
| `google_review_id` | Single line text | Yes | Google's review ID | `ChIJReview_ABC123` |
| `reviewer_name` | Single line text | Yes | Customer name | `Sarah M.` |
| `reviewer_profile_url` | URL | No | Google profile link | `https://maps.google.com/...` |
| `star_rating` | Single select | Yes | Review rating | `1`, `2`, `3`, `4`, `5` |
| `review_text` | Long text | Yes | Review content | `Best pizza in town! The margherita was perfect...` |
| `review_date` | Date & time | Yes | When review was posted | `2026-01-20 18:30:00` |
| `retrieved_at` | Date & time | Yes | When we fetched it | `2026-01-27 06:00:00` |
| `is_spam` | Checkbox | Yes | AI spam detection result | `false` |
| `is_answered` | Checkbox | Yes | Already has response on Google | `false` |
| `sentiment` | Single select | Yes | AI sentiment analysis | `Positive`, `Neutral`, `Negative` |
| `sentiment_score` | Number | Yes | Confidence score (0-1) | `0.92` |
| `key_themes` | Multiple select | No | Extracted topics | `Food Quality`, `Service`, `Pizza` |
| `response_generated` | Checkbox | Yes | Has AI response | `true` |
| `response_posted` | Checkbox | Yes | Response live on Google | `false` |
| `conversion_tracked` | Checkbox | No | Did this lead to a booking? | `false` |
| `response_tone` | Single select | No | Response tone used | `Professional`, `Warm`, `Enthusiastic` |
| `language_detected` | Single select | No | Review language | `Dutch`, `English`, `Other` |
| `word_count` | Number | No | Review length | `47` |

### Star Rating Options
```
1 Star, 2 Stars, 3 Stars, 4 Stars, 5 Stars
```

### Theme Options (Expandable)
```
Food Quality, Service Speed, Staff Friendliness, Cleanliness, Atmosphere,
Value for Money, Pizza, Pasta, Appetizers, Desserts, Drinks, Parking,
Wait Time, Reservation Issues, Portion Size
```

---

## Table 4: Generated_Responses

**Purpose:** AI-generated responses and approval workflow
**Linked to:** Reviews (One-to-One), Restaurants (Many-to-One)

### Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `response_id` | Single line text (Primary) | Yes | Unique identifier | `resp_5Qw8TnM2` |
| `review` | Link to record | Yes | Source review reference | → Reviews table |
| `restaurant` | Link to record | Yes | Restaurant reference | → Restaurants table |
| `generated_text` | Long text | Yes | AI-generated response | `Thank you so much, Sarah! We're thrilled...` |
| `generation_timestamp` | Date & time | Yes | When response was generated | `2026-01-27 06:05:00` |
| `ai_model_used` | Single line text | Yes | AI model version | `claude-sonnet-4.5` |
| `approval_status` | Single select | Yes | Current status | `Pending`, `Approved`, `Edited`, `Rejected` |
| `approved_at` | Date & time | No | Approval timestamp | `2026-01-27 14:20:00` |
| `approved_by_email` | Email | No | Who approved | `marco@bellaitalia.com` |
| `edited_text` | Long text | No | User-edited version | `Thank you Sarah! We're so happy...` |
| `edit_type` | Single select | No | Extent of edits | `Minor Edit`, `Major Edit` |
| `rejection_reason` | Long text | No | Why rejected | `Too generic, doesn't sound like our voice` |
| `scheduled_post_time` | Date & time | No | When to post | `2026-01-28 15:00:00` |
| `posted_at` | Date & time | No | Actual post time | `2026-01-28 15:00:32` |
| `post_status` | Single select | Yes | Posting result | `Queued`, `Posted`, `Failed`, `Cancelled` |
| `post_error` | Long text | No | Error details if failed | `API rate limit exceeded` |
| `google_response_id` | Single line text | No | Google's response ID | `ChIJResponse_DEF456` |
| `word_count` | Number | Yes | Response length | `87` |

### Approval Status Flow
```
Pending → (Approved|Edited|Rejected)
Approved → Queued → (Posted|Failed)
Edited → Queued → (Posted|Failed)
```

---

## Table 5: Analytics_Snapshots

**Purpose:** Daily analytics data for dashboard reporting
**Linked to:** Restaurants (Many-to-One)

### Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `snapshot_id` | Single line text (Primary) | Yes | Unique identifier | `snap_7Rt4WnK1` |
| `restaurant` | Link to record | Yes | Restaurant reference | → Restaurants table |
| `snapshot_date` | Date | Yes | Data snapshot date | `2026-01-27` |
| `average_rating` | Number | Yes | Current avg rating | `3.4` |
| `rating_30d_change` | Number | Yes | 30-day change | `0.3` |
| `rating_60d_change` | Number | Yes | 60-day change | `0.4` |
| `rating_90d_change` | Number | Yes | 90-day change | `0.4` |
| `total_reviews` | Number | Yes | Cumulative review count | `127` |
| `reviews_1_star` | Number | Yes | 1-star review count | `8` |
| `reviews_2_star` | Number | Yes | 2-star review count | `15` |
| `reviews_3_star` | Number | Yes | 3-star review count | `22` |
| `reviews_4_star` | Number | Yes | 4-star review count | `38` |
| `reviews_5_star` | Number | Yes | 5-star review count | `44` |
| `reviews_this_month` | Number | Yes | Reviews in current month | `18` |
| `responses_this_month` | Number | Yes | Responses posted this month | `17` |
| `response_rate` | Number | Yes | Response rate (0-1) | `0.944` |
| `avg_response_time_hours` | Number | Yes | Avg hours to respond | `101` |
| `sentiment_positive` | Number | Yes | % positive sentiment (0-1) | `0.65` |
| `sentiment_neutral` | Number | Yes | % neutral sentiment (0-1) | `0.20` |
| `sentiment_negative` | Number | Yes | % negative sentiment (0-1) | `0.15` |
| `approval_rate` | Number | Yes | % responses approved as-is | `0.83` |
| `edit_rate` | Number | Yes | % responses edited | `0.12` |
| `rejection_rate` | Number | Yes | % responses rejected | `0.05` |

---

## Table 6: Common_Themes

**Purpose:** Track frequently mentioned topics across reviews
**Linked to:** Restaurants (Many-to-One)

### Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `theme_id` | Single line text (Primary) | Yes | Unique identifier | `theme_3Mx9KpL8` |
| `restaurant` | Link to record | Yes | Restaurant reference | → Restaurants table |
| `theme_name` | Single line text | Yes | Topic/theme name | `slow_service` |
| `theme_category` | Single select | Yes | Theme category | `Service`, `Food`, `Atmosphere`, `Value` |
| `mention_count_30d` | Number | Yes | Mentions in last 30 days | `8` |
| `mention_count_total` | Number | Yes | Total mentions | `23` |
| `sentiment` | Single select | Yes | Overall sentiment for theme | `Positive`, `Negative`, `Mixed` |
| `first_mentioned` | Date | Yes | First occurrence | `2025-11-15` |
| `last_mentioned` | Date | Yes | Most recent mention | `2026-01-25` |
| `related_keywords` | Long text | No | Associated words (JSON array) | `["wait", "slow", "server", "delay"]` |
| `created_at` | Date & time | Yes | Theme creation | `2026-01-27 02:30:00` |

---

## Table 7: API_Usage_Logs

**Purpose:** Track Google API calls for monitoring and debugging
**Linked to:** Restaurants (Many-to-One)

### Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `log_id` | Single line text (Primary) | Yes | Unique identifier | `log_6Vx2NqM7` |
| `restaurant` | Link to record | Yes | Restaurant reference | → Restaurants table |
| `api_endpoint` | Single select | Yes | Which API was called | `fetch_reviews`, `post_response`, `refresh_token` |
| `request_timestamp` | Date & time | Yes | When request was made | `2026-01-27 06:00:15` |
| `response_status_code` | Number | Yes | HTTP response code | `200`, `401`, `429` |
| `response_time_ms` | Number | Yes | API response time | `1247` |
| `success` | Checkbox | Yes | Request succeeded | `true` |
| `error_message` | Long text | No | Error details if failed | `Rate limit exceeded` |
| `request_id` | Single line text | No | Google's request ID | `req_abc123def456` |
| `retry_attempt` | Number | No | Retry number (if applicable) | `2` |

### API Endpoint Options
```
fetch_reviews, post_response, refresh_token, get_business_profile,
test_permissions
```

---

## Table 8: Approval_Emails

**Purpose:** Track email digest delivery and engagement
**Linked to:** Restaurants (Many-to-One)

### Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `email_id` | Single line text (Primary) | Yes | Unique identifier | `email_4Yt7MnP3` |
| `restaurant` | Link to record | Yes | Restaurant reference | → Restaurants table |
| `email_type` | Single select | Yes | Type of email sent | `Weekly Digest`, `Reauth Required`, `Success Alert` |
| `sent_at` | Date & time | Yes | When email was sent | `2026-01-27 09:00:00` |
| `recipient_email` | Email | Yes | Delivery address | `marco@bellaitalia.com` |
| `subject_line` | Single line text | Yes | Email subject | `Bella Italia - 12 Review Responses Ready` |
| `response_count_included` | Number | No | # responses in digest | `12` |
| `delivery_status` | Single select | Yes | Email delivery result | `Delivered`, `Bounced`, `Failed` |
| `opened_at` | Date & time | No | First open timestamp | `2026-01-27 10:15:00` |
| `first_click_at` | Date & time | No | First link click | `2026-01-27 10:17:00` |
| `approval_deadline` | Date & time | No | 72-hour deadline | `2026-01-30 09:00:00` |
| `approvals_completed` | Number | No | How many approved | `8` |
| `edits_made` | Number | No | How many edited | `2` |
| `rejections_made` | Number | No | How many rejected | `1` |

---

## Relationships & Data Integrity

### Primary Relationships
```
Restaurants (1) → Reviews (Many)
Restaurants (1) → Generated_Responses (Many)
Restaurants (1) → Brand_Voice_Profiles (1)
Restaurants (1) → Analytics_Snapshots (Many)
Reviews (1) → Generated_Responses (1)
```

### Data Validation Rules
- `monthly_response_count` ≤ `monthly_response_limit`
- `sentiment_score` between 0 and 1
- `star_rating` only 1-5
- All encrypted fields prefixed with "encrypted:"
- Email addresses validated format
- Timezone must be valid TZ identifier

---

## Table 9: Waitlist

**Purpose:** Track applicants from Typeform before onboarding
**Source:** Typeform webhook → n8n → Airtable

### Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `waitlist_id` | Single line text (Primary) | Yes | Unique identifier | `wait_7Nx4QmP2` |
| `restaurant_name` | Single line text | Yes | Business name | `Pasta Paradise` |
| `contact_name` | Single line text | Yes | Owner/manager name | `John Smith` |
| `contact_email` | Email | Yes | Primary email | `john@pastaparadise.com` |
| `contact_phone` | Phone number | No | Phone number | `+31 6 1234 5678` |
| `city` | Single line text | Yes | Location (Het Gooi) | `Hilversum` |
| `current_rating` | Single select | Yes | Google rating | `4.0-4.2 stars`, `4.3-4.5 stars` |
| `google_business_url` | URL | No | Google Maps link | `https://maps.google.com/...` |
| `monthly_review_volume` | Single select | No | Reviews/month | `<10`, `10-50`, `50-100`, `100+` |
| `submitted_at` | Date & time | Yes | Form submission | `2026-02-01 14:30:00` |
| `application_status` | Single select | Yes | Review status | `New`, `Under Review`, `Approved`, `Rejected`, `Onboarded` |
| `reviewed_at` | Date & time | No | Manual review timestamp | `2026-02-03 10:00:00` |
| `reviewed_by` | Single line text | No | Who reviewed | `admin@reviewrecovery.com` |
| `growth_goals` | Long text | No | Selected growth goals (JSON) | `["more_reservations", "time_saving"]` |
| `investment_readiness` | Single select | No | Budget readiness | `Ready`, `ROI First`, `Discuss`, `Too High` |
| `rejection_reason` | Long text | No | If rejected | `Outside Het Gooi region` |
| `notes` | Long text | No | Internal notes | `High volume, 30+ reviews/month` |
| `converted_to_restaurant_id` | Single line text | No | If onboarded | `rest_2Jk9XmN4` |
| `source` | Single select | Yes | Traffic source | `Typeform`, `Direct`, `Referral` |

### Application Status Options
```
New, Under Review, Approved, Rejected, Onboarded
```

### Current Rating Options
```
4.0-4.2 stars, 4.3-4.5 stars
```

---

## Airtable Setup Instructions

### Base Configuration
1. **Create New Base:** "Restaurant Review AI"
2. **Import Tables:** Create tables in this order (dependencies)
3. **Set Permissions:** Restrict access to authorized team members
4. **Configure Views:** Set up filtered views for each workflow

### Recommended Views

#### Restaurants Table Views
- **Active Restaurants:** `status = "Active"`
- **Onboarding:** `status = "Onboarding"`
- **Growth Focused:** `target_rating = "GROWTH_FOCUSED"`

#### Reviews Table Views
- **Pending Responses:** `response_generated = false AND is_spam = false`
- **Recent Reviews:** Last 30 days, sorted by `review_date`
- **Needs Attention:** `star_rating IN ["1 Star", "2 Stars", "3 Stars"]`
- **High Priority:** Low-rated reviews without responses

#### Generated_Responses Views
- **Pending Approval:** `approval_status = "Pending"`
- **Ready to Post:** `approval_status = "Approved" AND post_status = "Queued"`
- **Failed Posts:** `post_status = "Failed"`
- **This Week:** Responses from current week

### Automation Rules
1. **New Review Alert:** When review added → trigger response generation
2. **Approval Deadline:** 48 hours before deadline → send reminder
3. **Usage Warning:** At 80% monthly limit → notify restaurant
4. **Failed Post Retry:** When post fails → schedule retry

---

## Migration Path to Supabase

### Migration Strategy
When reaching 20 customers (~400 restaurant records, ~8,000 reviews), migrate to Supabase PostgreSQL:

**Phase 1:** Export Airtable data to CSV
**Phase 2:** Transform data to PostgreSQL schema
**Phase 3:** Update MindStudio connections
**Phase 4:** Validate data integrity
**Phase 5:** Sunset Airtable base

### Supabase Schema Preview
```sql
-- Example table structure for future migration
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  google_refresh_token TEXT NOT NULL, -- encrypted
  target_rating TEXT CHECK (target_rating IN ('GROWTH_FOCUSED', 'MAINTENANCE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Performance Considerations

### Airtable Limitations (MVP Phase)
- **Record Limit:** 1,200 records per base (sufficient for MVP)
- **API Rate Limit:** 5 requests/second (manageable with queuing)
- **Storage Limit:** 2GB total (text data is minimal)
- **Concurrent Users:** Suitable for single founder operations

### Monitoring Metrics
- **Record Counts:** Track table growth toward limits
- **API Usage:** Monitor request frequency
- **Query Performance:** Optimize filters and sorting
- **Data Quality:** Regular validation of encrypted fields

### Backup Strategy
- **Daily Exports:** Automated CSV backups
- **Version Control:** Schema changes tracked in Git
- **Recovery Plan:** Documented restoration process
- **Security:** Encrypted backups for sensitive data