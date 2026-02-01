# Google OAuth Flow Workflow Specification

## Overview
This workflow handles the OAuth 2.0 authentication flow for connecting restaurant Google Business Profiles to our AI review response service. The implementation follows Google My Business API v4.9+ requirements with offline access for ongoing review monitoring.

## Technical Requirements
- **API Version**: Google My Business API v4.9+
- **Authentication**: OAuth 2.0 with offline access
- **Required Scope**: `https://www.googleapis.com/auth/business.manage`
- **Access Level**: Manager (no Google Workspace required)
- **Rate Limits**: 1,500 requests per day per project

## Workflow Components

### 1. Initial Setup & Credentials
```
Component: OAuth Setup
Platform: MindStudio + Google Cloud Console
```

**Prerequisites:**
- Google Cloud Console project created
- Google My Business API enabled
- OAuth 2.0 credentials configured
- Redirect URI whitelist updated

**Configuration:**
```json
{
  "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "client_secret": "YOUR_CLIENT_SECRET",
  "redirect_uri": "https://mindstudio.ai/oauth/callback",
  "scope": "https://www.googleapis.com/auth/business.manage",
  "access_type": "offline",
  "approval_prompt": "force"
}
```

### 2. Restaurant Onboarding OAuth Flow

#### Step 2.1: Initialize OAuth Request
```
Trigger: User clicks "Connect Google Business Profile" during onboarding
Platform: MindStudio
```

**Process:**
1. Generate unique state parameter for CSRF protection
2. Store user session data (restaurant_id, onboarding_step)
3. Construct authorization URL
4. Redirect user to Google OAuth consent screen

**Authorization URL:**
```
https://accounts.google.com/o/oauth2/v2/auth
  ?client_id={CLIENT_ID}
  &redirect_uri={REDIRECT_URI}
  &scope=https://www.googleapis.com/auth/business.manage
  &response_type=code
  &access_type=offline
  &approval_prompt=force
  &state={UNIQUE_STATE_TOKEN}
```

#### Step 2.2: Handle OAuth Callback
```
Trigger: Google redirects back with authorization code
Platform: MindStudio Webhook
```

**Callback Validation:**
1. Verify state parameter matches stored value
2. Check for error parameter in callback
3. Extract authorization code
4. Validate code is not empty

**Error Handling:**
```javascript
if (params.error) {
  switch(params.error) {
    case 'access_denied':
      return redirect_to_onboarding_with_message("Permission denied. Please grant access to continue.")
    case 'invalid_request':
      return redirect_to_onboarding_with_message("Invalid request. Please try again.")
    default:
      return redirect_to_onboarding_with_message("Authentication failed. Please try again.")
  }
}
```

#### Step 2.3: Exchange Code for Tokens
```
Platform: MindStudio API Call
Method: POST
URL: https://oauth2.googleapis.com/token
```

**Token Exchange Request:**
```json
{
  "client_id": "{CLIENT_ID}",
  "client_secret": "{CLIENT_SECRET}",
  "code": "{AUTHORIZATION_CODE}",
  "grant_type": "authorization_code",
  "redirect_uri": "{REDIRECT_URI}"
}
```

**Expected Response:**
```json
{
  "access_token": "ya29.a0AfH6SMC...",
  "refresh_token": "1//04FQjQZ...",
  "expires_in": 3599,
  "scope": "https://www.googleapis.com/auth/business.manage",
  "token_type": "Bearer"
}
```

**Token Storage:**
```javascript
// Store in encrypted format in Airtable
{
  restaurant_id: restaurant.id,
  google_access_token: encrypt(response.access_token),
  google_refresh_token: encrypt(response.refresh_token),
  token_expires_at: new Date(Date.now() + (response.expires_in * 1000)),
  scope_granted: response.scope,
  connected_at: new Date()
}
```

### 3. Business Profile Verification

#### Step 3.1: Fetch Business Profiles
```
Platform: MindStudio
Trigger: Immediately after token exchange
```

**API Call:**
```
GET https://mybusiness.googleapis.com/v4/accounts
Authorization: Bearer {ACCESS_TOKEN}
```

**Profile Validation:**
```javascript
// Verify user has at least one business location
if (accounts.length === 0) {
  return error("No Google Business Profiles found. Please create a profile first.")
}

// For MVP: Single location only
if (accounts[0].locations.length > 1) {
  // Show location selector (future feature)
  // For now, use first location
}

const primaryLocation = accounts[0].locations[0]
```

#### Step 3.2: Test API Access
```
Platform: MindStudio
Purpose: Verify Manager-level access
```

**Permission Test:**
```
GET https://mybusiness.googleapis.com/v4/accounts/{ACCOUNT_ID}/locations/{LOCATION_ID}/reviews
Authorization: Bearer {ACCESS_TOKEN}
```

**Access Verification:**
```javascript
// Test if we can read reviews (Manager permission)
try {
  const testReviews = await fetchReviews(accessToken, locationId)
  if (testReviews.error && testReviews.error.code === 403) {
    return error("Insufficient permissions. Please grant Manager access.")
  }
} catch (error) {
  return error("Unable to access your business profile. Please check permissions.")
}
```

### 4. Token Refresh Management

#### Step 4.1: Automatic Token Refresh
```
Trigger: Before any Google API call
Platform: MindStudio Function
```

**Refresh Logic:**
```javascript
function ensureValidToken(restaurantId) {
  const tokenData = getStoredTokens(restaurantId)

  // Check if token expires within 5 minutes
  if (tokenData.expires_at < new Date(Date.now() + 5 * 60 * 1000)) {
    return refreshAccessToken(tokenData.refresh_token, restaurantId)
  }

  return tokenData.access_token
}
```

#### Step 4.2: Refresh Token Process
```
Platform: MindStudio API Call
Method: POST
URL: https://oauth2.googleapis.com/token
```

**Refresh Request:**
```json
{
  "client_id": "{CLIENT_ID}",
  "client_secret": "{CLIENT_SECRET}",
  "refresh_token": "{STORED_REFRESH_TOKEN}",
  "grant_type": "refresh_token"
}
```

**Update Stored Tokens:**
```javascript
// Update only access token and expiry
{
  google_access_token: encrypt(newAccessToken),
  token_expires_at: new Date(Date.now() + (expiresIn * 1000)),
  last_refreshed: new Date()
}
```

### 5. Error Handling & Recovery

#### Step 5.1: Common Error Scenarios
```
Platform: MindStudio
Implementation: Error handling in all API calls
```

**Error Response Matrix:**
```javascript
const errorHandling = {
  401: {
    message: "Invalid credentials",
    action: "attempt_token_refresh",
    fallback: "request_reauthorization"
  },
  403: {
    message: "Insufficient permissions",
    action: "verify_manager_access",
    fallback: "show_permission_instructions"
  },
  404: {
    message: "Business profile not found",
    action: "verify_profile_exists",
    fallback: "help_create_profile"
  },
  429: {
    message: "Rate limit exceeded",
    action: "exponential_backoff",
    fallback: "queue_for_later"
  },
  500: {
    message: "Google API error",
    action: "retry_with_backoff",
    fallback: "manual_notification"
  }
}
```

#### Step 5.2: Reauthorization Flow
```
Trigger: Refresh token invalid or expired
Platform: MindStudio Email + Web Interface
```

**Reauthorization Process:**
1. Send email notification to restaurant owner
2. Pause all automated operations for that restaurant
3. Provide simple reauthorization link
4. Resume operations after successful reconnection

**Email Template:**
```
Subject: Action Required: Reconnect Your Google Business Profile

Hi [Owner Name],

We need to reconnect to your Google Business Profile to continue responding to reviews.

This takes just 2 minutes:
[Reconnect My Profile]

Why this happened:
- Google requires periodic reauthorization for security
- Your profile permissions may have changed

What happens next:
- Click the link above
- Grant permissions again
- We'll resume monitoring your reviews

Questions? Reply to this email.

Best,
The [App Name] Team
```

### 6. Security Measures

#### Step 6.1: Token Encryption
```
Platform: MindStudio Variables (Encrypted Storage)
Implementation: All tokens encrypted at rest
```

**Encryption Requirements:**
- Use AES-256 encryption for all stored tokens
- Separate encryption keys per restaurant
- Never log tokens in plain text
- Rotate encryption keys quarterly

#### Step 6.2: Access Logging
```
Platform: MindStudio
Purpose: Audit trail for all OAuth operations
```

**Logging Events:**
```javascript
const auditEvents = {
  oauth_started: { user_id, timestamp, ip_address },
  oauth_completed: { user_id, timestamp, scope_granted },
  oauth_failed: { user_id, timestamp, error_type, error_message },
  token_refreshed: { user_id, timestamp },
  token_revoked: { user_id, timestamp, reason },
  api_call_failed: { user_id, timestamp, endpoint, error_code }
}
```

### 7. Testing & Validation

#### Step 7.1: OAuth Flow Testing
```
Platform: MindStudio Test Environment
Scope: End-to-end flow validation
```

**Test Scenarios:**
1. **Happy Path**: Complete OAuth flow with valid Google Business Profile
2. **Permission Denied**: User denies access during consent
3. **Invalid Profile**: User without Google Business Profile
4. **Insufficient Access**: User with Viewer-only permissions
5. **Network Errors**: API timeouts and connection failures
6. **Token Expiry**: Refresh token flow validation

#### Step 7.2: Production Validation
```
Implementation: Pre-launch checklist
```

**Validation Checklist:**
- [ ] OAuth consent screen approved by Google
- [ ] Redirect URIs properly configured
- [ ] Rate limiting implemented
- [ ] Error handling covers all scenarios
- [ ] Token encryption working correctly
- [ ] Reauthorization flow tested
- [ ] API permissions verified (Manager level)
- [ ] Multi-location handling planned

### 8. Implementation Timeline

#### Week 1 - Days 3-4: OAuth Integration
```
Day 3 (Wednesday):
- [ ] Google Cloud Console project setup
- [ ] OAuth credentials configuration
- [ ] MindStudio OAuth workflow creation
- [ ] Basic authorization URL generation

Day 4 (Thursday):
- [ ] Callback handler implementation
- [ ] Token exchange functionality
- [ ] Error handling framework
- [ ] Business profile verification
```

**Deliverables:**
- Working OAuth flow (authorization → token exchange)
- Basic error handling
- Token storage in encrypted format
- Business profile connection validation

## Dependencies

**External Services:**
- Google Cloud Console project
- Google My Business API access
- MindStudio platform

**Internal Components:**
- Restaurant database (Airtable)
- Encryption service
- Email notification system

## Success Criteria

**Functional Requirements:**
- [ ] 100% of valid restaurants can complete OAuth flow
- [ ] 0% false negatives on permission verification
- [ ] < 1% token refresh failures
- [ ] < 5 second average OAuth completion time

**Security Requirements:**
- [ ] All tokens encrypted at rest
- [ ] No tokens logged in plain text
- [ ] CSRF protection implemented
- [ ] Audit trail for all OAuth events

**User Experience:**
- [ ] Clear error messages for all failure scenarios
- [ ] Simple reauthorization process
- [ ] No manual technical steps required
- [ ] Works on mobile and desktop browsers

## Monitoring & Alerts

**Key Metrics:**
- OAuth completion rate
- Token refresh success rate
- API error frequency
- Reauthorization requests

**Alert Triggers:**
- OAuth completion rate < 90%
- API error rate > 5%
- Multiple token refresh failures for same restaurant
- Unusual OAuth attempt patterns (security)