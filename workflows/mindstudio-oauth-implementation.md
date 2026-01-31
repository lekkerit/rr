# MindStudio OAuth Implementation Guide

## Overview
Implementation guide for the Google My Business OAuth flow and restaurant onboarding in MindStudio, based on the successful test validation.

## Architecture Overview

```
MindStudio Workflows:
┌─────────────────────────────────────────────────────────────┐
│                    Restaurant Onboarding                    │
├─────────────────────────────────────────────────────────────┤
│ 1. Landing Page → 2. OAuth Init → 3. OAuth Callback →      │
│ 4. Token Storage → 5. Brand Voice Setup → 6. Activation    │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. MindStudio Project Setup

### Initial Configuration
1. **Create New MindStudio Project:** "Restaurant Review AI - OAuth"
2. **Set Environment Variables:**
   ```
<<<<<<< HEAD
   GOOGLE_CLIENT_ID = INSERT-KEY-HERE.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET = INSERT-KEY-HERE
=======
   GOOGLE_CLIENT_ID = 123456789-abcdefghijk.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET = GOCSPX-aBcDeFgHiJkLmNoPqRsTuVwXyZ
>>>>>>> 2bc31ca (Initial commit: PRD and project structure)
   GOOGLE_REDIRECT_URI = https://your-mindstudio-webhook.com/oauth/callback
   GOOGLE_SCOPE = https://www.googleapis.com/auth/business.manage
   ```

3. **Airtable Integration:**
   - Connect your Airtable base using the schema we created
   - Set up API key and base ID in MindStudio variables

---

## 2. Workflow 1: Restaurant Landing & Tier Selection

### Trigger: Public URL/Form Submission
**Purpose:** Capture restaurant interest and tier selection

### MindStudio Implementation:
```yaml
Workflow Name: "Restaurant Landing"
Trigger: Form Submission
Input Fields:
  - restaurant_name (text)
  - owner_name (text)
  - owner_email (email)
  - phone_number (phone)
  - tier_selection (dropdown: "Starter Pack $149", "Pro Pack $299")
```

### Steps:
1. **Input Validation Node**
   - Validate email format
   - Check for duplicate restaurants in Airtable
   - Generate unique restaurant_id

2. **Airtable Create Record**
   - Table: "Restaurants"
   - Fields:
     ```json
     {
       "restaurant_id": "{{generated_id}}",
       "restaurant_name": "{{restaurant_name}}",
       "owner_name": "{{owner_name}}",
       "owner_email": "{{owner_email}}",
       "phone_number": "{{phone_number}}",
       "tier": "{{tier_selection}}",
       "status": "Onboarding",
       "created_at": "{{current_timestamp}}"
     }
     ```

3. **Trigger OAuth Flow**
   - Call "OAuth Initialization" workflow
   - Pass restaurant_id as parameter

---

## 3. Workflow 2: OAuth Initialization

### Trigger: Called from Restaurant Landing
**Purpose:** Generate OAuth URL and redirect user

### MindStudio Implementation:
```yaml
Workflow Name: "OAuth Initialization"
Trigger: Webhook Call
Input: restaurant_id
```

### Steps:
1. **Generate State Token**
   ```javascript
   // Custom Code Node
   const crypto = require('crypto');
   const state = crypto.randomBytes(32).toString('hex');

   // Store state with restaurant_id for validation
   return {
     state: state,
     restaurant_id: input.restaurant_id
   };
   ```

2. **Store State in Airtable**
   - Table: "OAuth_States" (temporary table)
   - Fields:
     ```json
     {
       "state_token": "{{state}}",
       "restaurant_id": "{{restaurant_id}}",
       "created_at": "{{current_timestamp}}",
       "expires_at": "{{current_timestamp + 10_minutes}}"
     }
     ```

3. **Generate Authorization URL**
   ```javascript
   // Custom Code Node
   const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
   const params = new URLSearchParams({
     client_id: process.env.GOOGLE_CLIENT_ID,
     redirect_uri: process.env.GOOGLE_REDIRECT_URI,
     scope: process.env.GOOGLE_SCOPE,
     response_type: 'code',
     access_type: 'offline',
     prompt: 'consent',
     state: input.state
   });

   return {
     auth_url: `${baseUrl}?${params.toString()}`
   };
   ```

4. **Send Email with Auth Link**
   ```html
   Subject: Complete Your Google Business Profile Connection

   Hi {{owner_name}},

   You're almost done! Click the link below to connect your Google Business Profile:

   [Connect Google Business Profile]({{auth_url}})

   This link expires in 10 minutes for security.

   Questions? Reply to this email.

   Best,
   Restaurant Review AI Team
   ```

---

## 4. Workflow 3: OAuth Callback Handler

### Trigger: Webhook (Google OAuth Redirect)
**Purpose:** Handle OAuth callback and exchange code for tokens

### MindStudio Webhook Setup:
```
URL: https://your-mindstudio-webhook.com/oauth/callback
Method: GET
Parameters: code, state, error (optional)
```

### MindStudio Implementation:
```yaml
Workflow Name: "OAuth Callback Handler"
Trigger: Webhook
Input: code, state, error
```

### Steps:
1. **Error Handling**
   ```javascript
   // Custom Code Node
   if (input.error) {
     return {
       error: true,
       error_type: input.error,
       error_description: input.error_description || 'OAuth authorization failed'
     };
   }

   if (!input.code || !input.state) {
     return {
       error: true,
       error_type: 'missing_parameters',
       error_description: 'Missing authorization code or state'
     };
   }

   return { error: false };
   ```

2. **Validate State Token**
   - Query Airtable "OAuth_States" table
   - Find record where state_token = input.state
   - Check expiration time
   - Get associated restaurant_id

3. **Exchange Code for Tokens**
   ```javascript
   // Custom Code Node - HTTP Request
   const tokenUrl = 'https://oauth2.googleapis.com/token';
   const tokenData = {
     client_id: process.env.GOOGLE_CLIENT_ID,
     client_secret: process.env.GOOGLE_CLIENT_SECRET,
     code: input.code,
     grant_type: 'authorization_code',
     redirect_uri: process.env.GOOGLE_REDIRECT_URI
   };

   // Make HTTP POST request
   const response = await fetch(tokenUrl, {
     method: 'POST',
     headers: {
       'Content-Type': 'application/x-www-form-urlencoded'
     },
     body: new URLSearchParams(tokenData)
   });

   const tokens = await response.json();

   if (tokens.error) {
     throw new Error(`Token exchange failed: ${tokens.error_description}`);
   }

   return tokens;
   ```

4. **Encrypt and Store Tokens**
   ```javascript
   // Custom Code Node - Token Encryption
   const crypto = require('crypto');

   function encryptToken(token) {
     const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY);
     let encrypted = cipher.update(token, 'utf8', 'hex');
     encrypted += cipher.final('hex');
     return encrypted;
   }

   return {
     encrypted_access_token: encryptToken(input.access_token),
     encrypted_refresh_token: encryptToken(input.refresh_token),
     expires_at: new Date(Date.now() + (input.expires_in * 1000)).toISOString(),
     scope: input.scope
   };
   ```

5. **Update Restaurant Record**
   - Update Airtable "Restaurants" table
   - Set status to "OAuth_Complete"
   - Store encrypted tokens
   - Update onboarded_at timestamp

6. **Clean Up State**
   - Delete used state token from OAuth_States table

7. **Redirect to Success Page**
   ```javascript
   // Return HTML response
   return {
     html: `
     <!DOCTYPE html>
     <html>
     <head><title>Connection Successful!</title></head>
     <body>
       <h1>🎉 Google Business Profile Connected!</h1>
       <p>Your account is now linked. Redirecting to setup...</p>
       <script>
         setTimeout(() => {
           window.location.href = 'https://your-app.com/setup/${restaurant_id}';
         }, 3000);
       </script>
     </body>
     </html>
     `
   };
   ```

---

## 5. Workflow 4: Brand Voice Setup (Pro Pack Only)

### Trigger: OAuth Success Redirect
**Purpose:** Collect brand voice preferences for Pro tier customers

### MindStudio Implementation:
```yaml
Workflow Name: "Brand Voice Setup"
Trigger: Public URL with restaurant_id parameter
Condition: tier = "Pro Pack"
```

### Steps:
1. **Load Restaurant Data**
   - Query Airtable for restaurant record
   - Verify OAuth completion
   - Check tier eligibility

2. **Brand Voice Questionnaire Form**
   ```html
   <form id="brandVoiceForm">
     <h2>Customize Your Restaurant's Voice</h2>

     <label>Restaurant Personality (select all that apply):</label>
     <input type="checkbox" name="personality" value="casual"> Casual & Relaxed
     <input type="checkbox" name="personality" value="formal"> Formal & Upscale
     <input type="checkbox" name="personality" value="family_friendly"> Family-Friendly

     <label>Communication Tone:</label>
     <select name="tone">
       <option value="professional">Professional but Warm</option>
       <option value="casual">Casual and Friendly</option>
       <option value="formal">Very Formal</option>
     </select>

     <label>Emoji Usage:</label>
     <select name="emoji_usage">
       <option value="never">Never</option>
       <option value="rarely">Rarely</option>
       <option value="sometimes">Sometimes</option>
       <option value="often">Often</option>
     </select>

     <label>Response Length:</label>
     <select name="response_length">
       <option value="brief">Brief (50-75 words)</option>
       <option value="moderate">Moderate (75-125 words)</option>
       <option value="detailed">Detailed (125-150 words)</option>
     </select>

     <label>Always Use These Phrases:</label>
     <textarea name="signature_phrases" placeholder="family recipes, homemade pasta"></textarea>

     <label>Never Use These Words:</label>
     <textarea name="prohibited_words" placeholder="sorry for the inconvenience"></textarea>

     <button type="submit">Save Voice Profile</button>
   </form>
   ```

3. **Process Form Submission**
   - Validate all inputs
   - Create Brand_Voice_Profile record in Airtable
   - Link to restaurant record

4. **Generate Sample Responses**
   ```javascript
   // Custom Code Node - AI Response Generation
   const sampleReviews = [
     { stars: 5, text: "Amazing pizza! Best in town!" },
     { stars: 2, text: "Food was okay but service was slow" },
     { stars: 4, text: "Great atmosphere, good pasta" }
   ];

   const responses = [];

   for (const review of sampleReviews) {
     const prompt = `
     Generate a restaurant response to this ${review.stars}-star review: "${review.text}"

     Brand Voice Settings:
     - Personality: ${brandVoice.personality}
     - Tone: ${brandVoice.tone}
     - Emoji Usage: ${brandVoice.emoji_usage}
     - Length: ${brandVoice.response_length}
     - Always use: ${brandVoice.signature_phrases}
     - Never use: ${brandVoice.prohibited_words}
     `;

     const response = await callClaude(prompt);
     responses.push({ review, response });
   }

   return responses;
   ```

5. **Show Sample Responses for Approval**
   - Display generated responses
   - Allow user to approve or request changes
   - Update voice profile based on feedback

---

## 6. Workflow 5: Restaurant Activation

### Trigger: Voice Setup Complete (or OAuth Complete for Starter Pack)
**Purpose:** Finalize setup and start review monitoring

### Steps:
1. **Update Restaurant Status**
   - Change status from "Onboarding" to "Active"
   - Set onboarded_at timestamp
   - Initialize monthly response counters

2. **Test Google API Access**
   ```javascript
   // Custom Code Node - API Test
   async function testGoogleAccess(encryptedTokens) {
     const decryptedTokens = decryptTokens(encryptedTokens);

     // Make test API call
     const response = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
       headers: {
         'Authorization': `Bearer ${decryptedTokens.access_token}`
       }
     });

     return {
       success: response.ok,
       statusCode: response.status
     };
   }
   ```

3. **Schedule First Review Fetch**
   - Trigger "Review Monitor" workflow for this restaurant
   - Set up weekly cron schedule

4. **Send Welcome Email**
   ```html
   Subject: Welcome to Restaurant Review AI! 🎉

   Hi {{owner_name}},

   Your restaurant "{{restaurant_name}}" is now connected and ready!

   What happens next:
   ✅ We'll monitor your Google reviews weekly
   ✅ Generate personalized responses using AI
   ✅ Send you email digests for approval
   ✅ Post approved responses automatically

   Your first review digest will arrive next Monday if you have new reviews.

   Dashboard: https://your-app.com/dashboard/{{restaurant_id}}

   Questions? Reply to this email.

   Best,
   Restaurant Review AI Team
   ```

---

## 7. Token Management System

### Workflow: Token Refresh Handler

```yaml
Workflow Name: "Token Refresh"
Trigger: Scheduled (Daily) + On-Demand
Purpose: Refresh expired access tokens
```

### Implementation:
```javascript
// Custom Code Node
async function refreshTokens(restaurant) {
  const decryptedRefreshToken = decrypt(restaurant.google_refresh_token_encrypted);

  const refreshData = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    refresh_token: decryptedRefreshToken,
    grant_type: 'refresh_token'
  };

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(refreshData)
  });

  const tokens = await response.json();

  if (tokens.error) {
    // Handle refresh token expired - need re-authorization
    await sendReauthorizationEmail(restaurant);
    return { success: false, needsReauth: true };
  }

  // Update tokens in Airtable
  await updateRestaurantTokens(restaurant.id, tokens);

  return { success: true };
}
```

---

## 8. Error Handling & Recovery

### Reauthorization Flow
```yaml
Workflow Name: "Handle OAuth Errors"
Trigger: API Error (401, 403)
```

### Steps:
1. **Detect Authorization Failure**
   - Monitor API responses for auth errors
   - Check token expiration dates

2. **Send Reauthorization Email**
   ```html
   Subject: Action Required: Reconnect Your Google Business Profile

   Hi {{owner_name}},

   We need to reconnect to your Google Business Profile to continue responding to reviews.

   This takes just 2 minutes:
   [Reconnect My Profile]({{reauth_url}})

   Why this happened:
   - Google requires periodic reauthorization for security
   - Your profile permissions may have changed

   What happens next:
   - Click the link above
   - Grant permissions again
   - We'll resume monitoring your reviews

   Questions? Reply to this email.

   Best,
   Restaurant Review AI Team
   ```

3. **Pause Operations**
   - Set restaurant status to "Reauth_Required"
   - Stop review monitoring until reconnected

---

## 9. Testing Strategy

### Development Testing
1. **OAuth Flow Test**
   - Use your working Node.js test suite
   - Validate each step in MindStudio

2. **Token Management Test**
   - Test refresh token flow
   - Validate encryption/decryption

3. **End-to-End Test**
   - Complete restaurant onboarding
   - Verify Airtable data integrity

### Production Validation
1. **Pilot Restaurant Setup**
   - Use test restaurant Google Business Profile
   - Complete full onboarding flow
   - Validate API access

---

## 10. MindStudio Configuration Checklist

### Environment Variables
- [ ] `GOOGLE_CLIENT_ID`
- [ ] `GOOGLE_CLIENT_SECRET`
- [ ] `GOOGLE_REDIRECT_URI`
- [ ] `GOOGLE_SCOPE`
- [ ] `ENCRYPTION_KEY` (for token security)
- [ ] `AIRTABLE_API_KEY`
- [ ] `AIRTABLE_BASE_ID`

### Webhook Endpoints
- [ ] OAuth callback handler
- [ ] Brand voice form submission
- [ ] Error handling webhooks

### Airtable Integration
- [ ] All tables connected
- [ ] Proper field mappings
- [ ] Relationship configurations

### Email Templates
- [ ] OAuth authorization email
- [ ] Welcome email
- [ ] Reauthorization email
- [ ] Error notification email

---

## 11. Next Steps for Implementation

1. **Week 1, Day 5-7:** Build MindStudio workflows
2. **Week 2, Day 1-2:** Test with pilot restaurant
3. **Week 2, Day 3-4:** Debug and refine
4. **Week 2, Day 5-7:** Production launch

### Success Criteria
- ✅ Restaurant can complete OAuth flow
- ✅ Tokens stored securely in Airtable
- ✅ Brand voice setup works for Pro tier
- ✅ API access validated
- ✅ Error handling functional

This implementation leverages your proven OAuth flow and adapts it perfectly for MindStudio's workflow environment!