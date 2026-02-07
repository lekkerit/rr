# Directive: Initialize Project

> Sets up a new project with comprehensive feature tracking, environment scripts, and progress monitoring.

## Goal

Bootstrap a project with everything needed for AI-assisted development:
- Comprehensive feature list in JSON format
- Environment setup script
- Progress tracking file
- Initial git commit

## Inputs

- Project name and description
- Target complexity level (simple: 50 features, medium: 100 features, complex: 200+ features)
- Tech stack information

## Steps

### 1. Create Feature List (`features.json`)

Generate a comprehensive feature list organized by category:

```json
{
  "project": "project-name",
  "version": "0.1.0",
  "generated": "YYYY-MM-DD",
  "categories": {
    "category_name": {
      "description": "Category description",
      "features": [
        {
          "id": "CAT-001",
          "name": "Feature name",
          "description": "What it does",
          "status": "planned|in_progress|completed|deferred",
          "priority": "critical|high|medium|low",
          "dependencies": ["OTHER-001"]
        }
      ]
    }
  }
}
```

**Feature categories to consider:**
- Core functionality
- User authentication & authorization
- API integrations
- Data management
- UI/UX components
- Notifications & alerts
- Analytics & reporting
- Admin & configuration
- Security & compliance
- Performance & optimization
- Testing & quality
- DevOps & deployment
- Documentation
- Marketing & growth

### 2. Create Environment Setup Script (`init.sh`)

```bash
#!/bin/bash
# Project initialization script

# Check for required tools
# Create virtual environment (if Python)
# Install dependencies
# Set up environment variables template
# Initialize database (if applicable)
# Run initial tests
```

### 3. Create Progress Tracking (`claude-progress.txt`)

```
# Claude Progress Log
# Project: [name]
# Started: [date]

## Current Session
- [ ] Active task

## Completed
- [x] Completed task (date)

## Blocked
- [ ] Blocked task - reason

## Notes
- Important discoveries
- Decisions made
```

### 4. Commit Changes

Stage all new files and commit with message:
```
Initialize project with feature tracking and environment setup
```

## Outputs

- `features.json` - Comprehensive feature list (JSON format prevents accidental edits)
- `init.sh` - Environment setup script (executable)
- `claude-progress.txt` - Progress tracking for AI sessions
- Git commit with all initialization files

## Edge Cases

- **Existing files**: Check before overwriting, merge if needed
- **Large feature lists**: Break into multiple files by category if 300+ features
- **Missing dependencies**: init.sh should fail gracefully with helpful messages

## Learnings

(Updated as directive is used)

- JSON format for features prevents markdown formatting issues during edits
- Keep feature IDs short but meaningful (3-letter category prefix + number)
