# MindStudio Workflow Templates

Ready-to-use MindStudio workflow configurations for Restaurant Review AI OAuth implementation.

---

## Template 1: Restaurant Landing & Tier Selection

### MindStudio Configuration:
```yaml
Name: "Restaurant Landing"
Type: "Form Workflow"
Trigger: "Public Form"
```

### Form Fields Configuration:
```json
{
  "form_name": "Restaurant Onboarding",
  "fields": [
    {
      "name": "restaurant_name",
      "type": "text",
      "label": "Restaurant Name",
      "required": true,
      "placeholder": "e.g., Bella Italia Restaurant"
    },
    {
      "name": "owner_name",
      "type": "text",
      "label": "Your Name",
      "required": true,
      "placeholder": "e.g., Marco Rossi"
    },
    {
      "name": "owner_email",
      "type": "email",
      "label": "Email Address",
      "required": true,
      "placeholder": "marco@bellaitalia.com"
    },
    {
      "name": "phone_number",
      "type": "phone",
      "label": "Phone Number",
      "required": false,
      "placeholder": "(555) 123-4567"
    },
    {
      "name": "tier_selection",
      "type": "select",
      "label": "Choose Your Plan",
      "required": true,
      "options": [
        {"value": "starter", "label": "Starter Pack - $149/month"},
        {"value": "pro", "label": "Pro Pack - $299/month"}
      ]
    }
  ]
}
```

### Workflow Steps:

#### Step 1: Input Validation
```javascript
// Custom Code Node
function validateInputs(inputs) {
  const errors = [];

  // Restaurant name validation
  if (!inputs.restaurant_name || inputs.restaurant_name.length < 2) {
    errors.push("Restaurant name is required");
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(inputs.owner_email)) {
    errors.push("Valid email address is required");
  }

  // Generate unique restaurant ID
  const crypto = require('crypto');
  const restaurant_id = 'rest_' + crypto.randomBytes(8).toString('hex');

  return {
    isValid: errors.length === 0,
    errors: errors,
    restaurant_id: restaurant_id,
    processed_data: {
      ...inputs,
      restaurant_id: restaurant_id,
      created_at: new Date().toISOString(),
      status: "onboarding",
      monthly_response_limit: inputs.tier_selection === 'pro' ? 300 : 100,
      monthly_response_count: 0
    }
  };
}

const result = validateInputs(inputs);
if (!result.isValid) {
  throw new Error(`Validation failed: ${result.errors.join(', ')}`);
}

return result.processed_data;
```

#### Step 2: Create Restaurant Record
```json
{
  "node_type": "airtable_create",
  "table": "Restaurants",
  "fields": {
    "restaurant_id": "{{restaurant_id}}",
    "restaurant_name": "{{restaurant_name}}",
    "owner_name": "{{owner_name}}",
    "owner_email": "{{owner_email}}",
    "phone_number": "{{phone_number}}",
    "tier": "{{tier_selection}}",
    "status": "{{status}}",
    "monthly_response_limit": "{{monthly_response_limit}}",
    "monthly_response_count": "{{monthly_response_count}}",
    "created_at": "{{created_at}}"
  }
}
```

#### Step 3: Initialize OAuth Flow
```json
{
  "node_type": "workflow_call",
  "workflow_name": "OAuth Initialization",
  "inputs": {
    "restaurant_id": "{{restaurant_id}}",
    "owner_email": "{{owner_email}}",
    "owner_name": "{{owner_name}}"
  }
}
```

---

## Template 2: OAuth Initialization Workflow

### MindStudio Configuration:
```yaml
Name: "OAuth Initialization"
Type: "Webhook Workflow"
Trigger: "Internal Call"
```

### Workflow Steps:

#### Step 1: Generate State Token
```javascript
// Custom Code Node
const crypto = require('crypto');

function generateOAuthState(restaurant_id) {
  const state = crypto.randomBytes(32).toString('hex');
  const expires_at = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  return {
    state_token: state,
    restaurant_id: restaurant_id,
    created_at: new Date().toISOString(),
    expires_at: expires_at.toISOString()
  };
}

return generateOAuthState(inputs.restaurant_id);
```

#### Step 2: Store State in Airtable
```json
{
  "node_type": "airtable_create",
  "table": "OAuth_States",
  "fields": {
    "state_token": "{{state_token}}",
    "restaurant_id": "{{restaurant_id}}",
    "created_at": "{{created_at}}",
    "expires_at": "{{expires_at}}"
  }
}
```

#### Step 3: Generate Authorization URL
```javascript
// Custom Code Node
function generateAuthURL(state) {
  const baseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI,
    scope: process.env.GOOGLE_SCOPE,
    response_type: 'code',
    access_type: 'offline',
    prompt: 'consent',
    state: state
  });

  return {
    auth_url: `${baseUrl}?${params.toString()}`,
    expires_in_minutes: 10
  };
}

return generateAuthURL(inputs.state_token);
```

#### Step 4: Send Authorization Email
```json
{
  "node_type": "email_send",
  "to": "{{owner_email}}",
  "subject": "Connect Your Google Business Profile - Restaurant Review AI",
  "template": "oauth_authorization",
  "variables": {
    "owner_name": "{{owner_name}}",
    "auth_url": "{{auth_url}}",
    "expires_in_minutes": "{{expires_in_minutes}}"
  }
}
```

### Email Template: oauth_authorization
```html
<!DOCTYPE html>
<html>
<head>
    <title>Connect Your Google Business Profile</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .button {
            background: #4285f4; color: white; padding: 15px 30px;
            text-decoration: none; border-radius: 5px; display: inline-block;
            margin: 20px 0; font-size: 16px; font-weight: bold;
        }
        .button:hover { background: #3367d6; }
        .warning {
            background: #fff3cd; border: 1px solid #ffeaa7;
            padding: 15px; border-radius: 5px; margin: 20px 0;
        }
    </style>
</head>
<body>
    <h1>🔐 Complete Your Google Business Profile Connection</h1>

    <p>Hi {{owner_name}},</p>

    <p>You're almost done setting up Restaurant Review AI! We need to connect to your Google Business Profile to start monitoring and responding to your reviews.</p>

    <div style="text-align: center;">
        <a href="{{auth_url}}" class="button">🔗 Connect Google Business Profile</a>
    </div>

    <div class="warning">
        <strong>⏰ Important:</strong> This link expires in {{expires_in_minutes}} minutes for security reasons. If it expires, you can request a new one from your dashboard.
    </div>

    <h3>What happens next:</h3>
    <ol>
        <li>Click the button above to open Google's authorization page</li>
        <li>Sign in to your Google account that manages your restaurant</li>
        <li>Grant permission to access your Google Business Profile</li>
        <li>You'll be redirected back to complete your setup</li>
    </ol>

    <h3>Need help?</h3>
    <p>If you have trouble connecting your Google Business Profile, reply to this email and we'll help you get set up.</p>

    <p>Best regards,<br>
    The Restaurant Review AI Team</p>

    <hr>
    <small>This email was sent to {{owner_email}} because you signed up for Restaurant Review AI. If you didn't request this, you can safely ignore this email.</small>
</body>
</html>
```

---

## Template 3: OAuth Callback Handler

### MindStudio Configuration:
```yaml
Name: "OAuth Callback Handler"
Type: "Webhook Workflow"
Trigger: "Public Webhook"
URL: "/oauth/callback"
Method: "GET"
```

### Workflow Steps:

#### Step 1: Validate Callback Parameters
```javascript
// Custom Code Node
function validateCallback(params) {
  // Handle OAuth errors
  if (params.error) {
    return {
      success: false,
      error_type: params.error,
      error_description: params.error_description || 'OAuth authorization failed',
      redirect_url: `/error?type=${params.error}`
    };
  }

  // Check required parameters
  if (!params.code || !params.state) {
    return {
      success: false,
      error_type: 'missing_parameters',
      error_description: 'Missing authorization code or state token',
      redirect_url: '/error?type=missing_parameters'
    };
  }

  return {
    success: true,
    code: params.code,
    state: params.state,
    scope: params.scope
  };
}

const result = validateCallback(inputs);
if (!result.success) {
  // Handle error - could redirect or throw
  throw new Error(result.error_description);
}

return result;
```

#### Step 2: Validate State Token
```json
{
  "node_type": "airtable_find",
  "table": "OAuth_States",
  "filter": {
    "state_token": "{{state}}"
  },
  "max_records": 1
}
```

#### Step 3: State Validation Logic
```javascript
// Custom Code Node
function validateState(stateRecords, currentState) {
  if (!stateRecords || stateRecords.length === 0) {
    throw new Error('Invalid or expired state token');
  }

  const stateRecord = stateRecords[0];
  const expiresAt = new Date(stateRecord.expires_at);
  const now = new Date();

  if (now > expiresAt) {
    throw new Error('State token has expired');
  }

  return {
    restaurant_id: stateRecord.restaurant_id,
    state_record_id: stateRecord.id
  };
}

return validateState(inputs.state_records, inputs.state);
```

#### Step 4: Exchange Code for Tokens
```javascript
// Custom Code Node
async function exchangeCodeForTokens(authCode) {
  const tokenUrl = 'https://oauth2.googleapis.com/token';

  const tokenData = {
    client_id: process.env.GOOGLE_CLIENT_ID,
    client_secret: process.env.GOOGLE_CLIENT_SECRET,
    code: authCode,
    grant_type: 'authorization_code',
    redirect_uri: process.env.GOOGLE_REDIRECT_URI
  };

  try {
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

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      scope: tokens.scope,
      token_type: tokens.token_type,
      expires_at: new Date(Date.now() + (tokens.expires_in * 1000)).toISOString()
    };

  } catch (error) {
    throw new Error(`Token exchange failed: ${error.message}`);
  }
}

return await exchangeCodeForTokens(inputs.code);
```

#### Step 5: Encrypt Tokens
```javascript
// Custom Code Node
const crypto = require('crypto');

function encryptToken(token, key) {
  const algorithm = 'aes-256-cbc';
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipher(algorithm, key);

  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return `${iv.toString('hex')}:${encrypted}`;
}

function encryptTokens(tokens) {
  const encryptionKey = process.env.ENCRYPTION_KEY || 'default_key_change_in_production';

  return {
    encrypted_access_token: encryptToken(tokens.access_token, encryptionKey),
    encrypted_refresh_token: encryptToken(tokens.refresh_token, encryptionKey),
    expires_at: tokens.expires_at,
    scope: tokens.scope,
    token_type: tokens.token_type
  };
}

return encryptTokens(inputs);
```

#### Step 6: Update Restaurant Record
```json
{
  "node_type": "airtable_update",
  "table": "Restaurants",
  "filter": {
    "restaurant_id": "{{restaurant_id}}"
  },
  "fields": {
    "google_access_token_encrypted": "{{encrypted_access_token}}",
    "google_refresh_token_encrypted": "{{encrypted_refresh_token}}",
    "google_token_expires_at": "{{expires_at}}",
    "status": "oauth_complete",
    "onboarded_at": "{{current_timestamp}}"
  }
}
```

#### Step 7: Clean Up State Token
```json
{
  "node_type": "airtable_delete",
  "table": "OAuth_States",
  "record_id": "{{state_record_id}}"
}
```

#### Step 8: Success Response
```javascript
// Custom Code Node
function generateSuccessResponse(restaurantId, tier) {
  const nextStep = tier === 'pro' ? 'brand-voice-setup' : 'activation';

  return {
    html: `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Connection Successful!</title>
        <style>
            body {
                font-family: Arial, sans-serif; max-width: 600px;
                margin: 50px auto; padding: 20px; text-align: center;
            }
            .success { color: #28a745; font-size: 24px; margin: 20px 0; }
            .next-steps {
                background: #e6f7ff; padding: 20px; border-radius: 8px;
                margin: 30px 0; text-align: left;
            }
            .button {
                background: #28a745; color: white; padding: 15px 30px;
                text-decoration: none; border-radius: 5px;
                display: inline-block; margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <h1>🎉 Google Business Profile Connected!</h1>

        <div class="success">
            ✅ Your restaurant is now linked to Restaurant Review AI
        </div>

        <div class="next-steps">
            <h3>What happens next:</h3>
            <ol>
                <li>Complete your setup (${tier === 'pro' ? 'customize your brand voice' : 'activate your account'})</li>
                <li>We'll start monitoring your Google reviews weekly</li>
                <li>You'll receive email digests with AI-generated responses</li>
                <li>Approve responses and we'll post them for you</li>
            </ol>
        </div>

        <a href="/setup/${restaurantId}/${nextStep}" class="button">
            Continue Setup →
        </a>

        <p><small>Redirecting automatically in 5 seconds...</small></p>

        <script>
            setTimeout(() => {
                window.location.href = '/setup/${restaurantId}/${nextStep}';
            }, 5000);
        </script>
    </body>
    </html>
    `,
    status_code: 200,
    headers: {
      'Content-Type': 'text/html'
    }
  };
}

return generateSuccessResponse(inputs.restaurant_id, inputs.tier);
```

---

## Template 4: Pro Pack Brand Voice Setup

### MindStudio Configuration:
```yaml
Name: "Brand Voice Setup"
Type: "Form Workflow"
Trigger: "Public URL"
URL: "/setup/{restaurant_id}/brand-voice-setup"
```

### Pre-Step: Load Restaurant Data
```json
{
  "node_type": "airtable_find",
  "table": "Restaurants",
  "filter": {
    "restaurant_id": "{{url_params.restaurant_id}}"
  },
  "max_records": 1
}
```

### Form Fields:
```json
{
  "form_name": "Brand Voice Customization",
  "fields": [
    {
      "name": "personality",
      "type": "checkbox_group",
      "label": "Restaurant Personality (select all that apply)",
      "required": true,
      "options": [
        {"value": "formal", "label": "Formal & Upscale"},
        {"value": "casual", "label": "Casual & Relaxed"},
        {"value": "playful", "label": "Fun & Playful"},
        {"value": "sophisticated", "label": "Sophisticated & Modern"},
        {"value": "traditional", "label": "Traditional & Classic"},
        {"value": "family_friendly", "label": "Family-Friendly & Warm"},
        {"value": "trendy", "label": "Trendy & Hip"}
      ]
    },
    {
      "name": "tone",
      "type": "select",
      "label": "Communication Tone",
      "required": true,
      "options": [
        {"value": "very_formal", "label": "Very formal (e.g., \"We sincerely appreciate your patronage\")"},
        {"value": "professional_warm", "label": "Professional but warm (e.g., \"Thank you so much for visiting us\")"},
        {"value": "casual_friendly", "label": "Casual and friendly (e.g., \"Thanks for stopping by!\")"},
        {"value": "very_casual", "label": "Very casual (e.g., \"Hey, thanks for coming in!\")"}
      ]
    },
    {
      "name": "emoji_usage",
      "type": "select",
      "label": "Emoji Usage",
      "required": true,
      "options": [
        {"value": "never", "label": "Never - Keep it text-only"},
        {"value": "rarely", "label": "Rarely - Only for very positive reviews (🎉 👏)"},
        {"value": "sometimes", "label": "Sometimes - A few here and there (😊 🍕)"},
        {"value": "often", "label": "Often - Emojis add personality! (✨ 🙌 ❤️)"}
      ]
    },
    {
      "name": "self_reference",
      "type": "select",
      "label": "How do you refer to your restaurant?",
      "required": true,
      "options": [
        {"value": "we", "label": "\"We\" or \"Our team\""},
        {"value": "restaurant_name", "label": "Restaurant name"},
        {"value": "owner_name", "label": "\"I\" (owner's voice)"},
        {"value": "mixed", "label": "Mix it up based on context"}
      ]
    },
    {
      "name": "owner_name_for_responses",
      "type": "text",
      "label": "Your first name (if using \"I\" voice)",
      "required": false,
      "placeholder": "e.g., Marco",
      "show_if": {"self_reference": "owner_name"}
    },
    {
      "name": "response_length",
      "type": "select",
      "label": "Response Length Preference",
      "required": true,
      "options": [
        {"value": "brief", "label": "Brief (50-75 words) - Quick and to the point"},
        {"value": "moderate", "label": "Moderate (75-125 words) - Balanced"},
        {"value": "detailed", "label": "Detailed (125-150 words) - Thorough and comprehensive"}
      ]
    },
    {
      "name": "signature_phrases",
      "type": "textarea",
      "label": "Always Use These Phrases",
      "required": false,
      "placeholder": "e.g., family recipes, homemade pasta, farm-to-table",
      "help_text": "Comma-separated phrases you want to include when relevant"
    },
    {
      "name": "prohibited_words",
      "type": "textarea",
      "label": "Never Use These Words/Phrases",
      "required": false,
      "placeholder": "e.g., sorry for the inconvenience, world-class",
      "help_text": "Comma-separated words or phrases to avoid"
    },
    {
      "name": "special_policies",
      "type": "textarea",
      "label": "Special Policies or Guarantees to Mention",
      "required": false,
      "placeholder": "e.g., 100% satisfaction guarantee, free dessert for complaints",
      "help_text": "Any policies you want mentioned when addressing complaints"
    }
  ]
}
```

### Brand Voice Processing Step:
```javascript
// Custom Code Node
function processBrandVoice(formData, restaurantId) {
  // Process checkbox arrays
  const personality = Array.isArray(formData.personality)
    ? formData.personality
    : [formData.personality];

  // Process comma-separated lists
  const signaturePhrases = formData.signature_phrases
    ? formData.signature_phrases.split(',').map(p => p.trim()).filter(p => p)
    : [];

  const prohibitedWords = formData.prohibited_words
    ? formData.prohibited_words.split(',').map(w => w.trim()).filter(w => w)
    : [];

  return {
    restaurant_id: restaurantId,
    personality: personality,
    tone: formData.tone,
    emoji_usage: formData.emoji_usage,
    self_reference: formData.self_reference,
    owner_name_for_responses: formData.owner_name_for_responses || null,
    response_length_preference: formData.response_length,
    signature_phrases: signaturePhrases,
    prohibited_words: prohibitedWords,
    special_policies: formData.special_policies || null,
    created_at: new Date().toISOString(),
    last_updated_at: new Date().toISOString()
  };
}

return processBrandVoice(inputs.form_data, inputs.restaurant_id);
```

### Create Brand Voice Profile:
```json
{
  "node_type": "airtable_create",
  "table": "Brand_Voice_Profiles",
  "fields": {
    "restaurant_id": "{{restaurant_id}}",
    "personality": "{{personality}}",
    "tone": "{{tone}}",
    "emoji_usage": "{{emoji_usage}}",
    "self_reference": "{{self_reference}}",
    "owner_name_for_responses": "{{owner_name_for_responses}}",
    "response_length_preference": "{{response_length_preference}}",
    "signature_phrases": "{{signature_phrases}}",
    "prohibited_words": "{{prohibited_words}}",
    "special_policies": "{{special_policies}}",
    "created_at": "{{created_at}}",
    "last_updated_at": "{{last_updated_at}}"
  }
}
```

---

## Template 5: Sample Response Generation

### Generate Sample Responses:
```javascript
// Custom Code Node - AI Sample Generation
async function generateSampleResponses(brandVoice, restaurantName) {
  const sampleReviews = [
    {
      stars: 5,
      text: "Amazing pizza! The margherita was perfect and the service was excellent. Will definitely be back!",
      reviewer: "Sarah M."
    },
    {
      stars: 2,
      text: "Food was okay but the wait time was way too long. Server seemed overwhelmed and forgot our drinks.",
      reviewer: "Mark T."
    },
    {
      stars: 4,
      text: "Good pasta and nice atmosphere. Prices are reasonable and the staff was friendly.",
      reviewer: "Jennifer L."
    }
  ];

  const responses = [];

  for (const review of sampleReviews) {
    const prompt = createBrandVoicePrompt(review, brandVoice, restaurantName);

    // Call Claude via MindStudio AI node
    const response = await callAI({
      model: "claude-sonnet-4.5",
      prompt: prompt,
      max_tokens: 200
    });

    responses.push({
      review: review,
      generated_response: response.content,
      review_type: review.stars >= 4 ? 'positive' : (review.stars >= 3 ? 'neutral' : 'negative')
    });
  }

  return responses;
}

function createBrandVoicePrompt(review, brandVoice, restaurantName) {
  const lengthGuide = {
    brief: "50-75 words",
    moderate: "75-125 words",
    detailed: "125-150 words"
  };

  const toneGuide = {
    very_formal: "very formal and professional language",
    professional_warm: "professional but warm and friendly tone",
    casual_friendly: "casual and friendly conversational tone",
    very_casual: "very casual and relaxed language"
  };

  return `You are writing a response to a Google Maps review for ${restaurantName}.

Review Details:
- Star Rating: ${review.stars} stars
- Review Text: "${review.text}"
- Reviewer: ${review.reviewer}

Brand Voice Settings:
- Personality: ${brandVoice.personality.join(', ')}
- Tone: ${toneGuide[brandVoice.tone]}
- Emoji Usage: ${brandVoice.emoji_usage}
- Response Length: ${lengthGuide[brandVoice.response_length_preference]}
- Self Reference: ${brandVoice.self_reference}
${brandVoice.signature_phrases.length > 0 ? `- Always include when relevant: ${brandVoice.signature_phrases.join(', ')}` : ''}
${brandVoice.prohibited_words.length > 0 ? `- Never use these words: ${brandVoice.prohibited_words.join(', ')}` : ''}
${brandVoice.special_policies ? `- Mention when addressing complaints: ${brandVoice.special_policies}` : ''}

Generate a response that:
1. ${review.stars <= 2 ? 'Acknowledges and apologizes for the poor experience' : 'Thanks the customer for their positive feedback'}
2. Addresses specific points mentioned in the review
3. Matches the brand voice settings exactly
4. Feels authentic and personal, not generic
5. ${review.stars <= 2 ? 'Invites them to contact management or return for a better experience' : 'Encourages them to visit again'}

Response:`;
}

return await generateSampleResponses(inputs.brand_voice, inputs.restaurant_name);
```

---

## Quick Implementation Checklist

### MindStudio Setup Steps:

1. **Environment Variables** (MindStudio Settings):
   ```
   GOOGLE_CLIENT_ID = insert.here.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET = INSERT_SECRET_HERE
   GOOGLE_REDIRECT_URI = https://your-mindstudio-webhook-url.com/oauth/callback
   GOOGLE_SCOPE = https://www.googleapis.com/auth/business.manage
   ENCRYPTION_KEY = [generate-secure-key]
   ```

2. **Airtable Integration**:
   - Connect Airtable base
   - Configure all tables from schema
   - Test record creation

3. **Workflow Creation Order**:
   1. Restaurant Landing (Form)
   2. OAuth Initialization (Internal)
   3. OAuth Callback Handler (Webhook)
   4. Brand Voice Setup (Form, Pro only)
   5. Restaurant Activation (Internal)

4. **Testing Strategy**:
   - Test each workflow individually
   - Use your working OAuth credentials
   - Validate Airtable data flow
   - Test error scenarios

### Success Criteria:
- ✅ Restaurant can submit landing form
- ✅ OAuth email sent with auth URL
- ✅ OAuth callback processes tokens correctly
- ✅ Tokens encrypted and stored in Airtable
- ✅ Brand voice setup works for Pro tier
- ✅ Restaurant marked as "Active"

These templates give you copy-paste configurations for MindStudio that mirror your proven OAuth flow!