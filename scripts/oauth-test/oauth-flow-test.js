#!/usr/bin/env node

/**
 * OAuth Flow Test Script
 * Tests Google My Business OAuth 2.0 authentication flow
 * Based on the workflow specification in /workflows/google-oauth-flow.md
 */

require('dotenv').config();
const { google } = require('googleapis');
const crypto = require('crypto');
const open = require('open');

class OAuthFlowTest {
  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    this.redirectUri = process.env.GOOGLE_REDIRECT_URI;
    this.scope = process.env.GOOGLE_SCOPE;

    if (!this.clientId || !this.clientSecret) {
      console.error('❌ Missing Google OAuth credentials in .env file');
      console.log('Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET');
      process.exit(1);
    }

    this.oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUri
    );

    this.state = this.generateStateToken();
  }

  /**
   * Generate CSRF protection state token
   */
  generateStateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Step 1: Generate authorization URL
   */
  generateAuthUrl() {
    console.log('\n🔐 Step 1: Generating OAuth Authorization URL...');

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scope,
      state: this.state,
      prompt: 'consent' // Force consent to get refresh token
    });

    console.log('✅ Authorization URL generated');
    console.log('🔑 State token:', this.state);
    console.log('🌐 Scope requested:', this.scope);
    console.log('🔗 Authorization URL:', authUrl);

    return { authUrl, state: this.state };
  }

  /**
   * Step 2: Open browser for user authorization
   */
  async openBrowserForAuth() {
    const { authUrl } = this.generateAuthUrl();

    console.log('\n🌐 Step 2: Opening browser for user authorization...');
    console.log('👤 Please grant permission to access your Google Business Profile');
    console.log('🔄 After authorization, you\'ll be redirected to localhost:3000');

    try {
      await open(authUrl);
      console.log('✅ Browser opened successfully');
    } catch (error) {
      console.log('❌ Could not open browser automatically');
      console.log('📋 Please manually open this URL in your browser:');
      console.log(authUrl);
    }

    return this.state;
  }

  /**
   * Step 3: Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(authorizationCode, receivedState) {
    console.log('\n🔄 Step 3: Exchanging authorization code for tokens...');

    // Validate state parameter (CSRF protection)
    if (receivedState !== this.state) {
      throw new Error('State mismatch - possible CSRF attack');
    }
    console.log('✅ State validation passed');

    try {
      const { tokens } = await this.oauth2Client.getToken(authorizationCode);

      console.log('✅ Token exchange successful');
      console.log('🎫 Access Token:', tokens.access_token ? '✅ Received' : '❌ Missing');
      console.log('🔄 Refresh Token:', tokens.refresh_token ? '✅ Received' : '❌ Missing');
      console.log('⏱️  Expires In:', tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'Unknown');
      console.log('🎯 Scope Granted:', tokens.scope || 'Not specified');

      // Set credentials for further API calls
      this.oauth2Client.setCredentials(tokens);

      return tokens;
    } catch (error) {
      console.error('❌ Token exchange failed:', error.message);
      throw error;
    }
  }

  /**
   * Step 4: Test token refresh
   */
  async testTokenRefresh() {
    console.log('\n🔄 Step 4: Testing token refresh...');

    try {
      const { credentials } = await this.oauth2Client.refreshAccessToken();

      console.log('✅ Token refresh successful');
      console.log('🎫 New Access Token:', credentials.access_token ? '✅ Received' : '❌ Missing');
      console.log('⏱️  New Expiry:', credentials.expiry_date ? new Date(credentials.expiry_date).toISOString() : 'Unknown');

      return credentials;
    } catch (error) {
      console.error('❌ Token refresh failed:', error.message);
      throw error;
    }
  }

  /**
   * Step 5: Validate API access
   */
  async validateApiAccess() {
    console.log('\n🔍 Step 5: Validating Google My Business API access...');

    const mybusiness = google.mybusinessbusinessinformation({
      version: 'v1',
      auth: this.oauth2Client
    });

    try {
      // Test basic API access by listing accounts
      console.log('📡 Testing API call: accounts.list');
      const accountsResponse = await mybusiness.accounts.list();

      if (accountsResponse.data && accountsResponse.data.accounts) {
        const accounts = accountsResponse.data.accounts;
        console.log('✅ API access successful');
        console.log('🏢 Accounts found:', accounts.length);

        accounts.forEach((account, index) => {
          console.log(`   ${index + 1}. ${account.accountName} (${account.name})`);
        });

        return accounts;
      } else {
        console.log('⚠️  API call successful but no accounts found');
        console.log('💡 Make sure you have a Google Business Profile');
        return [];
      }
    } catch (error) {
      console.error('❌ API access failed:', error.message);
      if (error.code === 403) {
        console.log('🔒 Insufficient permissions - check OAuth scope and account access');
      } else if (error.code === 401) {
        console.log('🔐 Authentication failed - token may be invalid');
      }
      throw error;
    }
  }

  /**
   * Run complete OAuth flow test
   */
  async runCompleteTest() {
    console.log('🧪 Starting Google My Business OAuth Flow Test');
    console.log('='.repeat(50));

    try {
      // Step 1 & 2: Generate URL and open browser
      const expectedState = await this.openBrowserForAuth();

      console.log('\n⏳ Waiting for OAuth callback...');
      console.log('💡 Make sure the callback server is running (npm run server)');
      console.log('🔗 Or manually extract the code from the callback URL');

      return {
        success: true,
        message: 'OAuth URL generated successfully. Complete authorization in browser.',
        expectedState
      };

    } catch (error) {
      console.error('\n❌ OAuth flow test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Test with manual authorization code input
   */
  async testWithAuthCode(authorizationCode, receivedState) {
    console.log('\n🧪 Testing with provided authorization code');
    console.log('='.repeat(50));

    try {
      // Step 3: Exchange code for tokens
      const tokens = await this.exchangeCodeForTokens(authorizationCode, receivedState);

      // Step 4: Test token refresh (if refresh token available)
      if (tokens.refresh_token) {
        await this.testTokenRefresh();
      } else {
        console.log('⚠️  No refresh token - add prompt=consent to get refresh token');
      }

      // Step 5: Validate API access
      const accounts = await this.validateApiAccess();

      console.log('\n✅ OAuth Flow Test Complete!');
      console.log('🎉 All tests passed successfully');

      return {
        success: true,
        tokens,
        accounts
      };

    } catch (error) {
      console.error('\n❌ OAuth flow test failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const tester = new OAuthFlowTest();

  if (args[0] === 'auth-code' && args[1] && args[2]) {
    // Test with provided auth code and state
    const [, authCode, state] = args;
    tester.testWithAuthCode(authCode, state)
      .then(result => {
        process.exit(result.success ? 0 : 1);
      });
  } else {
    // Generate auth URL and open browser
    tester.runCompleteTest()
      .then(result => {
        process.exit(result.success ? 0 : 1);
      });
  }
}

module.exports = OAuthFlowTest;