# Session: Bots in Public — Course Structure + Command Setup

**Date:** 2026-03-16
**Project:** Bots in Public (within rr)
**Type:** `restructure` + `build`

---

## What happened

- Created a canonical 10-day master file structure under `courses/bip/day[1-10]/master.md` — Day 1 fully written from Word doc script, Days 2–5 have complete Substack posts, Days 6–10 are stubs
- Synthesised March 8 session notes into `courses/bip/notes/session-mar8.md` — v1 monetisation model (tiered) confirmed superseded by v2 (€99 one-off), v2 Day 1 structure (VS Code + GitHub) is canonical
- Created 4 project-specific slash commands (`/bip-status`, `/bip-day`, `/bip-script`, `/bip-post`) so future sessions load straight into context without rebuilding
- Also created 4 general RR commands (`/rr-plan`, `/rr-status`, `/rr-build`, `/rr-q`) from existing shell aliases — previously these only worked in terminal, now available inside Claude Code

---

## Key decisions

| Decision | Chosen | Rejected | Reason |
|----------|--------|----------|--------|
| Monetisation model | €99 one-off (v2 brief) | Tiered €9/€29/€79 (March 8 session) | v2 brief is canonical — simpler, cleaner pitch |
| Day 1 structure | VS Code + GitHub + CLAUDE.md build | Noob-first (no code, no GitHub) | v2 brief is canonical |
| File structure | Per-day subdirectories (`day1/master.md`) | Flat files (`day1-master.md`) | Scales cleanly as each day accumulates assets |
| Session history | Filed in `courses/bip/notes/` | Discarded | Context is too valuable to lose between sessions |

---

## Known constraints discovered

- Shell aliases (`rr-plan`, etc.) only work in terminal — they need corresponding `~/.claude/commands/*.md` files to work as slash commands inside Claude Code
- `$ARGUMENTS` in slash command files passes text after the command name (e.g. `/bip-day 3` → `$ARGUMENTS` = `3`)

---

## Files created or changed

- `courses/bip/README.md` — course overview, 10-day table, launch checklist, outstanding actions
- `courses/bip/day1/master.md` — complete Day 1 script + substack post + production notes
- `courses/bip/day2/master.md` — substack post + stub script
- `courses/bip/day3/master.md` — substack post + stub script
- `courses/bip/day4/master.md` — substack post + stub script
- `courses/bip/day5/master.md` — full paywall copy + stub script
- `courses/bip/day6–10/master.md` — stubs with structure
- `courses/bip/notes/session-mar8.md` — March 8 session archived
- `~/.claude/commands/bip-status.md` — course status command
- `~/.claude/commands/bip-day.md` — load a day into context
- `~/.claude/commands/bip-script.md` — write full script for a day
- `~/.claude/commands/bip-post.md` — write Substack post for a day
- `~/.claude/commands/rr-plan.md` — plan before coding
- `~/.claude/commands/rr-status.md` — project state summary
- `~/.claude/commands/rr-build.md` — new feature request
- `~/.claude/commands/rr-q.md` — Q&A mode

---

## Reusable prompts

N/A this session — structural work only.

---

## Next session should start with

> `/bip-day 2` to load Day 2 and write the full script — or record Day 1 first and mark it done in master.md.
