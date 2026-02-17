![OpenLearn Cover](assets/cover.jpg)

# OpenLearn
> AI-mentored development for opencode. You write the code, we guide the thinking.

[![Built for opencode](https://img.shields.io/badge/Built%20for-opencode-6366f1?style=flat)](https://opencode.ai)
[![Tests](https://github.com/menshikow/openlearn/workflows/Tests/badge.svg)](https://github.com/menshikow/openlearn/actions)
[![Bun](https://img.shields.io/badge/Bun-%23000000.svg?style=flat&logo=bun&logoColor=white)](https://bun.sh)

[English](README.md) | [Deutsch](README.de.md) | [Русский](README.ru.md)

## What is it?

OpenLearn transforms opencode from a code generator into a teaching mentor. You write 100% of the code while getting Socratic guidance and quality gates.

## Installation

```bash
# macOS/Linux
curl -fsSL https://raw.githubusercontent.com/menshikow/openlearn/main/install.sh | bash

# Windows (PowerShell)
iwr -useb https://raw.githubusercontent.com/menshikow/openlearn/main/install.ps1 | iex

# Or manually
git clone https://github.com/menshikow/openlearn.git
cp -r openlearn/.opencode/ ./your-project/
```

## Usage

### Step 1: Initialize Your Project

Start opencode in your project directory, then run:

```
/openlearn-init
```

This will ask you:
- Your coding background
- What you're building
- Your tech stack
- How to use documentation (auto/suggest/manual)

Creates:
- `mission.md` - Your project purpose
- `stack.md` - Technology decisions
- `roadmap.md` - Development phases

### Step 2: Plan Your Feature

```
/openlearn-feature
```

This will:
- Show your current roadmap phase
- Help define the feature
- Create spec files with acceptance criteria
- Break it into tasks

Creates:
- `spec.md` - Requirements
- `design.md` - Technical approach
- `tasks.md` - Implementation checklist

### Step 3: Build (You Write the Code!)

While coding, use:

```
/openlearn-guide    # Get Socratic guidance
/openlearn-stuck    # Debug with Protocol D
```

**You write ALL code**. OpenLearn only provides:
- Patterns (max 8 lines)
- Questions to guide thinking
- Documentation references

### Step 4: Complete with Quality Gates

```
/openlearn-done
```

Runs all 6 gates:
1. 🔒 **Ownership** (75%+ required) - Explain your code
2. 🛡️ **Security** (75%+ required) - No vulnerabilities
3. ⚠️ **Errors** - Proper error handling
4. ⚡ **Performance** - Scales well
5. 📖 **Fundamentals** - Clean code
6. 🧪 **Testing** - Test coverage

If you fail Gate 1 or 2, you retry until you understand.

### Step 5: Track Your Learning

```
/openlearn-retro    # Save what you learned
/openlearn-advise   # Get advice from past learnings
/openlearn-status   # See your progress
```

All learnings saved to SQLite database + markdown files.

## Example Workflow

```bash
# 1. Install OpenLearn
curl -fsSL https://raw.githubusercontent.com/menshikow/openlearn/main/install.sh | bash

# 2. Go to your project
cd my-todo-app

# 3. Start opencode
opencode

# 4. Initialize
/openlearn-init
# → Answer questions about your project

# 5. Plan first feature
/openlearn-feature
# → Creates spec for "add todo" feature

# 6. Build it yourself
# Write code, use /openlearn-guide when stuck

# 7. Complete
/openlearn-done
# → Pass 6 gates, explain your code

# 8. Reflect
/openlearn-retro
# → Save learnings to database
```

## The 6 Gates

Before shipping, your code must pass:

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
| `/openlearn-init` | Initialize project with mission and roadmap |
| `/openlearn-feature` | Plan a feature with specs |
| `/openlearn-guide` | Get Socratic guidance while coding |
| `/openlearn-stuck` | Debug systematically (Protocol D) |
| `/openlearn-done` | Complete task with 6 Gates |
| `/openlearn-retro` | Save what you learned to SQLite |
| `/openlearn-advise` | Query past learnings from database |
| `/openlearn-status` | Show progress and statistics |
| `/openlearn-test` | Test writing guidance |
| `/openlearn-docs` | Documentation help |
| `/openlearn-profile` | View/change settings |

## Learning System

OpenLearn tracks your learning journey:

- **SQLite Database**: `.opencode/openlearn/openlearn.db`
- **Markdown Files**: `.opencode/openlearn/learnings/`
- **Topics Tracked**: Technologies you encounter (React, TypeScript, etc.)
- **Gate Scores**: Ownership and security scores saved

Query anytime:
```
/openlearn-advise
→ "When you worked on [similar task], you learned..."
```

## Context7

OpenLearn uses official docs (via Context7) so you learn to read documentation, not rely on AI hallucinations.

## Project Structure

```
.opencode/
├── openlearn/
│   ├── config.json          # User settings
│   ├── openlearn.db         # SQLite database
│   ├── product/
│   │   ├── mission.md       # Project mission
│   │   ├── stack.md         # Tech stack
│   │   └── roadmap.md       # Development roadmap
│   ├── specs/active/        # Current feature specs
│   └── learnings/           # Captured learnings
├── commands/                # Slash commands
│   └── openlearn-*.md
└── agents/                  # Gate agents
    ├── mentor.md
    ├── ownership-gate.md
    ├── security-gate.md
    ├── error-gate.md
    ├── performance-gate.md
    ├── fundamentals-gate.md
    └── testing-gate.md
```
