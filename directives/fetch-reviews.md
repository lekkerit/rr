# Directive: Fetch & Process Reviews

**Trigger:** Weekly (Monday 6am) or on-demand
**Goal:** Fetch new Google reviews, classify by sentiment, flag urgent, export to Sheets

---

## Inputs

- `data/restaurants.json` — list of active restaurants
- `scripts/oauth-test/tokens.json` — valid OAuth tokens
- `.env` — `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_SHEET_ID`

## Outputs

- `data/reviews_raw.json` — fetched reviews from GMB API
- `data/reviews_classified.json` — reviews with sentiment tier added
- `data/reviews_urgent.json` — subset requiring immediate attention

---

## Steps

1. **Fetch** — run `scripts/fetch_reviews.py --days 7`
2. **Classify** — run `scripts/analyse_sentiment.py`
3. **Flag urgent** — run `scripts/flag_urgent.py`
   - If urgent reviews found: **stop and present them to the user before continuing**
4. **Export** — run `scripts/export_to_sheet.py`

---

## Edge cases

| Situation | Action |
|-----------|--------|
| OAuth tokens missing or expired | Ask user to run `cd scripts/oauth-test && npm run server`, then retry |
| `reviews_raw.json` is empty | Check restaurant `status` in `restaurants.json`, check OAuth scope (`business.manage`) |
| API rate limit hit (429) | Wait 60s, retry once. Log and stop if it fails again. |
| Urgent reviews found | Do not continue to export. Surface them first. |
| Export auth prompt appears | First run only — a browser window opens for Sheets auth. Normal. |

---

## Known constraints

- Google My Business API: 1,500 requests/day limit
- Reviews API (`mybusinessreviews`) must be separately enabled in Google Cloud Console
- OAuth redirect URI must exactly match `http://localhost:3000/oauth/callback`
- Post responses 4–24 hours after fetching (human-like timing, 9am–8pm local)

---

## Self-annealing log

> Update this section when you discover new constraints, errors, or better approaches.

- **2026-03-04:** `testReviewsFetch()` in `oauth-test/gmb-api-test.js` uses mock data — real Reviews API endpoint not yet confirmed working.
