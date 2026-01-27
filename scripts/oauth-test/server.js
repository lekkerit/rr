#!/usr/bin/env node

/**
 * OAuth Callback Server
 * Handles Google OAuth 2.0 callbacks and token exchange
 * Based on the OAuth flow specification
 */

require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const OAuthFlowTest = require('./oauth-flow-test');
const GMBApiTest = require('./gmb-api-test');

class OAuthCallbackServer {
  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3000;
    this.oauthTester = new OAuthFlowTest();
    this.gmbTester = new GMBApiTest();
    this.pendingStates = new Map(); // Store expected state tokens

    this.setupRoutes();
    this.setupErrorHandling();
  }

  setupRoutes() {
    // Enable JSON parsing
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Serve static files for UI
    this.app.use(express.static('public'));

    // Root route - OAuth testing interface
    this.app.get('/', (req, res) => {
      res.send(this.generateHomePage());
    });

    // Start OAuth flow
    this.app.get('/start-oauth', (req, res) => {
      try {
        const { authUrl, state } = this.oauthTester.generateAuthUrl();

        // Store expected state for validation
        this.pendingStates.set(state, {
          timestamp: Date.now(),
          used: false
        });

        // Clean up old states (older than 10 minutes)
        this.cleanupOldStates();

        console.log(`🔐 OAuth flow started with state: ${state}`);

        res.json({
          success: true,
          authUrl,
          state,
          message: 'OAuth URL generated. Redirecting to Google for authorization.'
        });

      } catch (error) {
        console.error('❌ Error starting OAuth flow:', error.message);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // OAuth callback handler
    this.app.get('/oauth/callback', async (req, res) => {
      console.log('\n📨 Received OAuth callback');
      console.log('Query parameters:', req.query);

      try {
        const { code, state, error, error_description } = req.query;

        // Handle OAuth errors
        if (error) {
          console.error(`❌ OAuth error: ${error}`);
          if (error_description) {
            console.error(`📝 Error description: ${error_description}`);
          }

          return res.send(this.generateErrorPage(error, error_description));
        }

        // Validate required parameters
        if (!code || !state) {
          const missingParams = [];
          if (!code) missingParams.push('code');
          if (!state) missingParams.push('state');

          console.error(`❌ Missing required parameters: ${missingParams.join(', ')}`);
          return res.status(400).send(this.generateErrorPage(
            'missing_parameters',
            `Missing required parameters: ${missingParams.join(', ')}`
          ));
        }

        // Validate state (CSRF protection)
        if (!this.pendingStates.has(state)) {
          console.error('❌ Invalid or expired state token');
          return res.status(400).send(this.generateErrorPage(
            'invalid_state',
            'Invalid or expired state token. Please restart the OAuth flow.'
          ));
        }

        // Mark state as used
        const stateData = this.pendingStates.get(state);
        if (stateData.used) {
          console.error('❌ State token already used');
          return res.status(400).send(this.generateErrorPage(
            'state_reused',
            'State token already used. Please restart the OAuth flow.'
          ));
        }
        stateData.used = true;

        console.log('✅ State validation passed');

        // Exchange code for tokens
        const tokens = await this.oauthTester.exchangeCodeForTokens(code, state);

        // Store tokens for API testing
        this.gmbTester.setTokens(tokens);

        console.log('✅ Token exchange successful');
        console.log('🎫 Access token received');
        console.log('🔄 Refresh token:', tokens.refresh_token ? 'received' : 'not received');

        // Generate success page
        res.send(this.generateSuccessPage(tokens));

        // Clean up used state
        this.pendingStates.delete(state);

      } catch (error) {
        console.error('❌ OAuth callback error:', error.message);
        res.status(500).send(this.generateErrorPage('callback_error', error.message));
      }
    });

    // Test API access endpoint
    this.app.post('/test-api', async (req, res) => {
      console.log('\n🧪 Starting GMB API tests...');

      try {
        const results = await this.gmbTester.runAllTests();

        console.log('✅ API tests completed');

        res.json({
          success: results.success,
          results: results.results,
          accounts: results.accounts,
          locations: results.locations,
          error: results.error
        });

      } catch (error) {
        console.error('❌ API test error:', error.message);
        res.status(500).json({
          success: false,
          error: error.message
        });
      }
    });

    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        server: 'OAuth Callback Server',
        version: '1.0.0'
      });
    });

    // Token status endpoint
    this.app.get('/token-status', (req, res) => {
      const hasTokens = this.gmbTester.oauth2Client.credentials &&
                       this.gmbTester.oauth2Client.credentials.access_token;

      res.json({
        hasTokens,
        tokenInfo: hasTokens ? {
          hasAccessToken: !!this.gmbTester.oauth2Client.credentials.access_token,
          hasRefreshToken: !!this.gmbTester.oauth2Client.credentials.refresh_token,
          expiryDate: this.gmbTester.oauth2Client.credentials.expiry_date,
          scope: this.gmbTester.oauth2Client.credentials.scope
        } : null
      });
    });
  }

  setupErrorHandling() {
    // Global error handler
    this.app.use((error, req, res, next) => {
      console.error('🚨 Unhandled server error:', error);

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error.message
      });
    });

    // 404 handler
    this.app.use((req, res) => {
      res.status(404).json({
        success: false,
        error: 'Not found',
        message: `Endpoint ${req.method} ${req.path} not found`
      });
    });
  }

  cleanupOldStates() {
    const tenMinutesAgo = Date.now() - (10 * 60 * 1000);

    for (const [state, data] of this.pendingStates.entries()) {
      if (data.timestamp < tenMinutesAgo) {
        this.pendingStates.delete(state);
      }
    }
  }

  generateHomePage() {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>Google My Business OAuth Test</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .button {
            background: #4285f4; color: white; border: none; padding: 12px 24px;
            border-radius: 4px; cursor: pointer; font-size: 16px; margin: 10px 0;
        }
        .button:hover { background: #3367d6; }
        .success { color: #0d7377; background: #e6f7ff; padding: 10px; border-radius: 4px; }
        .error { color: #d32f2f; background: #ffebee; padding: 10px; border-radius: 4px; }
        .info { color: #1976d2; background: #e3f2fd; padding: 10px; border-radius: 4px; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
        .hidden { display: none; }
    </style>
</head>
<body>
    <h1>🔐 Google My Business OAuth Test</h1>

    <div class="info">
        <strong>Instructions:</strong>
        <ol>
            <li>Make sure you have configured your Google OAuth credentials in <code>.env</code></li>
            <li>Click "Start OAuth Flow" to begin authorization</li>
            <li>Grant permissions to your Google Business Profile</li>
            <li>You'll be redirected back here with tokens</li>
            <li>Test the API functionality</li>
        </ol>
    </div>

    <h2>Step 1: OAuth Authorization</h2>
    <button class="button" onclick="startOAuth()">🚀 Start OAuth Flow</button>
    <div id="oauth-status"></div>

    <h2>Step 2: Token Status</h2>
    <button class="button" onclick="checkTokenStatus()">🎫 Check Token Status</button>
    <div id="token-status"></div>

    <h2>Step 3: API Testing</h2>
    <button class="button" onclick="testAPI()">🧪 Test GMB API</button>
    <div id="api-results"></div>

    <script>
        async function startOAuth() {
            const statusDiv = document.getElementById('oauth-status');
            statusDiv.innerHTML = '<div class="info">🔄 Starting OAuth flow...</div>';

            try {
                const response = await fetch('/start-oauth');
                const data = await response.json();

                if (data.success) {
                    statusDiv.innerHTML = '<div class="success">✅ Redirecting to Google for authorization...</div>';
                    window.location.href = data.authUrl;
                } else {
                    statusDiv.innerHTML = \`<div class="error">❌ Error: \${data.error}</div>\`;
                }
            } catch (error) {
                statusDiv.innerHTML = \`<div class="error">❌ Request failed: \${error.message}</div>\`;
            }
        }

        async function checkTokenStatus() {
            const statusDiv = document.getElementById('token-status');
            statusDiv.innerHTML = '<div class="info">🔄 Checking token status...</div>';

            try {
                const response = await fetch('/token-status');
                const data = await response.json();

                if (data.hasTokens) {
                    const info = data.tokenInfo;
                    statusDiv.innerHTML = \`
                        <div class="success">
                            ✅ Tokens available<br>
                            🎫 Access Token: \${info.hasAccessToken ? '✅' : '❌'}<br>
                            🔄 Refresh Token: \${info.hasRefreshToken ? '✅' : '❌'}<br>
                            ⏱️ Expires: \${info.expiryDate ? new Date(info.expiryDate).toLocaleString() : 'Unknown'}<br>
                            🎯 Scope: \${info.scope || 'Not specified'}
                        </div>
                    \`;
                } else {
                    statusDiv.innerHTML = '<div class="error">❌ No tokens found. Complete OAuth flow first.</div>';
                }
            } catch (error) {
                statusDiv.innerHTML = \`<div class="error">❌ Request failed: \${error.message}</div>\`;
            }
        }

        async function testAPI() {
            const resultsDiv = document.getElementById('api-results');
            resultsDiv.innerHTML = '<div class="info">🔄 Testing GMB API access...</div>';

            try {
                const response = await fetch('/test-api', { method: 'POST' });
                const data = await response.json();

                if (data.success) {
                    const results = data.results;
                    const summary = Object.entries(results)
                        .map(([test, passed]) => \`\${passed ? '✅' : '❌'} \${test}\`)
                        .join('<br>');

                    resultsDiv.innerHTML = \`
                        <div class="success">
                            <strong>🎉 API Test Results:</strong><br>
                            \${summary}<br><br>
                            <strong>📊 Accounts Found:</strong> \${data.accounts ? data.accounts.length : 0}<br>
                            <strong>📍 Locations Found:</strong> \${data.locations ? data.locations.length : 0}
                        </div>
                    \`;
                } else {
                    resultsDiv.innerHTML = \`<div class="error">❌ API tests failed: \${data.error}</div>\`;
                }
            } catch (error) {
                resultsDiv.innerHTML = \`<div class="error">❌ Request failed: \${error.message}</div>\`;
            }
        }

        // Auto-check token status on page load
        window.onload = function() {
            checkTokenStatus();
        };
    </script>
</body>
</html>
    `;
  }

  generateSuccessPage(tokens) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>OAuth Success - Google My Business</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .success { color: #0d7377; background: #e6f7ff; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .button {
            background: #4285f4; color: white; border: none; padding: 12px 24px;
            border-radius: 4px; cursor: pointer; font-size: 16px; margin: 10px 5px;
            text-decoration: none; display: inline-block;
        }
        .button:hover { background: #3367d6; }
        pre { background: #f5f5f5; padding: 15px; border-radius: 4px; overflow-x: auto; }
    </style>
</head>
<body>
    <h1>🎉 OAuth Authorization Successful!</h1>

    <div class="success">
        <strong>✅ Authorization Complete</strong><br>
        Your Google Business Profile has been successfully connected.<br><br>
        <strong>Token Details:</strong><br>
        🎫 Access Token: ✅ Received<br>
        🔄 Refresh Token: ${tokens.refresh_token ? '✅ Received' : '❌ Not received'}<br>
        ⏱️ Expires: ${tokens.expiry_date ? new Date(tokens.expiry_date).toLocaleString() : 'Unknown'}<br>
        🎯 Scope: ${tokens.scope || 'Business management'}
    </div>

    <h2>Next Steps:</h2>
    <a href="/" class="button">🏠 Return to Test Dashboard</a>
    <button class="button" onclick="testAPI()">🧪 Test API Access</button>

    <h2>Token Information (for development):</h2>
    <pre>${JSON.stringify({
      access_token: tokens.access_token ? '[REDACTED - Available]' : 'Not received',
      refresh_token: tokens.refresh_token ? '[REDACTED - Available]' : 'Not received',
      scope: tokens.scope,
      token_type: tokens.token_type,
      expiry_date: tokens.expiry_date
    }, null, 2)}</pre>

    <script>
        async function testAPI() {
            const response = await fetch('/test-api', { method: 'POST' });
            const data = await response.json();

            if (data.success) {
                alert('🎉 API tests passed! Check the console for details.');
                console.log('API Test Results:', data);
            } else {
                alert('❌ API tests failed: ' + data.error);
                console.error('API Test Error:', data);
            }
        }
    </script>
</body>
</html>
    `;
  }

  generateErrorPage(error, description) {
    return `
<!DOCTYPE html>
<html>
<head>
    <title>OAuth Error - Google My Business</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
        .error { color: #d32f2f; background: #ffebee; padding: 15px; border-radius: 4px; margin: 15px 0; }
        .button {
            background: #4285f4; color: white; border: none; padding: 12px 24px;
            border-radius: 4px; cursor: pointer; font-size: 16px; margin: 10px 5px;
            text-decoration: none; display: inline-block;
        }
        .button:hover { background: #3367d6; }
    </style>
</head>
<body>
    <h1>❌ OAuth Authorization Failed</h1>

    <div class="error">
        <strong>Error:</strong> ${error}<br>
        ${description ? `<strong>Description:</strong> ${description}<br>` : ''}
        <br>
        <strong>Common solutions:</strong>
        <ul>
            <li>Make sure you grant all requested permissions</li>
            <li>Check that your Google account has access to a Google Business Profile</li>
            <li>Verify OAuth credentials are correctly configured</li>
            <li>Try the authorization flow again</li>
        </ul>
    </div>

    <h2>Try Again:</h2>
    <a href="/" class="button">🏠 Return to Test Dashboard</a>
    <button class="button" onclick="window.location.reload()">🔄 Reload Page</button>
</body>
</html>
    `;
  }

  start() {
    this.app.listen(this.port, () => {
      console.log('🚀 OAuth Callback Server Started');
      console.log('='.repeat(40));
      console.log(`🌐 Server URL: http://localhost:${this.port}`);
      console.log(`📡 Callback URL: http://localhost:${this.port}/oauth/callback`);
      console.log(`🔍 Health Check: http://localhost:${this.port}/health`);
      console.log('');
      console.log('💡 Make sure this callback URL is registered in Google Cloud Console');
      console.log('🔗 Configure OAuth redirect URI: http://localhost:3000/oauth/callback');
      console.log('');
      console.log('🧪 Ready for OAuth testing!');
      console.log('👉 Open http://localhost:3000 to start');
    });
  }

  stop() {
    console.log('🛑 Stopping OAuth Callback Server...');
    process.exit(0);
  }
}

// CLI Interface
if (require.main === module) {
  const server = new OAuthCallbackServer();

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    server.stop();
  });

  process.on('SIGTERM', () => {
    server.stop();
  });

  // Start server
  server.start();
}

module.exports = OAuthCallbackServer;