# Restaurant Review Response Automation - Internal Documentation

## Business Overview

AI-powered service helping small-medium restaurants improve Google Maps ratings by automatically responding to reviews with personalized, brand-aligned responses.

**This document contains confidential business information, pricing, strategy, and development plans.**

---

## 🎯 Project Status

**Current Phase:** MVP Development - Week 1
**Target Launch:** February 9, 2026
**Focus:** Google My Business API integration with OAuth flow

---

## 🤖 Claude Code Development Tips

### Token Usage Optimization
- **Use Haiku for simple tasks**: Task tool accepts `model: "haiku"` parameter for cheap operations
- **Avoid unnecessary file reads**: Only read when required
- **Focused searches**: Specific Grep/Glob patterns vs broad exploration
- **Limit context**: Use offset/limit for large files
- **Concise mode**: Request brief responses to reduce output tokens

### Token Monitoring
- Budget: 200,000 tokens per session
- Check status with explicit request for updates
- Target milestones: 50k, 100k, 150k usage points

---

## 💰 Business Model & Pricing

### Service Tiers
- **Starter Pack ($149/month)**
  - Standard AI-generated responses
  - 100 reviews/month capacity
  - Email approval workflow
  - Basic analytics dashboard

- **Pro Pack ($299/month)**
  - Custom brand voice training
  - 300 reviews/month capacity
  - Priority email approvals
  - Advanced analytics & insights
  - Strategic posting timing

### Revenue Projections
- **MVP (3 customers):** $450-900/month
- **3-Month Goal (10 customers):** $1,500-3,000/month
- **Target at migration (20 customers):** $3,000-6,000/month

---

## 🎯 Target Market

### Primary Customers
- **Business Type:** Small-Medium Restaurants (5-50 employees)
- **Current Rating:** 1-3 stars (primary focus), 3-4 stars (secondary)
- **Location:** United States
- **Pain Points:**
  - Limited time/resources for review management
  - Damaging ratings hurting business
  - Inconsistent or no responses to customer reviews
  - Don't know how to respond professionally

### Market Size
- **Small-medium restaurants in US:** ~500,000
- **Addressable market (poor reviews):** ~150,000
- **Target penetration (1%):** 1,500 customers
- **Potential revenue at scale:** $225K-450K/month

---

## 🏗️ Technical Architecture

### Platform Evolution
```
Phase 1 (MVP): MindStudio
├── Quickest to market (no-code platform)
├── Google My Business API Integration
├── Airtable Database
├── Claude Sonnet 4.5 AI
└── Email Notifications & Approval Workflow

Phase 2 (Production @ 20 customers): Claude Code
├── Custom-built automation
├── Supabase Database (PostgreSQL)
├── Advanced workflow orchestration
├── Better cost control and scalability
└── Enhanced customization capabilities
```

### Key Technical Components
1. **OAuth Integration**: Secure Google My Business API authentication
2. **AI Response Engine**: Claude Sonnet 4.5 with brand voice customization
3. **Approval Workflow**: Weekly email digests for human review
4. **Strategic Posting**: Natural timing, business hours compliance
5. **Analytics Dashboard**: Rating trends, response rates, performance metrics

---

## 📅 Development Timeline

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
- [ ] First paying customers

### Phase 2 (@ 20 customers) - Migration to Claude Code
- [ ] Custom automation development
- [ ] Supabase migration
- [ ] Advanced workflow features
- [ ] Cost optimization

---

## 📈 Success Metrics & KPIs

### MVP Launch Criteria (Feb 9, 2026)
- [ ] 3 restaurants successfully onboarded
- [ ] Google My Business API integration functional
- [ ] AI generating quality responses for all review types
- [ ] Email approval workflow working end-to-end
- [ ] Responses posting to Google successfully
- [ ] Analytics dashboard displaying key metrics
- [ ] Zero critical bugs

### 3-Month Goals
- [ ] 10 restaurants onboarded and active
- [ ] 70%+ customers show rating improvement (0.5+ stars)
- [ ] 90%+ response posting success rate
- [ ] <5% monthly churn rate
- [ ] 80%+ customer satisfaction (NPS)

### Customer Success Metrics
- **Response Rate:** Target 95%+ of reviews get responses
- **Time to Response:** Within 48 hours of review posting
- **Rating Improvement:** 0.5+ star increase within 90 days
- **Response Approval Rate:** 80%+ AI responses approved without edits

---

## 🔐 Security & Compliance Strategy

### Data Protection
- **Token Encryption**: AES-256 encryption for OAuth tokens
- **No PII Logging**: Customer review content not logged in plain text
- **HTTPS Only**: All API communications encrypted
- **Access Control**: Restaurant owners can only access their own data
- **Data Retention**: Customer reviews cached for 30 days max

### Compliance Requirements
- **Google My Business TOS**: Human-in-loop approval prevents policy violations
- **GDPR Ready**: Data export and deletion capabilities
- **Rate Limiting**: Respects Google API quotas (1,500 requests/day per location)
- **Transparency**: Clear disclosure that responses are AI-assisted

---

## 🎨 Product Differentiation

### Competitive Advantages
1. **Human-in-Loop Safety**: Prevents AI mistakes, TOS violations
2. **Brand Voice Customization**: Pro tier learns restaurant's unique style
3. **Strategic Timing**: Posts at natural times, not instantly (looks authentic)
4. **Affordable Entry Point**: $149/month vs competitors at $300-500/month
5. **Focus on Small Restaurants**: Not diluted serving enterprise

### vs. Competitors
- **vs. Podium/Grade.us**: More affordable, AI-powered vs template-based
- **vs. BirdEye**: Better pricing, focused product vs bloated suite
- **vs. Manual Management**: 90% time savings, professional consistency

---

## 🚀 Go-to-Market Strategy

### Customer Acquisition (Phase 1)
1. **Direct Outreach**: Personal email to 50 restaurants with poor ratings
2. **Free Pilot Offer**: First month free for 3 restaurants
3. **Case Study Development**: Document rating improvements
4. **Referral Program**: $50 credit for successful referrals

### Marketing Channels (Phase 2+)
- Google Ads targeting "restaurant reputation management"
- Facebook/Instagram ads to restaurant owner groups
- Content marketing (blog posts on review response best practices)
- Partnerships with restaurant POS systems

---

## 🔗 Key Documentation

- **[Product Requirements Document](docs/prd.md)** - Complete product specification
- **[Sprint Plan](docs/sprint-plan.md)** - Detailed development timeline
- **[OAuth Implementation](workflows/google-oauth-flow.md)** - Technical OAuth spec
- **[Database Schema](database/airtable-schema.md)** - Complete data model
- **[MindStudio Templates](workflows/mindstudio-templates.md)** - Ready configs

---

## 📊 Current Status Dashboard

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

### ⏳ Immediate Next Steps
1. Build MindStudio workflows using provided templates
2. Test AI response generation with Claude Sonnet 4.5
3. Create email approval system with weekly digests
4. Develop analytics dashboard (basic version)
5. Onboard first pilot restaurant
6. Launch MVP by February 9, 2026

---

## 💡 Strategic Decisions & Rationale

### Why MindStudio for MVP?
- **Speed:** Launch in 2 weeks vs 2 months custom development
- **Validation:** Prove business model before heavy engineering investment
- **Low Risk:** Minimal upfront cost, quick iteration
- **Clear Migration Path:** Well-documented for Claude Code migration

### Why Human-in-Loop?
- **Safety:** Prevents AI mistakes, TOS violations
- **Trust:** Restaurant owners feel in control
- **Legal:** CYA for compliance and liability
- **Quality:** Ensures brand alignment and context accuracy

### Why Weekly Digests (not instant)?
- **Efficiency:** Batch review reduces decision fatigue
- **Natural Timing:** Allows strategic posting schedule
- **Cost:** Fewer emails, better deliverability
- **User Experience:** Less overwhelming for busy owners

---

**Last Updated:** February 1, 2026
**Document Version:** 2.0.0
**Classification:** Confidential - Internal Use Only