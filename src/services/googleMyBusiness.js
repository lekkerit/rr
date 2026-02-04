const { google } = require('googleapis');
const { config } = require('../config/environment');

class GoogleMyBusinessService {
  constructor() {
    this.auth = new google.auth.OAuth2(
      config.google.clientId,
      config.google.clientSecret,
      config.google.redirectUri
    );

    if (config.google.refreshToken) {
      this.auth.setCredentials({
        refresh_token: config.google.refreshToken
      });
    }

    this.mybusiness = google.mybusinessbusinessinformation({ version: 'v1', auth: this.auth });
    this.mybusinessaccountmanagement = google.mybusinessaccountmanagement({ version: 'v1', auth: this.auth });
  }

  async getAuthUrl() {
    const scopes = [
      'https://www.googleapis.com/auth/business.manage'
    ];

    return this.auth.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  async exchangeCodeForTokens(code) {
    const { tokens } = await this.auth.getToken(code);
    this.auth.setCredentials(tokens);
    return tokens;
  }

  async getAccounts() {
    try {
      const response = await this.mybusinessaccountmanagement.accounts.list();
      return response.data.accounts || [];
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  }

  async getLocations(accountName) {
    try {
      const response = await this.mybusiness.accounts.locations.list({
        parent: accountName,
        readMask: 'name,title,storefrontAddress,websiteUri,phoneNumbers'
      });
      return response.data.locations || [];
    } catch (error) {
      console.error('Error fetching locations:', error);
      throw error;
    }
  }

  async getReviews(locationName) {
    try {
      const response = await this.mybusiness.accounts.locations.reviews.list({
        parent: locationName
      });
      return response.data.reviews || [];
    } catch (error) {
      console.error('Error fetching reviews:', error);
      throw error;
    }
  }

  async replyToReview(reviewName, replyText) {
    try {
      const response = await this.mybusiness.accounts.locations.reviews.updateReply({
        name: reviewName,
        requestBody: {
          reply: {
            comment: replyText
          }
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error replying to review:', error);
      throw error;
    }
  }

  async deleteReply(reviewName) {
    try {
      const response = await this.mybusiness.accounts.locations.reviews.deleteReply({
        name: reviewName
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting reply:', error);
      throw error;
    }
  }
}

module.exports = GoogleMyBusinessService;