# Typeform Update Guide - 4.0-4.5⭐ Restaurant Pivot

**Current Typeform:** https://form.typeform.com/to/t9sgShU9

## ⚠️ CRITICAL UPDATES NEEDED:

### 1. **Welcome Screen - OLD vs NEW**

**❌ OLD (Damage Control):**
> "Are you tired of bad Google reviews hurting your restaurant bookings?"

**✅ NEW (Growth Focused):**
> "Ready to convert more Google reviews into restaurant bookings?"
>
> "Professional review management for successful restaurants (4.0-4.5⭐) who want to grow their reservation business."

### 2. **Qualification Questions - UPDATED**

#### Question 1: Restaurant Rating Check
**Question:** "What's your current Google rating?"
**Type:** Multiple Choice
**Options:**
- 4.0 - 4.2 stars ⭐⭐⭐⭐☆
- 4.3 - 4.5 stars ⭐⭐⭐⭐⭐
- 4.6+ stars (we have a different program)
- 3.9 or below (not our target market currently)

**Logic:** Only continue if they select 4.0-4.5 options

#### Question 2: Growth Goals
**Question:** "What's your main goal with review management?"
**Type:** Multiple Choice
**Options:**
- Get more reservations from people reading reviews
- Save time writing professional responses
- Convert browsers into bookers more effectively
- Build stronger customer relationships
- All of the above

#### Question 3: Current Review Volume
**Question:** "How many Google reviews do you typically receive per month?"
**Type:** Multiple Choice
**Options:**
- 1-5 reviews per month
- 6-15 reviews per month
- 16-30 reviews per month
- 30+ reviews per month

#### Question 4: Current Response Rate
**Question:** "How often do you currently respond to Google reviews?"
**Type:** Multiple Choice
**Options:**
- Never or rarely (0-25%)
- Sometimes (25-50%)
- Usually (50-75%)
- Almost always (75%+)

### 3. **Business Information**

#### Restaurant Details
- Restaurant name
- Location (must be in Het Gooi: Hilversum, Bussum, Naarden, Laren, Huizen)
- Google Business Profile URL (to verify rating)
- Phone number
- Email address

#### Contact Person
- Name
- Role (Owner, Manager, Marketing, etc.)
- Best time to call

### 4. **ROI Interest Check**

#### Question: Investment Readiness
**Question:** "Our service is €349/month and shows average ROI of €900+ in additional revenue. Are you ready to invest in professional growth?"
**Type:** Multiple Choice
**Options:**
- Yes, I'm ready to invest in growth
- I'd like to see the ROI calculator first
- I need to discuss with my team
- The price is too high for me currently

**Logic:** Direct to different next steps based on answer

### 5. **Final Screens**

#### For Qualified Leads (4.0-4.5⭐ + Ready to Invest):
**Message:**
> "Perfect! You're exactly who we help.
>
> ✅ 4.0-4.5⭐ rating (growth-focused, not damage control)
> ✅ Ready to invest €349/month for €900+ ROI
> ✅ Located in Het Gooi region
>
> **Next Steps:**
> 1. We'll call you within 24 hours
> 2. 15-minute consultation to understand your goals
> 3. Custom ROI projection for your restaurant
> 4. Start seeing results within 30 days
>
> Talk soon!"

#### For ROI Calculator Interest:
**Message:**
> "Smart move! See your potential ROI first.
>
> **[ROI Calculator Button]** → tools/roi-calculator.html
>
> After you see your numbers, we'll follow up to discuss next steps."

#### For Not Qualified (Wrong Rating):
**Message:**
> "Thanks for your interest!
>
> We currently specialize in helping 4.0-4.5⭐ restaurants grow through review management.
>
> If your rating changes, we'd love to help you convert more reviews into reservations!"

### 6. **Thank You Page Settings**

**Redirect URL:** Back to homepage or ROI calculator based on responses
**Email Notification:** Send different emails based on qualification status

---

## Airtable Integration Updates

### New Fields to Capture:
- `current_rating` (4.0-4.5 range)
- `monthly_review_volume`
- `current_response_rate`
- `growth_goals` (array of selected options)
- `investment_readiness` (yes/calculator/discuss/too-high)
- `location` (Het Gooi area)
- `qualification_status` (qualified/roi-interest/not-qualified)

### Workflow Triggers:
- **Qualified leads:** Immediate notification + calendar link
- **ROI interest:** Add to nurture sequence
- **Not qualified:** Polite follow-up in 6 months

---

## Key Messaging Changes

| OLD Messaging | NEW Messaging |
|---------------|---------------|
| "Fix bad reviews" | "Convert reviews to bookings" |
| "Reputation rescue" | "Professional growth" |
| "1-3 star restaurants" | "4.0-4.5 star restaurants" |
| "Stop losing customers" | "Get more reservations" |
| "Damage control" | "Growth investment" |
| "Save your business" | "Scale your success" |

---

## Success Metrics to Track

- **Qualification Rate:** % who are 4.0-4.5⭐ (target: >60%)
- **Investment Readiness:** % ready for €349/month (target: >40%)
- **Location Match:** % in Het Gooi (target: >80%)
- **Lead Quality Score:** Qualified leads per 100 submissions (target: >25)

**Update Priority:** HIGH - This form filters our entire lead flow. The pivot success depends on getting the right prospects.