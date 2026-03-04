# Restaurant Review Response Automation

AI-powered tool for automating responses to restaurant reviews on Google Business Profile.

## Overview

This project helps restaurants manage their online reputation by streamlining the process of responding to customer reviews using AI-generated responses that maintain brand consistency.

### Key Features
- Google My Business API integration with OAuth authentication
- AI-powered response generation
- Customizable brand voice and tone
- Human-in-the-loop approval workflow
- Analytics and performance tracking

## Tech Stack

- **AI:** Claude Sonnet 4.5
- **Database:** Airtable (MVP) → Supabase (planned)
- **APIs:** Google My Business API, Google Business Profile API
- **Platform:** MindStudio

## Project Structure

```
rr/
├── docs/           # Product and technical documentation
├── workflows/      # Implementation specifications
├── database/       # Database schema
├── scripts/        # Testing and utility scripts
└── templates/      # Email and response templates
```

## Getting Started

### Prerequisites
- Node.js 18+
- Google Cloud Console project with Google My Business API enabled
- Valid OAuth 2.0 credentials

### Setup

1. Clone the repository
2. Navigate to testing environment:
   ```bash
   cd scripts/oauth-test
   npm install
   ```
3. Configure environment variables in `.env`
4. Run test server: `npm run server`

## Documentation

- See `/docs` for detailed technical specifications
- See `/workflows` for implementation guides
- See `CLAUDE.md` for internal development notes

## Security

- OAuth 2.0 for secure authentication
- Encrypted token storage
- HTTPS-only communication
- Compliance with Google My Business TOS and GDPR

## License

Proprietary - All rights reserved