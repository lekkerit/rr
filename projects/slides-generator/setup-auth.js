#!/usr/bin/env node
/**
 * One-time setup: gets a Google OAuth token with Slides + Drive scopes.
 *
 * Step 1 — print the auth URL:
 *   node projects/slides-generator/setup-auth.js
 *
 * Step 2 — exchange the code:
 *   node projects/slides-generator/setup-auth.js <code>
 *
 * After Step 1: open the URL, authorize the app. Google will redirect to
 * localhost (the page will fail to load — that's fine). Copy the "code="
 * value from the browser's address bar and pass it to Step 2.
 * You can paste either just the code, or the full redirect URL.
 */

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const { getAuthUrl, exchangeCode } = require('../../src/services/googleSlidesService');

async function main() {
  const arg = process.argv[2];

  if (!arg) {
    const authUrl = getAuthUrl();
    console.log('\n=== Google Slides Auth Setup — Step 1 ===\n');
    console.log('Open this URL in your browser:\n');
    console.log(authUrl);
    console.log("\nAfter authorizing, Google redirects to localhost (page fails — that's fine).");
    console.log('Copy the "code" value from the URL bar, then run:\n');
    console.log('  node projects/slides-generator/setup-auth.js <code>\n');
    return;
  }

  // Accept either just the code, or the full redirect URL
  let code = arg;
  if (arg.startsWith('http')) {
    const u = new URL(arg);
    code = u.searchParams.get('code');
    if (!code) {
      console.error('Could not find "code" parameter in the URL you provided.');
      process.exit(1);
    }
  }

  console.log('\nExchanging code for token...');
  try {
    const tokens = await exchangeCode(code);
    console.log('\n=== Success! ===\n');
    console.log('Add this to your .env file:\n');
    console.log(`GOOGLE_SLIDES_REFRESH_TOKEN=${tokens.refresh_token}`);
    console.log('\nThen run:\n  node projects/slides-generator/create-week-in-review.js\n');
  } catch (err) {
    console.error('\nToken exchange failed:', err.message);
    process.exit(1);
  }
}

main();
