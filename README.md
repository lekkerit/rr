# Restaurant Review Response Automation

AI-powered service helping small-medium restaurants improve Google Maps ratings by automatically responding to reviews with personalized, brand-aligned responses.

## 🎯 Project Status

**Current Phase:** MVP Development - Week 1
**Target Launch:** February 9, 2026
**Focus:** Google My Business API integration with OAuth flow

## 📋 Overview

This project automates the process of responding to Google Business Profile reviews using AI-generated, contextually appropriate responses that maintain each restaurant's unique brand voice.

### Key Features
- ✅ **OAuth Integration**: Secure Google My Business API authentication
- ✅ **AI Response Generation**: Claude Sonnet 4.5 powered responses
- ✅ **Brand Voice Customization**: Personalized tone and style (Pro tier)
- ✅ **Human-in-Loop Approval**: Weekly email digests for response approval
- ✅ **Strategic Posting**: Natural timing and business hours posting
- ✅ **Analytics Dashboard**: Rating trends and performance metrics

## 🏗️ Architecture

```
MindStudio Platform (MVP) → Claude Code (Production @ 20 customers)
├── Google My Business API Integration
├── Airtable Database (MVP) → Supabase (Production)
├── Claude Sonnet 4.5 AI
└── Email Notifications & Approval Workflow
```

## 🗂️ Project Structure

```
restaurant-review-ai/
├── docs/
│   ├── prd.md                    # Complete Product Requirements
│   └── sprint-plan.md            # 2-week development timeline
├── workflows/
│   ├── google-oauth-flow.md      # OAuth implementation spec
│   ├── mindstudio-oauth-implementation.md
│   └── mindstudio-templates.md   # Ready-to-use MindStudio configs
├── database/
│   └── airtable-schema.md        # Complete database schema
├── scripts/
│   └── oauth-test/               # OAuth testing environment
│       ├── server.js             # Test server with web UI
│       ├── oauth-flow-test.js    # OAuth flow validation
│       ├── gmb-api-test.js       # Google My Business API tests
│       ├── test-runner.js        # Comprehensive test suite
│       └── README.md             # Testing instructions
└── templates/
    └── [Email templates for notifications]
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (for testing environment)
- Google Cloud Console project
- Google My Business API enabled
- MindStudio account
- Airtable account

### 1. OAuth Testing Environment

The OAuth flow has been fully tested and validated:

```bash
cd scripts/oauth-test
npm install
cp .env.example .env
# Add your Google OAuth credentials to .env
npm run server
# Open http://localhost:3000 to test
```

### 2. Google Cloud Setup

1. **Create Google Cloud Project**
2. **Enable APIs:**
   - Google My Business API
   - Google Business Profile API
3. **Create OAuth 2.0 Credentials:**
   - Add redirect URI: `http://localhost:3000/oauth/callback`
4. **Copy credentials to testing environment**

### 3. MindStudio Implementation

Follow the implementation guides:
- `workflows/mindstudio-oauth-implementation.md` - Strategic overview
- `workflows/mindstudio-templates.md` - Copy-paste configurations

## 📊 Target Market

### Primary Customers
- **Small-Medium Restaurants** (5-50 employees)
- **Current Rating**: 1-3 stars (primary), 3-4 stars (secondary)
- **Location**: United States
- **Pain Point**: Limited time/resources for review management

### Service Tiers
- **Starter Pack ($149/month)**: Standard responses, 100 reviews/month
- **Pro Pack ($299/month)**: Custom brand voice, 300 reviews/month

## 🛠️ Development Timeline

### Week 1 (Jan 27 - Feb 2) - Infrastructure ✅
- [x] Google My Business API OAuth integration
- [x] Database schema design (Airtable)
- [x] OAuth flow testing environment
- [x] MindStudio implementation specifications

### Week 2 (Feb 3 - Feb 9) - AI & Workflows
- [ ] AI response generation (Claude Sonnet 4.5)
- [ ] Approval workflow (email digests)
- [ ] Brand voice customization (Pro tier)
- [ ] Analytics dashboard
- [ ] End-to-end testing with pilot restaurant

### Week 3-4 (Feb 10 - Feb 23) - Pilot & Launch
- [ ] 3 pilot restaurant onboarding
- [ ] System optimization and bug fixes
- [ ] Production launch preparation

## 🔐 Security & Compliance

### Data Protection
- **Token Encryption**: AES-256 encryption for OAuth tokens
- **No PII Logging**: Customer review content not logged in plain text
- **HTTPS Only**: All API communications encrypted
- **Access Control**: Restaurant owners can only access their own data

### Compliance
- **Google My Business TOS**: Human-in-loop approval prevents policy violations
- **GDPR Ready**: Data export and deletion capabilities
- **Rate Limiting**: Respects Google API quotas and limits

## 🧪 Testing

### OAuth Flow Testing ✅
The OAuth integration has been fully validated:
- ✅ Authorization URL generation with CSRF protection
- ✅ Token exchange and refresh functionality
- ✅ Google My Business API access verification
- ✅ Error handling and recovery procedures

Run the test suite:
```bash
cd scripts/oauth-test
npm test
```

### Production Testing
- [ ] End-to-end restaurant onboarding
- [ ] AI response quality validation
- [ ] Email delivery and approval workflow
- [ ] Google Business Profile posting

## 📈 Success Metrics

### MVP Launch Criteria (Feb 9, 2026)
- [ ] 3 restaurants successfully onboarded
- [ ] Google My Business API integration functional
- [ ] AI generating responses for all review types
- [ ] Email approval workflow working end-to-end
- [ ] Responses posting to Google successfully
- [ ] Analytics dashboard displaying metrics
- [ ] Zero critical bugs

### 3-Month Goals
- [ ] 10 restaurants onboarded and active
- [ ] 70%+ customers show rating improvement
- [ ] 90%+ response posting success rate
- [ ] <5% monthly churn rate

## 🔗 Key Documentation

- **[Product Requirements Document](docs/prd.md)** - Complete product specification
- **[Sprint Plan](docs/sprint-plan.md)** - Detailed development timeline
- **[OAuth Implementation](workflows/google-oauth-flow.md)** - Technical OAuth specification
- **[Database Schema](database/airtable-schema.md)** - Complete data model
- **[MindStudio Templates](workflows/mindstudio-templates.md)** - Implementation configs

## 🚦 Current Status

### ✅ Completed
- Complete OAuth flow implementation and testing
- Google My Business API integration validated
- Database schema designed and documented
- MindStudio implementation specifications created
- Comprehensive testing environment established

### 🔄 In Progress
- MindStudio workflow implementation
- AI response generation system
- Email approval workflow design

### ⏳ Next Steps
1. Build MindStudio workflows using provided templates
2. Test AI response generation with Claude Sonnet 4.5
3. Create email approval system
4. Onboard first pilot restaurant
5. Launch MVP by February 9, 2026

## 📞 Support & Contact

For development questions or technical support, refer to:
- Technical specifications in `/workflows/` directory
- Testing environment in `/scripts/oauth-test/`
- Database documentation in `/database/`

---

**Last Updated:** January 26, 2026
**Version:** 1.0.0-mvp
**License:** Proprietary