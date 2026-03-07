# Claude API — Integration Context

## Model

**Always use:** `claude-sonnet-4-6`
Do NOT use claude-3, claude-haiku (except for cheap/fast tasks like translation), or opus (too expensive for batch review responses).

Exception: `wa-reply-helper.js` uses `claude-haiku-4-5-20251001` for the translation tool — this is intentional (speed + cost).

## Environment Variable

```
ANTHROPIC_API_KEY=sk-ant-...
```

Loaded from root `.env` in all scripts via `require('dotenv').config()`.

## Usage Patterns

### Review Response Generation (core use case)
- Called from: n8n HTTP Request node in `workflows/mvp-2-response-generator-poster.json`
- Max tokens: 300 (responses are 2–4 sentences)
- Temperature: default (no override needed)
- Prompt source: `tools/prompts/review-response.md`

### WhatsApp Outreach Message Generation
- Called from: `projects/whatsapp-outreach/wa-outreach.js`
- Model: `claude-sonnet-4-6` (script uses this — align if updating)
- Max tokens: 200
- Daily limit: 20 messages (configurable via `DAILY_LIMIT` env var)

### WA Reply Translation
- Called from: `projects/whatsapp-outreach/wa-reply-helper.js`
- Model: `claude-haiku-4-5-20251001`
- Max tokens: 600
- Purpose: translate Dutch replies + suggest 3 follow-up options

## n8n Integration

In n8n, Claude is called via HTTP Request node (not a native node):
```
POST https://api.anthropic.com/v1/messages
Headers:
  x-api-key: {{ $env.ANTHROPIC_API_KEY }}
  anthropic-version: 2023-06-01
  content-type: application/json
```

See `docs/n8n-setup-guide.md` for full workflow setup.

## Rate Limits & Retry

- No built-in retry in current scripts — add try/catch with exponential backoff if hitting limits
- For batch operations, add 1–2s delay between calls (see `wa-outreach.js` for example)
- Quota tracked in `API_Usage_Logs` Airtable table
