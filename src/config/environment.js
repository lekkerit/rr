require('dotenv').config();

const config = {
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    redirectUri: process.env.GOOGLE_REDIRECT_URI,
    refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    businessAccountId: process.env.GOOGLE_BUSINESS_ACCOUNT_ID
  },
  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY
  },
  airtable: {
    apiKey: process.env.AIRTABLE_API_KEY,
    baseId: process.env.AIRTABLE_BASE_ID
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    whatsappFrom: process.env.TWILIO_WHATSAPP_FROM
  },
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000
  }
};

function validateConfig() {
  const required = [
    'google.clientId',
    'google.clientSecret',
    'anthropic.apiKey'
  ];

  const missing = required.filter(key => {
    const value = key.split('.').reduce((obj, k) => obj?.[k], config);
    return !value;
  });

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  config,
  validateConfig
};