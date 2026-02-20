# Google My Business OAuth Test Suite

Comprehensive testing environment for validating Google My Business API integration and OAuth flow for the Restaurant Review Response Automation project.

## 🚀 Quick Start

### 1. Configure Credentials

Copy the environment template:
```bash
cp .env.example .env
```

Fill in your Google OAuth credentials in `.env`:
```env
GOOGLE_CLIENT_ID=your_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth/callback
```

### 2. Run Tests

**Option A: Interactive Web Interface (Recommended)**
```bash
npm run server
```
Open http://localhost:3000 in your browser and follow the guided testing process.

**Option B: Command Line Testing**
```bash
# Run complete test suite
npm test

# Run individual components
npm run oauth    # OAuth flow only
npm run gmb      # API tests only
```

## 📋 Test Components

### 🔐 OAuth Flow Tests
- Authorization URL generation
- CSRF protection (state validation)
- Token exchange
- Token refresh functionality
- Error handling

### 🏢 Google My Business API Tests
- Account access validation
- Location retrieval
- Permission verification (Manager level)
- Review fetching (mock for MVP)
- Response posting capability

### 🔗 Integration Tests
- End-to-end workflow validation
- Production readiness check
- Complete restaurant onboarding simulation

## 📊 Test Reports

After running tests, check:
- `test-report.json` - Detailed JSON report
- Console output - Real-time progress and summary
- Token storage in `tokens.json` for reuse

## 🛠️ Scripts Reference

| Command | Purpose |
|---------|---------|
| `npm run server` | Start OAuth callback server with web UI |
| `npm test` | Run complete test suite |
| `npm run oauth` | Test OAuth flow only |
| `npm run gmb` | Test GMB API access only |

## 🔧 Configuration Options

### Environment Variables
```env
GOOGLE_CLIENT_ID=           # OAuth 2.0 Client ID
GOOGLE_CLIENT_SECRET=       # OAuth 2.0 Client Secret
GOOGLE_REDIRECT_URI=        # Callback URL
GOOGLE_SCOPE=              # API scope (default: business.manage)
PORT=                      # Server port (default: 3000)
TEST_TIMEOUT=              # Test timeout ms (default: 30000)
```

### Test Runner Options
```bash
# Custom token file
npm test -- --token-file my-tokens.json

# Skip report generation
npm test -- --no-report
```

## 🏗️ Architecture

```
oauth-test/
├── server.js              # OAuth callback server + web UI
├── oauth-flow-test.js     # OAuth flow validation
├── gmb-api-test.js        # GMB API testing
├── test-runner.js         # Orchestrates all tests
├── .env.example           # Environment template
└── README.md             # This file
```

## 🔍 Troubleshooting

### Common Issues

**"Missing Google OAuth credentials"**
- Ensure `.env` file exists with valid `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

**"No Google Business accounts found"**
- Verify your Google account has an associated Google Business Profile
- Check that you have Manager-level access

**"Invalid redirect URI"**
- Ensure `http://localhost:3000/oauth/callback` is configured in Google Cloud Console
- Match the port number in your `.env` file

**"Insufficient permissions"**
- Request Manager access to the Google Business Profile
- Verify the OAuth scope includes `business.manage`

### Getting Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create or select a project
3. Enable Google My Business API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Configure OAuth consent screen
6. Add authorized redirect URI: `http://localhost:3000/oauth/callback`
7. Copy Client ID and Client Secret to `.env`

## 📈 Production Readiness

The test suite validates:
- ✅ Complete OAuth flow works
- ✅ Valid Google Business Profile access
- ✅ Manager-level permissions
- ✅ API endpoints respond correctly
- ✅ Error handling functions properly

Once all tests pass, your integration is ready for MindStudio implementation.

## 🔗 Related Documentation

- [OAuth Flow Specification](../../automation/workflows/google-oauth-flow.md)
- [Database Schema](../../docs/airtable-schema.md)
- [Sprint Plan](../../docs/sprint-plan.md)
- [Product Requirements](../../docs/prd.md)

## 🐛 Reporting Issues

If you encounter issues:
1. Check the test report in `test-report.json`
2. Review console logs for detailed error messages
3. Verify all prerequisites are met
4. Check Google Cloud Console configuration

For development support, include:
- Test report output
- Environment configuration (without secrets)
- Error logs and stack traces