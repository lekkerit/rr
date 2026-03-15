const { google } = require('googleapis');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

function createAuth() {
  const refreshToken = process.env.GOOGLE_SLIDES_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error('GOOGLE_SLIDES_REFRESH_TOKEN not set. Run projects/slides-generator/setup-auth.js first.');
  }
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
  );
  auth.setCredentials({ refresh_token: refreshToken });
  return auth;
}

function getAuthUrl() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
  );
  return auth.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/presentations',
      'https://www.googleapis.com/auth/drive'
    ],
    prompt: 'consent'
  });
}

async function exchangeCode(code) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/callback'
  );
  const { tokens } = await auth.getToken(code);
  return tokens;
}

module.exports = { createAuth, getAuthUrl, exchangeCode };
