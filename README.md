![OpenLearn Cover](assets/readme.jpg)

# OpenLearn
> AI-mentored development for opencode. You write the code, we guide the thinking.

[![Tests](https://github.com/menshikow/openlearn/workflows/Tests/badge.svg)](https://github.com/menshikow/openlearn/actions)
[![Built for opencode](https://img.shields.io/badge/Built%20for-opencode-6366f1?style=flat)](https://opencode.ai)

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

### Step 1: Initialize

```
/openlearn-init
```

Sets up your project with mission, stack, and roadmap.

### Step 2: Plan Feature

```
/openlearn-feature
```

Creates spec files with acceptance criteria and tasks.

### Step 3: Build

```
/openlearn-guide    # Get Socratic guidance
/openlearn-stuck    # Debug with Protocol D
```

You write ALL code. OpenLearn provides patterns (max 8 lines) and guidance.

### Step 4: Complete

```
/openlearn-done
```

Pass 6 quality gates. Gates 1 & 2 require 75%+ to proceed.

### Step 5: Track Learning

```
/openlearn-retro    # Save what you learned
/openlearn-advise   # Query past learnings
/openlearn-status   # Check progress
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
| `/openlearn-init` | Initialize project |
| `/openlearn-feature` | Plan feature |
| `/openlearn-guide` | Socratic guidance |
| `/openlearn-stuck` | Debug systematically |
| `/openlearn-done` | Complete with gates |
| `/openlearn-retro` | Capture learnings |
| `/openlearn-advise` | Query past learnings |
| `/openlearn-status` | Check progress |

## Inspiration

Inspired by [OwnYourCode](https://github.com/DanielPodolsky/ownyourcode) by Daniel Podolsky.

## License

MIT
