![OpenLearn Cover](assets/readme.jpg)

# OpenLearn
> AI-mentored development for opencode. You write the code, we guide the thinking.

[![Tests](https://github.com/menshikow/openlearn/workflows/Tests/badge.svg)](https://github.com/menshikow/openlearn/actions)
[![Built for opencode](https://img.shields.io/badge/Built%20for-opencode-6366f1?style=flat)](https://opencode.ai)

[English](README.md) | [Deutsch](README.de.md) | [Русский](README.ru.md)

## What is it?

OpenLearn transforms opencode from a code generator into a teaching mentor. You write 100% of the code while getting Socratic guidance and quality gates.

## Installation

### macOS/Linux

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/menshikow/openlearn/main/install.sh)
```

### Windows (PowerShell)

```powershell
iwr -useb https://raw.githubusercontent.com/menshikow/openlearn/main/install.ps1 | iex
```

### Manual Installation

```bash
git clone https://github.com/menshikow/openlearn.git
cp -r openlearn/.opencode/ ./your-project/
```

### Global Profile

During installation, you'll be asked if you want to create a **global profile** at:
- macOS: `~/Library/Application Support/openlearn/profile.json`
- Linux: `~/.config/openlearn/profile.json`

Global profiles allow you to reuse settings across all projects, skipping profile questions on subsequent installs.

## Usage

### Step 1: Initialize

```
/openlearn-init
```

Sets up your project with:
- User profile (global or local)
- Project mission, stack, and roadmap
- Context7 MCP configuration
- Theory/Build mode selection


### Step 2: Plan Task

```
/openlearn-task
```

Creates spec files with acceptance criteria and tasks.

**Note**: Renamed from `/openlearn-feature` to be more general.

### Step 3: Build

```
/openlearn-guide    # Get Socratic guidance (Theory Mode)
/openlearn-stuck    # Debug
```

**Theory Mode** (default): You write ALL code. OpenLearn provides:
- Explanations and guidance
- Patterns (max **5 lines** of example code)
- **Never** creates files without permission
- **Never** runs commands without asking

**Build Mode**: Triggered when you say "create", "implement", or use `/openlearn-*` commands. Still requires permission for every action.

### Step 4: Complete

```
/openlearn-done
```

Pass 6 quality gates:
- Gates 1 & 2 require 75%+ to proceed
- Automatically cleans up temporary files (AGENTS.md, PROJECT.md) from root if configured

### Step 5: Track Learning

```
/openlearn-retro    # Save what you learned
/openlearn-advise   # Query past learnings
/openlearn-status   # Check progress
```

### Additional Commands

```
/openlearn-setup-context7   # Configure Context7 MCP
/openlearn-profile          # View/change settings
```

## The 6 Gates

| Gate | Name | Blocking | Purpose |
|------|------|----------|---------|
| 🔒 | Ownership | ✅ Yes (75%+) | Explain your code |
| 🛡️ | Security | ✅ Yes (75%+) | No vulnerabilities |
| ⚠️ | Errors | No | Error handling |
| ⚡ | Performance | No | Scalability |
| 📖 | Fundamentals | No | Code quality |
| 🧪 | Testing | No | Test coverage |

## Commands

| Command | Purpose |
|---------|---------|
| `/openlearn-init` | Initialize project with global profile support |
| `/openlearn-task` | Plan task with spec-driven development |
| `/openlearn-guide` | Get Socratic guidance (Theory Mode) |
| `/openlearn-stuck` | Debug systematically (Protocol D) |
| `/openlearn-done` | Complete with 6 Gates + auto-cleanup |
| `/openlearn-test` | Testing guidance |
| `/openlearn-docs` | Documentation help |
| `/openlearn-retro` | Capture learnings |
| `/openlearn-advise` | Query past learnings |
| `/openlearn-status` | Check progress |
| `/openlearn-profile` | View/change settings |
| `/openlearn-setup-context7` | Configure Context7 MCP |

## Inspiration

Inspired by [OwnYourCode](https://github.com/DanielPodolsky/ownyourcode) by Daniel Podolsky.

## License

MIT
