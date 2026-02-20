# OpenLearn Project Specification

## Overview

OpenLearn is an AI-mentored development framework for opencode. It transforms opencode from a code generator into a teaching mentor, ensuring junior developers write 100% of the code while receiving Socratic guidance and quality gates.

## Core Principles

### Theory Mode (Default)
- **Student writes ALL code** - Maximum 5 lines of example code at a time
- **Guidance only** - Explanations, text descriptions, and guidance
- **No file creation** without explicit permission
- **No command execution** without asking first

### Build Mode (Explicit)
- Triggered by: "create", "implement", "write", or `/openlearn-*` commands
- Can guide file structure (student still writes)
- Maximum 5 lines of example code
- Always ask before writing or executing

### Permission-First Approach
- Explain what you want to do
- Show the content you plan to write
- Ask: "Should I create this file, or would you prefer to write it yourself?"
- Only proceed after explicit "yes" or "create it"

## The 6 Gates

| Gate | Name | Blocking | Purpose | Threshold |
|------|------|----------|---------|-----------|
| 🔒 | Ownership | ✅ Yes | Explain your code | 75%+ |
| 🛡️ | Security | ✅ Yes | No vulnerabilities | 75%+ |
| ⚠️ | Errors | No | Error handling | - |
| ⚡ | Performance | No | Scalability | - |
| 📖 | Fundamentals | No | Code quality | - |
| 🧪 | Testing | No | Test coverage | - |

## Database Schema

### Tables

#### topics
- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `name` - TEXT UNIQUE NOT NULL
- `first_encountered` - TEXT NOT NULL (ISO timestamp)
- `last_encountered` - TEXT NOT NULL (ISO timestamp)
- `count` - INTEGER DEFAULT 1

#### learnings
- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `timestamp` - TEXT NOT NULL (ISO timestamp)
- `task` - TEXT NOT NULL
- `topic` - TEXT (nullable)
- `what_learned` - TEXT NOT NULL
- `mistakes` - TEXT (nullable)
- `created_at` - TEXT DEFAULT CURRENT_TIMESTAMP

#### objectives
- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `objective` - TEXT NOT NULL
- `status` - TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned'))
- `created_at` - TEXT DEFAULT CURRENT_TIMESTAMP
- `completed_at` - TEXT (nullable)

#### gate_results
- `id` - INTEGER PRIMARY KEY AUTOINCREMENT
- `timestamp` - TEXT DEFAULT CURRENT_TIMESTAMP
- `task_name` - TEXT NOT NULL
- `gate_name` - TEXT NOT NULL
- `score` - INTEGER
- `passed` - BOOLEAN
- `feedback` - TEXT (nullable)

## Context7 Integration

### Modes
1. **Auto (Default)** - Query Context7 immediately for official documentation
2. **Suggest** - Ask "Shall we check the official documentation?"
3. **Manual** - Only query when explicitly asked

### Configuration
- Mode selection in user profile
- Automatic MCP setup via `/openlearn-setup-context7`

## Project Structure

```
.opencode/
├── agents/          # Gate and mentor agents
│   ├── mentor.md
│   ├── ownership-gate.md
│   ├── security-gate.md
│   ├── error-gate.md
│   ├── performance-gate.md
│   ├── fundamentals-gate.md
│   └── testing-gate.md
├── commands/        # User-facing slash commands
│   ├── openlearn-init.md
│   ├── openlearn-task.md
│   ├── openlearn-guide.md
│   ├── openlearn-stuck.md
│   ├── openlearn-done.md
│   ├── openlearn-test.md
│   ├── openlearn-docs.md
│   ├── openlearn-retro.md
│   ├── openlearn-advise.md
│   ├── openlearn-status.md
│   ├── openlearn-profile.md
│   └── openlearn-setup-context7.md
└── openlearn/
    ├── AGENTS.md    # This reference file
    ├── PROJECT.md   # This specification
    ├── config.json  # User/project configuration
    ├── openlearn.json # JSON data store
    ├── learnings/   # Stored learning entries
    ├── specs/       # Task specifications
    └── product/     # Product documentation
```

## Configuration

### Global Profile
Location varies by OS:
- macOS: `~/Library/Application Support/openlearn/profile.json`
- Linux: `~/.config/openlearn/profile.json`
- Windows: `%APPDATA%/openlearn/profile.json`

### Profile Schema
```json
{
  "version": "1.0.0",
  "configured_at": null,
  "profile": {
    "type": "junior",
    "settings": {
      "background": "coding-basics",
      "design_involvement": true,
      "analogies": {
        "enabled": false,
        "source": null
      }
    }
  },
  "context7": {
    "mode": "auto",
    "enabled": true
  },
  "mode": "theory",
  "preferences": {
    "code_examples_max_lines": 5,
    "auto_cleanup_temp_files": true
  }
}
```

## Junior Profile Behavior

### Simplification
- Use analogies when helpful (if enabled)
- Avoid jargon; explain terms when used
- Connect new concepts to things they know

### Encouragement
- Acknowledge good questions
- Praise solid reasoning
- Highlight growth from past mistakes

### Standards
- Do not accept "it just works" as an explanation
- Require understanding, not memorization
- Challenge assumptions gently but firmly

## Installation Flow

1. Clone/download OpenLearn
2. Run install script (bash or PowerShell)
3. Choose global or project-specific profile
4. Optional: Create global profile for reuse
5. Install dependencies (bun/npm/pnpm)
6. Start opencode and run `/openlearn-init`

## Development Workflow

### Step 1: Initialize
```
/openlearn-init
```
Sets up project with user profile, mission, stack, and roadmap.

### Step 2: Plan Task
```
/openlearn-task
```
Creates spec files with acceptance criteria and tasks.

### Step 3: Build
```
/openlearn-guide    # Get Socratic guidance
/openlearn-stuck    # Debug when stuck
```

### Step 4: Complete
```
/openlearn-done
```
Pass 6 quality gates and auto-cleanup temporary files.

### Step 5: Track Learning
```
/openlearn-retro    # Save what you learned
/openlearn-advise   # Query past learnings
/openlearn-status   # Check progress
```
