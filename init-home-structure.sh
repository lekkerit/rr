#!/bin/bash
# init-home-structure.sh
# Bootstraps the RR home directory structure on any machine.
# Safe to re-run — never overwrites existing files.

set -e

create_file() {
  local path="$1"
  local content="$2"
  if [ ! -f "$path" ]; then
    echo "$content" > "$path"
    echo "  created: $path"
  else
    echo "  exists:  $path"
  fi
}

echo "==> Creating home directory structure..."

# ~/learning/
mkdir -p ~/learning/anthropic-course ~/learning/experiments ~/learning/prompts
create_file ~/learning/prompts/interview_prompts.md "# Interview Prompts

Saved prompts that work well for interviews and discovery conversations."
create_file ~/learning/prompts/boot_prompt.md "# Boot Prompt

The prompt used to orient Claude at the start of a session."

# ~/workflows/
mkdir -p ~/workflows
create_file ~/workflows/daily-boot.md "# Daily Boot Workflow

Recurring steps to run at the start of each working day."
create_file ~/workflows/weekly-retro.md "# Weekly Retro Workflow

Recurring steps for the end-of-week retrospective."

# ~/templates/
mkdir -p ~/templates
create_file ~/templates/slack-update.md "# Slack Update Template

Reusable format for posting team updates to Slack."
create_file ~/templates/retro-template.md "# Retro Template

Reusable format for weekly retrospectives."

# ~/tools/
mkdir -p ~/tools
create_file ~/tools/airtable_sync.py "# airtable_sync.py
# Syncs data between Airtable and local files."
create_file ~/tools/gmail_fetch.sh "#!/bin/bash
# gmail_fetch.sh
# Fetches relevant emails from Gmail via API or MCP."

# ~/notes/
mkdir -p ~/notes
create_file ~/notes/README.md "# Notes

Daily journal and AI digest.

- Daily notes: \`YYYY-MM-DD.md\`
- Weekly digests: \`weekly-WXX.md\`"

echo ""
echo "==> Done. Structure created at ~/"
echo ""
echo "    learning/"
echo "      anthropic-course/  experiments/  prompts/"
echo "    workflows/  templates/  tools/  notes/"
echo ""
echo "Next: clone the RR project if not already present:"
echo "  git clone https://github.com/lekkerit/restaurant-review-ai ~/Projects/rr"
