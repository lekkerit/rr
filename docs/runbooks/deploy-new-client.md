# Runbook: Deploy New Client

From signed contract to live on platform.

**Pre-requisite:** Client is in `Waitlist` table with `application_status: Approved`.

---

## Steps

### 1. Create Airtable record — Restaurants table

Required fields:
- `restaurant_name` — exact business name
- `owner_name`, `owner_email`
- `google_business_profile_id` — Google Place ID (from Maps URL or GBP dashboard)
- `timezone` → `Europe/Amsterdam`
- `subscription_status` → `Trial`
- `status` → `Onboarding`
- `response_count_reset_date` → first day of next month

Update Waitlist record: `application_status → Onboarded`, `converted_to_restaurant_id → [new restaurant_id]`

### 2. Create Brand_Voice_Profile record

Link to new Restaurants record. Fill in with owner during onboarding call:
- `tone` — ask: "Hoe zou je de sfeer van jullie restaurant omschrijven?"
- `personality` (multi-select)
- `emoji_usage`
- `self_reference` — "We" vs restaurant name vs owner name
- `signature_phrases` — phrases they always use (e.g. "huisgemaakt", "vers van de markt")
- `prohibited_words` — phrases to avoid (e.g. competitor names, anything off-brand)

### 3. Set up Google OAuth

1. Owner goes through OAuth flow → grants GBP access
2. Store `google_refresh_token_encrypted` in Restaurants record (prefix: `encrypted:AES256:`)
3. Test via `scripts/fetch_reviews.py` with the restaurant's credentials

```bash
python scripts/fetch_reviews.py --restaurant-id [restaurant_id]
```

### 4. Import and activate n8n workflows

Follow `docs/n8n-setup-guide.md` — specifically:
- Configure Airtable credential in n8n (if not already done)
- Import `workflows/mvp-1-review-monitor.json`
- Import `workflows/mvp-2-response-generator-poster.json`
- Set restaurant filter in workflow to include new client
- Activate both workflows

### 5. Configure email digests

- Confirm `owner_email` is correct in Restaurants record
- Configure SMTP in n8n (see setup guide Part 3)
- Set approval deadline: 72 hours from digest send time
- Send test digest manually

### 6. First review fetch (manual trigger)

In n8n → open `mvp-1-review-monitor` → Execute workflow manually for this restaurant.

Check Airtable `Reviews` table: reviews should appear within 60s.

### 7. Review generated responses

1. Check `Generated_Responses` table → filter `approval_status: Pending`
2. Read through first batch — do they match the brand voice?
3. If off: adjust `Brand_Voice_Profiles` fields and regenerate
4. If on: approve 2–3 manually to validate end-to-end

### 8. Confirm GBP posting works

After approving responses → check n8n `mvp-2-response-generator-poster` runs.
Verify on Google Maps / GBP dashboard that responses appear.
Log in `API_Usage_Logs` if any errors.

### 9. Set up Analytics baseline

Create first `Analytics_Snapshots` record for today:
- `average_rating` — current GBP rating
- `total_reviews` — current review count
- Star distribution (1★ through 5★)
- `response_rate` → 0 (baseline)

Update Restaurants record: `status → Active`, `onboarded_at → now`.

---

## Checklist

- [ ] Restaurants record created
- [ ] Brand_Voice_Profile created and filled
- [ ] Google OAuth token stored and tested
- [ ] n8n workflows active for this client
- [ ] Email digest configured and tested
- [ ] First review fetch successful
- [ ] Generated responses reviewed and approved
- [ ] GBP posting confirmed live
- [ ] Analytics baseline set
- [ ] Client notified: "Je bent live!"
