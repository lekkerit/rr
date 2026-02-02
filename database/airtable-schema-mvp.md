# Airtable Schema - MVP

## Single Table: Reviews

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
| created_at | Created Time | Record creation |

## Setup Instructions

1. Create new Airtable base called "Google Review Bot"
2. Create table "Reviews" with fields above
3. Get your Base ID from URL: `airtable.com/YOUR_BASE_ID/...`
4. Create Personal Access Token at airtable.com/create/tokens
5. Add credentials to n8n

## Notes

- No multi-restaurant support (single location)
- No separate responses table (stored in reviews)
- No analytics tables
- No brand voice configuration
