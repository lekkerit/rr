# Restaurant Onboarding Flow Guide

## 🎯 Overview

The onboarding process involves **2 workflows** working together to get restaurants from signup to active monitoring:

| Workflow | Purpose | Trigger |
|----------|---------|---------|
| **6. Onboarding Workflow** | Creates restaurant record, sends welcome email | Webhook (signup form) |
| **7. Google OAuth Callback** | Handles Google authorization, activates restaurant | Webhook (Google redirect) |

---

## 📊 Complete Onboarding Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    RESTAURANT SIGNS UP                       │
│              (Landing page form submission)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   ▼
         ┌─────────────────────┐
         │  WORKFLOW 6:        │
         │  ONBOARDING         │
         └─────────┬───────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
 Validate     Create          Generate
  Data        Restaurant      OAuth URL
              in Airtable        │
                   │              │
                   └──────┬───────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
   [Pro Tier]                      [Starter Tier]
   Create Brand                    Skip brand
   Voice Profile                   voice setup
          │                               │
          └───────────────┬───────────────┘
                          │
                          ▼
                   Send Welcome Email
                   (with OAuth link)
                          │
                          ▼
              User clicks OAuth link
              in email → Redirects
              to Google
                          │
                          ▼
         ┌────────────────────────────────┐
         │  GOOGLE AUTHORIZATION          │
         │  (User grants permissions)     │
         └────────────┬───────────────────┘
                      │
                      ▼
         ┌─────────────────────┐
         │  WORKFLOW 7:        │
         │  OAUTH CALLBACK     │
         └─────────┬───────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
    ▼              ▼              ▼
 Extract      Exchange       Fetch Google
  Code        for Tokens     Business ID
              & Encrypt          │
                   │              │
                   └──────┬───────┘
                          │
                          ▼
                  Update Restaurant
                  Record in Airtable
                  (Status: Active)
                          │
                          ▼
                  Trigger Initial
                  Review Fetch
                  (Workflow 1)
                          │
                          ▼
                  Send Success Email
                          │
                          ▼
              Show Success Page
              in Browser
                          │
                          ▼
         ┌────────────────────────────────┐
         │   RESTAURANT NOW ACTIVE        │
         │   Weekly monitoring begins     │
         └────────────────────────────────┘
```

---

## 🔧 Setup Instructions

### Step 1: Import Both Workflows

```bash
# In n8n:
1. Import "6-onboarding-workflow.json"
2. Import "7-google-oauth-callback.json"
```

### Step 2: Configure Workflow 6 (Onboarding)

| Node | Configuration | Value to Update |
|------|---------------|-----------------|
| **Webhook: New Restaurant Signup** | Path | Leave as `onboard-restaurant` |
| **Create Restaurant Record** | Airtable Base | YOUR_AIRTABLE_BASE_ID |
| **Create Restaurant Record** | Credentials | Select your Airtable token |
| **Generate Google OAuth URL** | Google Client ID | Replace `YOUR_GOOGLE_CLIENT_ID` |
| **Generate Google OAuth URL** | Redirect URI | Replace `YOUR_N8N_INSTANCE` with your domain |
| **Create Brand Voice Profile** | Airtable Base | YOUR_AIRTABLE_BASE_ID |
| **Create Brand Voice Profile** | Credentials | Select your Airtable token |
| **Send Welcome Email** | SMTP Credentials | Select your SMTP account |

### Step 3: Configure Workflow 7 (OAuth Callback)

| Node | Configuration | Value to Update |
|------|---------------|-----------------|
| **Webhook: OAuth Callback** | Path | Leave as `google-oauth-callback` |
| **Find Restaurant** | Airtable Base | YOUR_AIRTABLE_BASE_ID |
| **Find Restaurant** | Credentials | Select your Airtable token |
| **Exchange Code for Tokens** | Google Client ID | Replace `YOUR_GOOGLE_CLIENT_ID` |
| **Exchange Code for Tokens** | Google Client Secret | Replace `YOUR_GOOGLE_CLIENT_SECRET` |
| **Exchange Code for Tokens** | Redirect URI | Replace `YOUR_N8N_INSTANCE` |
| **Update Restaurant Record** | Airtable Base | YOUR_AIRTABLE_BASE_ID |
| **Update Restaurant Record** | Credentials | Select your Airtable token |
| **Trigger Initial Review Fetch** | Webhook URL | Update to your Workflow 1 URL |
| **Send Success Email** | SMTP Credentials | Select your SMTP account |

### Step 4: Get Your Webhook URLs

After activating both workflows:

```
Workflow 6 webhook URL:
https://YOUR_N8N_INSTANCE/webhook/onboard-restaurant

Workflow 7 webhook URL:
https://YOUR_N8N_INSTANCE/webhook/google-oauth-callback
```

**CRITICAL:** The Workflow 7 URL must match exactly in:
1. Google Cloud Console (OAuth redirect URIs)
2. Workflow 6's OAuth URL generation
3. Workflow 7's redirect_uri parameter

---

## 📝 Landing Page Integration

### HTML Form Example

```html
<form id="signup-form" action="https://YOUR_N8N_INSTANCE/webhook/onboard-restaurant" method="POST">
  <!-- Basic Info -->
  <input type="text" name="restaurant_name" placeholder="Restaurant Name" required>
  <input type="text" name="owner_name" placeholder="Your Name" required>
  <input type="email" name="owner_email" placeholder="Email" required>
  <input type="tel" name="phone_number" placeholder="Phone">
  <textarea name="address" placeholder="Restaurant Address"></textarea>
  
  <!-- Tier Selection -->
  <select name="tier" required>
    <option value="Starter">Starter Pack - $149/month</option>
    <option value="Pro">Pro Pack - $299/month</option>
  </select>
  
  <!-- Timezone -->
  <select name="timezone" required>
    <option value="America/New_York">Eastern Time</option>
    <option value="America/Chicago">Central Time</option>
    <option value="America/Denver">Mountain Time</option>
    <option value="America/Los_Angeles">Pacific Time</option>
  </select>
  
  <!-- Pro Pack Only Fields (shown conditionally) -->
  <div id="pro-fields" style="display:none;">
    <h3>Brand Voice Customization (Pro Pack)</h3>
    
    <label>Restaurant Personality:</label>
    <select name="personality">
      <option value="Formal & Upscale">Formal & Upscale</option>
      <option value="Casual & Relaxed">Casual & Relaxed</option>
      <option value="Fun & Playful">Fun & Playful</option>
      <option value="Family-Friendly & Warm">Family-Friendly & Warm</option>
      <option value="Professional">Professional</option>
    </select>
    
    <label>Communication Tone:</label>
    <select name="tone">
      <option value="Very Formal">Very Formal</option>
      <option value="Professional but Warm">Professional but Warm</option>
      <option value="Casual and Friendly">Casual and Friendly</option>
      <option value="Very Casual">Very Casual</option>
    </select>
    
    <label>Use Emojis?</label>
    <select name="emoji_usage">
      <option value="Never">Never</option>
      <option value="Rarely">Rarely</option>
      <option value="Sometimes">Sometimes</option>
      <option value="Often">Often</option>
    </select>
    
    <label>How do you refer to your restaurant?</label>
    <select name="self_reference">
      <option value="We">We / Our team</option>
      <option value="Restaurant Name">Restaurant Name</option>
      <option value="I">I (owner's voice)</option>
    </select>
    
    <label>Response Length Preference:</label>
    <select name="response_length_preference">
      <option value="Brief">Brief (50-75 words)</option>
      <option value="Moderate">Moderate (75-125 words)</option>
      <option value="Detailed">Detailed (125-150 words)</option>
    </select>
    
    <label>Signature Phrases (comma-separated):</label>
    <input type="text" name="signature_phrases" placeholder="family recipes, homemade pasta">
    
    <label>Words to Avoid (comma-separated):</label>
    <input type="text" name="prohibited_words" placeholder="sorry for the inconvenience">
  </div>
  
  <button type="submit">Start Free Trial</button>
</form>

<script>
// Show/hide Pro fields based on tier selection
document.querySelector('[name="tier"]').addEventListener('change', function(e) {
  document.getElementById('pro-fields').style.display = 
    e.target.value === 'Pro' ? 'block' : 'none';
});
</script>
```

### JavaScript Submission Handler

```javascript
document.getElementById('signup-form').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const formData = new FormData(this);
  const data = Object.fromEntries(formData);
  
  // Parse comma-separated arrays
  if (data.signature_phrases) {
    data.signature_phrases = data.signature_phrases.split(',').map(s => s.trim());
  }
  if (data.prohibited_words) {
    data.prohibited_words = data.prohibited_words.split(',').map(s => s.trim());
  }
  
  try {
    const response = await fetch('https://YOUR_N8N_INSTANCE/webhook/onboard-restaurant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Show success message
      alert('Welcome! Check your email to connect your Google Business Profile.');
      
      // Optionally redirect to dashboard
      // window.location.href = '/dashboard';
    } else {
      alert('Error: ' + result.error);
    }
  } catch (error) {
    alert('Network error. Please try again.');
  }
});
```

---

## 🧪 Testing the Onboarding Flow

### Manual Test Procedure

#### Test 1: Starter Pack Onboarding

```bash
# Send test request to Workflow 6
curl -X POST https://YOUR_N8N_INSTANCE/webhook/onboard-restaurant \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_name": "Test Pizza Place",
    "owner_name": "John Smith",
    "owner_email": "john@testpizza.com",
    "phone_number": "555-1234",
    "address": "123 Main St, New York, NY 10001",
    "tier": "Starter",
    "timezone": "America/New_York"
  }'

# Expected response:
# {
#   "success": true,
#   "restaurant_id": "rest_abc123...",
#   "next_step": "Check your email for Google Business Profile connection"
# }
```

**Validation Checklist:**
- [ ] Restaurant record created in Airtable
- [ ] Welcome email received at owner_email
- [ ] Email contains OAuth link
- [ ] Restaurant status = "Onboarding"

#### Test 2: Pro Pack Onboarding

```bash
curl -X POST https://YOUR_N8N_INSTANCE/webhook/onboard-restaurant \
  -H "Content-Type: application/json" \
  -d '{
    "restaurant_name": "Fancy Bistro",
    "owner_name": "Jane Doe",
    "owner_email": "jane@fancybistro.com",
    "tier": "Pro",
    "timezone": "America/Los_Angeles",
    "personality": "Sophisticated & Modern",
    "tone": "Professional but Warm",
    "emoji_usage": "Rarely",
    "self_reference": "We",
    "response_length_preference": "Moderate",
    "signature_phrases": ["farm-to-table", "seasonal ingredients"],
    "prohibited_words": ["cheap", "fast food"]
  }'
```

**Validation Checklist:**
- [ ] Restaurant record created in Airtable
- [ ] Brand Voice Profile created in Airtable
- [ ] Welcome email mentions Pro Pack benefits
- [ ] Brand voice data properly stored

#### Test 3: OAuth Callback Flow

1. **Click OAuth link** in welcome email
2. **Authorize with Google** (grant permissions)
3. **Get redirected back** to n8n callback

**Validation Checklist:**
- [ ] Workflow 7 receives OAuth code
- [ ] Tokens exchanged successfully
- [ ] Google Business Profile ID extracted
- [ ] Tokens encrypted and stored in Airtable
- [ ] Restaurant status changed to "Active"
- [ ] Initial review fetch triggered
- [ ] Success email sent
- [ ] Success page displayed in browser

---

## ⚠️ Common Issues & Solutions

### Issue 1: "Missing authorization code from Google"

**Cause:** User declined permissions or OAuth was cancelled

**Solution:**
- User needs to retry OAuth flow from welcome email
- Check that Google Cloud Console has correct redirect URI

### Issue 2: "No Google Business accounts found"

**Cause:** User's Google account has no Business Profile

**Solution:**
- User needs to create a Google Business Profile first
- Visit: https://business.google.com/create

### Issue 3: "Failed to receive refresh token"

**Cause:** `prompt=consent` not in OAuth URL

**Solution:**
- Check Workflow 6's OAuth URL includes `&prompt=consent`
- User may need to revoke access and re-authorize

### Issue 4: Restaurant status stuck at "Onboarding"

**Cause:** User didn't complete OAuth flow

**Solution:**
- Resend welcome email with OAuth link
- Check Workflow 7 for execution errors

### Issue 5: Webhook URLs not working

**Cause:** Workflows not activated or wrong URL

**Solution:**
- Activate both Workflow 6 and 7
- Copy exact webhook URLs from n8n
- Update Google Cloud Console redirect URIs

---

## 🔒 Security Best Practices

### Token Encryption

**⚠️ WARNING:** The workflows include simplified encryption using base64 encoding. This is **NOT SECURE** for production!

**Replace with proper AES-256 encryption:**

```javascript
// In "Prepare Token Data" node (Workflow 7)
const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // 32-byte key
const IV_LENGTH = 16;

function encryptToken(token) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return iv.toString('hex') + ':' + encrypted;
}

// Use: encryptToken(tokenResponse.access_token)
```

### Environment Variables Required

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
ENCRYPTION_KEY=32_byte_encryption_key_here
N8N_INSTANCE_URL=https://your-n8n.domain.com
```

### OAuth State Validation

- State parameter includes `restaurant_id` for CSRF protection
- Validate state exists in Airtable before proceeding
- Clear state after successful OAuth to prevent reuse

---

## 📊 Data Flow

### Airtable Updates During Onboarding

| Stage | Restaurant Record | Brand Voice Profile | Status |
|-------|-------------------|---------------------|--------|
| Signup | Created with basic info | - | "Onboarding" |
| Pro Tier | Same | Created (Pro only) | "Onboarding" |
| OAuth Complete | Updated with tokens + Google ID | Same | "Active" |

### Fields Populated by Each Workflow

**Workflow 6 (Onboarding):**
- `restaurant_id`
- `restaurant_name`
- `owner_name`
- `owner_email`
- `phone_number`
- `address`
- `timezone`
- `tier`
- `monthly_response_limit`
- `status` = "Onboarding"
- `created_at`

**Workflow 7 (OAuth Callback):**
- `google_business_profile_id`
- `google_access_token_encrypted`
- `google_refresh_token_encrypted`
- `google_token_expires_at`
- `status` = "Active"
- `onboarded_at`

---

## ✅ Onboarding Complete Checklist

After a restaurant completes onboarding:

- [ ] Restaurant record in Airtable (status = "Active")
- [ ] Google OAuth tokens stored (encrypted)
- [ ] Google Business Profile ID captured
- [ ] Brand Voice Profile created (Pro tier only)
- [ ] Welcome email sent and delivered
- [ ] Success email sent and delivered
- [ ] Initial review fetch triggered
- [ ] Restaurant appears in dashboard
- [ ] Weekly monitoring schedule begins

**Next automatic event:** Monday 6am - First review fetch by Workflow 1

---

## 📧 Email Templates Reference

### Welcome Email (Starter)
- Subject: "Welcome to Restaurant Review AI - Starter Pack! 🎉"
- Contains: OAuth link, tier benefits, next steps
- Sent by: Workflow 6

### Welcome Email (Pro)
- Subject: "Welcome to Restaurant Review AI - Pro Pack! 🎉"
- Contains: OAuth link, Pro benefits, brand voice details
- Sent by: Workflow 6

### Success Email (Post-OAuth)
- Subject: "🎉 [Restaurant Name] is Connected! Here's What Happens Next"
- Contains: Confirmation, next steps, dashboard link
- Sent by: Workflow 7

---

## 🔗 Integration with Other Workflows

| Workflow | Integration Point | Purpose |
|----------|------------------|---------|
| **1. Review Monitor** | Triggered by Workflow 7 | Fetches initial historical reviews |
| **2. Response Generator** | Called by Workflow 1 | Generates responses for fetched reviews |
| **3. Approval Handler** | Starts Monday after onboarding | Sends first approval digest |
| **4. Post Scheduler** | Activated after first approval | Posts approved responses |
| **5. Analytics Builder** | Starts night after onboarding | Begins tracking metrics |

---

**Last Updated:** January 27, 2026  
**Version:** 1.0.0
