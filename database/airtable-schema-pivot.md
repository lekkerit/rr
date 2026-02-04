# Airtable Schema - Pivoted for 4.0-4.5⭐ Restaurants

## Table 1: Reviews (Updated)

| Field | Type | Description |
|-------|------|-------------|
| id | Auto | Primary key |
| google_review_id | Text | Google's review identifier |
| reviewer_name | Text | Name of reviewer |
| rating | Single Select | ONE_STAR through FIVE_STARS |
| review_text | Long Text | Review content |
| review_date | Date | When review was posted |
| response_text | Long Text | AI-generated response |
| response_posted | Checkbox | Posted to Google? |
| conversion_tracked | Checkbox | Did this lead to a booking? (manual tracking) |
| response_tone | Single Select | Professional, Warm, Enthusiastic |
| created_at | Created Time | Record creation |

## Table 2: Restaurants (New - for future multi-restaurant)

| Field | Type | Description |
|-------|------|-------------|
| id | Auto | Primary key |
| restaurant_name | Text | Name of restaurant |
| google_business_id | Text | Google My Business ID |
| current_rating | Number | Current Google rating (1-5) |
| target_rating | Single Select | GROWTH_FOCUSED, MAINTENANCE |
| location | Text | City/area |
| monthly_review_volume | Number | Reviews per month |
| subscription_status | Single Select | TRIAL, ACTIVE, PAUSED, CANCELLED |
| created_at | Created Time | Onboarding date |

## Table 3: Performance Metrics (New)

| Field | Type | Description |
|-------|------|-------------|
| id | Auto | Primary key |
| restaurant_id | Link to Records | Link to Restaurants table |
| month | Date | Month of measurement |
| reviews_received | Number | Reviews that month |
| reviews_responded | Number | Reviews we responded to |
| booking_inquiries | Number | Phone calls/reservations (manual) |
| response_rate | Formula | reviews_responded / reviews_received |
| conversion_estimate | Number | Estimated bookings from reviews |
| created_at | Created Time | Record creation |

## Updated Setup Instructions

1. Create new Airtable base called "Review Recovery - Growth Focused"
2. Create tables with fields above
3. Import existing review data if migrating
4. Set up automation to track monthly metrics
5. Get your Base ID from URL: `airtable.com/YOUR_BASE_ID/...`
6. Create Personal Access Token at airtable.com/create/tokens
7. Add credentials to n8n workflows

## Key Changes for 4.0-4.5⭐ Target Market

### Added Fields:
- `conversion_tracked` - Track which reviews lead to bookings
- `response_tone` - Optimize tone for successful restaurants
- `target_rating` - GROWTH_FOCUSED (not damage control)
- `monthly_review_volume` - Success metric tracking
- `booking_inquiries` - ROI measurement

### New Focus:
- **Growth metrics** instead of damage control
- **ROI tracking** for €349/month investment
- **Professional tone** options for established restaurants
- **Multi-restaurant ready** for future scaling

## Typeform Integration Fields

When someone applies via Typeform, capture:
- Restaurant name
- Current Google rating (should be 4.0-4.5)
- Monthly review volume
- Location (Het Gooi region)
- Growth goals (more reservations, time saving, etc.)
- Contact information

## n8n Workflow Updates Needed

1. **Review Monitor Workflow:**
   - Filter for restaurants with 4.0-4.5⭐ rating
   - Track conversion metrics
   - Professional response templates

2. **Response Generator Workflow:**
   - Growth-focused response templates
   - Booking invitation language
   - Professional tone (not desperate)

3. **Performance Tracking Workflow:**
   - Monthly metrics calculation
   - ROI reporting to clients
   - Growth trend analysis

## Success Metrics to Track

- Response rate: >95% (professional standard)
- Average response time: <24 hours
- Booking conversion increase: >30%
- Client satisfaction: >4.5/5
- Monthly recurring revenue retention: >90%

---

**Migration Note:** Existing reviews table can be updated by adding new fields. No data loss required.
**Target:** 4.0-4.5⭐ restaurants who want to grow, not struggling businesses needing rescue.