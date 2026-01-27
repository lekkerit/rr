# Restaurant Review Response Automation

## Project Overview
AI-powered service helping small-medium restaurants improve Google Maps ratings 
by automatically responding to reviews.

**See `docs/prd.md` for complete product requirements.**

## Current Phase
MVP Development - Week 1 (Jan 27 - Feb 2)
Focus: Google My Business API integration

## Tech Stack
- **Platform:** MindStudio (MVP) → Claude Code (at 20 customers)
- **AI:** Claude Sonnet 4.5
- **Database:** Airtable (MVP) → Supabase (production)
- **APIs:** Google My Business API

## Key Documents
- `docs/prd.md` - Complete Product Requirements Document
- `workflows/` - MindStudio workflow specifications
- `scripts/` - Testing and utility scripts
- `templates/` - Email and response templates

## Development Guidelines
1. Follow 2-week MVP timeline in PRD
2. Build only P0 (Critical) features first
3. Test with real Google Business Profiles
4. Document all MindStudio workflows for future migration

## Next Steps
1. Set up Google Cloud Console project
2. Implement OAuth flow for Google My Business
3. Create review fetching workflow
4. Build AI response generator

