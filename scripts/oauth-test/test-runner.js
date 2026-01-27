#!/usr/bin/env node

/**
 * Comprehensive Test Runner
 * Orchestrates all OAuth and GMB API tests with proper sequencing and reporting
 */

require('dotenv').config();
const OAuthFlowTest = require('./oauth-flow-test');
const GMBApiTest = require('./gmb-api-test');
const fs = require('fs');
const path = require('path');

class TestRunner {
  constructor() {
    this.results = {
      startTime: new Date(),
      endTime: null,
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      skippedTests: 0,
      tests: []
    };

    this.config = {
      saveTokens: true,
      tokenFile: 'test-tokens.json',
      generateReport: true,
      reportFile: 'test-report.json'
    };
  }

  /**
   * Run a single test with proper error handling and reporting
   */
  async runTest(testName, testFunction, dependencies = []) {
    const test = {
      name: testName,
      status: 'running',
      startTime: new Date(),
      endTime: null,
      duration: 0,
      error: null,
      result: null
    };

    console.log(`\n🧪 Running Test: ${testName}`);
    console.log('-'.repeat(50));

    this.results.totalTests++;

    try {
      // Check dependencies
      const failedDependencies = dependencies.filter(dep => {
        const depTest = this.results.tests.find(t => t.name === dep);
        return !depTest || depTest.status !== 'passed';
      });

      if (failedDependencies.length > 0) {
        throw new Error(`Dependencies failed: ${failedDependencies.join(', ')}`);
      }

      // Run the test
      const result = await testFunction();

      test.status = 'passed';
      test.result = result;
      this.results.passedTests++;

      console.log(`✅ Test Passed: ${testName}`);

    } catch (error) {
      test.status = 'failed';
      test.error = {
        message: error.message,
        stack: error.stack
      };
      this.results.failedTests++;

      console.error(`❌ Test Failed: ${testName}`);
      console.error(`Error: ${error.message}`);

    } finally {
      test.endTime = new Date();
      test.duration = test.endTime - test.startTime;
      this.results.tests.push(test);
    }

    return test;
  }

  /**
   * Test Suite 1: OAuth Flow Tests
   */
  async runOAuthTests() {
    console.log('\n🔐 OAuth Flow Test Suite');
    console.log('='.repeat(50));

    const oauthTester = new OAuthFlowTest();

    // Test 1: URL Generation
    await this.runTest('OAuth URL Generation', async () => {
      const { authUrl, state } = oauthTester.generateAuthUrl();

      if (!authUrl || !authUrl.includes('accounts.google.com')) {
        throw new Error('Invalid authorization URL generated');
      }

      if (!state || state.length < 32) {
        throw new Error('Invalid state token generated');
      }

      return {
        authUrl: authUrl.substring(0, 100) + '...', // Truncate for report
        state,
        urlValid: true,
        stateValid: true
      };
    });

    // Test 2: Token File Check
    await this.runTest('Token Availability Check', async () => {
      const tokenPath = path.join(__dirname, this.config.tokenFile);
      const hasTokenFile = fs.existsSync(tokenPath);

      let tokens = null;
      if (hasTokenFile) {
        try {
          tokens = JSON.parse(fs.readFileSync(tokenPath, 'utf8'));
        } catch (error) {
          throw new Error(`Invalid token file: ${error.message}`);
        }
      }

      return {
        hasTokenFile,
        hasValidTokens: !!(tokens && tokens.access_token),
        hasRefreshToken: !!(tokens && tokens.refresh_token),
        tokensExpired: tokens && tokens.expiry_date && new Date(tokens.expiry_date) < new Date()
      };
    });

    return this.results.tests.filter(t => t.name.includes('OAuth'));
  }

  /**
   * Test Suite 2: Google My Business API Tests
   */
  async runGMBApiTests() {
    console.log('\n🏢 Google My Business API Test Suite');
    console.log('='.repeat(50));

    const gmbTester = new GMBApiTest();

    // Load tokens if available
    const tokenLoaded = gmbTester.loadTokensFromFile(this.config.tokenFile);

    // Test 3: Token Loading
    await this.runTest('Token Loading', async () => {
      if (!tokenLoaded) {
        throw new Error('No valid tokens found. Run OAuth flow first.');
      }

      const credentials = gmbTester.oauth2Client.credentials;

      return {
        tokenLoaded: true,
        hasAccessToken: !!credentials.access_token,
        hasRefreshToken: !!credentials.refresh_token,
        scope: credentials.scope
      };
    }, ['Token Availability Check']);

    // Test 4: Account Access
    await this.runTest('Account Access', async () => {
      const accounts = await gmbTester.testAccountAccess();

      if (!accounts || accounts.length === 0) {
        throw new Error('No Google Business accounts found');
      }

      return {
        accountCount: accounts.length,
        accounts: accounts.map(acc => ({
          name: acc.accountName,
          type: acc.accountType
        }))
      };
    }, ['Token Loading']);

    // Test 5: Location Access
    await this.runTest('Location Access', async () => {
      // Get first account from previous test
      const accountTest = this.results.tests.find(t => t.name === 'Account Access');
      if (!accountTest || !accountTest.result.accounts[0]) {
        throw new Error('No account available for location test');
      }

      const accountName = `accounts/${accountTest.result.accounts[0].name.split('/')[1]}`;
      const locations = await gmbTester.testLocationAccess(accountName);

      if (!locations || locations.length === 0) {
        throw new Error('No business locations found');
      }

      return {
        locationCount: locations.length,
        locations: locations.map(loc => ({
          name: loc.title,
          id: loc.name
        }))
      };
    }, ['Account Access']);

    // Test 6: Permission Validation
    await this.runTest('Permission Validation', async () => {
      const locationTest = this.results.tests.find(t => t.name === 'Location Access');
      if (!locationTest || !locationTest.result.locations[0]) {
        throw new Error('No location available for permission test');
      }

      const locationName = locationTest.result.locations[0].id;
      const permissions = await gmbTester.testPermissionValidation(locationName);

      return {
        permissions,
        hasManagerAccess: Object.values(permissions).every(p => p === true)
      };
    }, ['Location Access']);

    // Test 7: Reviews Fetch (Mock)
    await this.runTest('Reviews Fetch', async () => {
      const locationTest = this.results.tests.find(t => t.name === 'Location Access');
      if (!locationTest || !locationTest.result.locations[0]) {
        throw new Error('No location available for reviews test');
      }

      const locationName = locationTest.result.locations[0].id;
      const reviews = await gmbTester.testReviewsFetch(locationName);

      return {
        reviewCount: reviews.length,
        reviewTypes: reviews.reduce((acc, review) => {
          acc[review.starRating] = (acc[review.starRating] || 0) + 1;
          return acc;
        }, {})
      };
    }, ['Location Access']);

    return this.results.tests.filter(t => t.name.includes('Account') || t.name.includes('Location') || t.name.includes('Permission') || t.name.includes('Reviews'));
  }

  /**
   * Test Suite 3: Integration Tests
   */
  async runIntegrationTests() {
    console.log('\n🔗 Integration Test Suite');
    console.log('='.repeat(50));

    // Test 8: End-to-End Flow
    await this.runTest('End-to-End Flow Validation', async () => {
      const requiredTests = [
        'Account Access',
        'Location Access',
        'Permission Validation',
        'Reviews Fetch'
      ];

      const missingTests = requiredTests.filter(testName => {
        const test = this.results.tests.find(t => t.name === testName);
        return !test || test.status !== 'passed';
      });

      if (missingTests.length > 0) {
        throw new Error(`Required tests failed: ${missingTests.join(', ')}`);
      }

      // Validate we can perform a complete restaurant onboarding flow
      const accountTest = this.results.tests.find(t => t.name === 'Account Access');
      const locationTest = this.results.tests.find(t => t.name === 'Location Access');
      const permissionTest = this.results.tests.find(t => t.name === 'Permission Validation');

      return {
        canOnboardRestaurant: true,
        readyForProduction: permissionTest.result.hasManagerAccess,
        accountsAvailable: accountTest.result.accountCount,
        locationsAvailable: locationTest.result.locationCount,
        allPermissions: permissionTest.result.hasManagerAccess
      };
    }, ['Account Access', 'Location Access', 'Permission Validation', 'Reviews Fetch']);

    return this.results.tests.filter(t => t.name.includes('End-to-End'));
  }

  /**
   * Generate comprehensive test report
   */
  generateReport() {
    this.results.endTime = new Date();
    this.results.totalDuration = this.results.endTime - this.results.startTime;

    const report = {
      summary: {
        startTime: this.results.startTime.toISOString(),
        endTime: this.results.endTime.toISOString(),
        duration: `${Math.round(this.results.totalDuration / 1000)}s`,
        totalTests: this.results.totalTests,
        passed: this.results.passedTests,
        failed: this.results.failedTests,
        passRate: Math.round((this.results.passedTests / this.results.totalTests) * 100)
      },
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        hasGoogleCredentials: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
      },
      testResults: this.results.tests.map(test => ({
        name: test.name,
        status: test.status,
        duration: `${test.duration}ms`,
        error: test.error?.message,
        result: test.result
      })),
      recommendations: this.generateRecommendations()
    };

    if (this.config.generateReport) {
      const reportPath = path.join(__dirname, this.config.reportFile);
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
      console.log(`📋 Test report saved to: ${reportPath}`);
    }

    return report;
  }

  /**
   * Generate recommendations based on test results
   */
  generateRecommendations() {
    const recommendations = [];
    const failedTests = this.results.tests.filter(t => t.status === 'failed');

    if (failedTests.length === 0) {
      recommendations.push('🎉 All tests passed! Your OAuth integration is ready for production.');
    } else {
      failedTests.forEach(test => {
        switch (test.name) {
          case 'OAuth URL Generation':
            recommendations.push('🔧 Check your Google OAuth credentials in the .env file');
            break;
          case 'Token Loading':
            recommendations.push('🔐 Complete the OAuth flow first to generate tokens');
            break;
          case 'Account Access':
            recommendations.push('🏢 Make sure you have a Google Business Profile associated with your Google account');
            break;
          case 'Location Access':
            recommendations.push('📍 Verify your Google Business Profile has at least one location');
            break;
          case 'Permission Validation':
            recommendations.push('🔒 Ensure you have Manager-level access to the Google Business Profile');
            break;
        }
      });
    }

    // General recommendations
    const tokenTest = this.results.tests.find(t => t.name === 'Token Availability Check');
    if (tokenTest && tokenTest.result && tokenTest.result.tokensExpired) {
      recommendations.push('⏰ Your tokens have expired. Refresh them or re-run the OAuth flow.');
    }

    const permissionTest = this.results.tests.find(t => t.name === 'Permission Validation');
    if (permissionTest && permissionTest.status === 'passed' && !permissionTest.result.hasManagerAccess) {
      recommendations.push('🔐 Request Manager-level access to the Google Business Profile for full functionality.');
    }

    return recommendations;
  }

  /**
   * Print results summary to console
   */
  printSummary() {
    console.log('\n📊 Test Results Summary');
    console.log('='.repeat(50));

    const { passed, failed, totalTests } = this.results;
    const passRate = Math.round((passed / totalTests) * 100);

    console.log(`📈 Overall: ${passed}/${totalTests} tests passed (${passRate}%)`);
    console.log(`⏱️  Duration: ${Math.round(this.results.totalDuration / 1000)}s`);

    // Group tests by suite
    const suites = {
      'OAuth': this.results.tests.filter(t => t.name.includes('OAuth') || t.name.includes('Token')),
      'GMB API': this.results.tests.filter(t => ['Account Access', 'Location Access', 'Permission Validation', 'Reviews Fetch'].includes(t.name)),
      'Integration': this.results.tests.filter(t => t.name.includes('End-to-End'))
    };

    Object.entries(suites).forEach(([suiteName, tests]) => {
      if (tests.length > 0) {
        console.log(`\n📂 ${suiteName} Tests:`);
        tests.forEach(test => {
          const status = test.status === 'passed' ? '✅' : '❌';
          console.log(`   ${status} ${test.name} (${test.duration}ms)`);
          if (test.status === 'failed' && test.error) {
            console.log(`      Error: ${test.error.message}`);
          }
        });
      }
    });

    // Print recommendations
    const recommendations = this.generateRecommendations();
    if (recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      recommendations.forEach(rec => console.log(`   ${rec}`));
    }

    return passRate === 100;
  }

  /**
   * Run all test suites
   */
  async runAllTests() {
    console.log('🚀 Starting Comprehensive OAuth & GMB API Test Suite');
    console.log('='.repeat(70));
    console.log(`📅 Started at: ${this.results.startTime.toISOString()}`);

    try {
      // Run test suites in sequence
      await this.runOAuthTests();
      await this.runGMBApiTests();
      await this.runIntegrationTests();

      // Generate and save report
      const report = this.generateReport();

      // Print summary
      const allTestsPassed = this.printSummary();

      return {
        success: allTestsPassed,
        report,
        results: this.results
      };

    } catch (error) {
      console.error('\n🚨 Test suite failed with error:', error.message);
      return {
        success: false,
        error: error.message,
        results: this.results
      };
    }
  }
}

// CLI Interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const runner = new TestRunner();

  // Configure based on CLI args
  if (args.includes('--no-report')) {
    runner.config.generateReport = false;
  }

  if (args.includes('--token-file')) {
    const tokenFileIndex = args.indexOf('--token-file');
    if (args[tokenFileIndex + 1]) {
      runner.config.tokenFile = args[tokenFileIndex + 1];
    }
  }

  // Run tests
  runner.runAllTests()
    .then(result => {
      if (result.success) {
        console.log('\n🎉 All tests completed successfully!');
        console.log('✅ Your OAuth integration is ready for production.');
        process.exit(0);
      } else {
        console.log('\n❌ Some tests failed. Check the results above.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('\n🚨 Test runner crashed:', error.message);
      process.exit(1);
    });
}

module.exports = TestRunner;