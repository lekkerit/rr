# Session Notes — March 8 2026

> v1 monetisation model (tiered €9/€29/€79/€499) discussed in this session is superseded by v2 brief (€99 one-off). v2 is canonical.
> Day 1 "noob-first" structure (no GitHub, no VS Code) from this session is also superseded by v2.

---

## Decisions Made

| Decision | Detail |
|----------|--------|
| Project name | **Bots in Public** |
| Domain | `botsinpublic.com` — purchased €8.99/yr ✅ |
| Tagline | "Getting dressed in public" — AI feels embarrassing to start |
| Audience | Non-coders, solopreneurs, AI-curious beginners |
| Separate from RR | Yes — different audience, different purpose |
| Instagram handle | `bots.in.public` (already set up) |
| Platform | Substack — simplest, built-in paywall, zero friction |

---

## Competitive Landscape

| Creator | Platform | Angle |
|---------|----------|-------|
| Sabrina Ramonov | TikTok/YouTube | AI video tutorials |
| Ruben Hassid | Substack | "How to AI" — copy-paste |
| Nicolas Cole | Substack | AI writing prompts |
| AI Maker (Juan Salas) | Substack | $30K ARR in 8 months |

**Gap:** Daily build-in-public with a real business (RR) as proof — raw, honest, no jargon. Nobody doing this.

---

## Content Created This Session

| Asset | Status |
|-------|--------|
| Week in Review Google Slides deck | ✅ Generated |
| BiP Day 1 Google Slides deck (noob-first) | ✅ Generated (v1 — superseded) |
| BiP Day 1 Substack post | ✅ Written — v1 version |
| TikTok scripts (timed) | ✅ Inside both decks |
| X thread (7 tweets) | ✅ Inside both decks |
| YouTube profile image prompts | ✅ 3 cartoon robot-in-towel variants |

---

## Technical Fixes Applied

| Issue | Resolution |
|-------|-----------|
| `.env` was a folder not a file | Removed with `rmdir`, recreated with `touch` |
| Google Slides `addSlide` API error | Fixed — renamed to `createSlide` |
| Duplicate `projects/` folder confusion | Resolved — `~/Projects/` (Mac) vs `rr/projects/` (scripts subfolder) |
| Two `.env` files | Resolved — single source of truth is `~/Projects/rr/.env` |

---

## Outstanding Actions

| Action | Priority | Status |
|--------|----------|--------|
| Rotate `GOOGLE_CLIENT_SECRET` in Google Cloud Console | 🔴 Urgent | [ ] |
| Rotate `FAL_KEY` at fal.ai/dashboard | 🔴 Urgent | [ ] |
| Set up Substack at `botsinpublic.substack.com` | 🟡 Next | [ ] |
| Point `botsinpublic.com` to Substack | 🟡 Next | [ ] |
| Create TikTok + YouTube accounts for BiP | 🟡 Next | [ ] |
| Generate cartoon robot profile pic via fal.ai (FLUX Dev model) | 🟢 When ready | [ ] |

---

## TikTok Reel Build — Blocked

Partial build started: basic HTML film reel strip scaffold (incomplete).
Blocked: waiting for a GIF or description of the reel visual so the build can be completed.
Reference: `courses/bip/day1-reel.html` — may be the completed version of this.
