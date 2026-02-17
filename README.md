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
# Copy OpenLearn to your project
git clone https://github.com/menshikow/openlearn.git
cp -r openlearn/.opencode/ ./your-project/

# Start opencode and run
/openlearn-init
```

## Quick Start

1. `/openlearn-init` - Set up your project
2. `/openlearn-feature` - Plan a feature
3. `/openlearn-guide` - Get guidance while coding
4. `/openlearn-done` - Pass 6 quality gates

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
| `/openlearn-init` | Initialize project |
| `/openlearn-feature` | Plan a feature |
| `/openlearn-guide` | Get implementation guidance |
| `/openlearn-stuck` | Debug with Protocol D |
| `/openlearn-done` | Complete with gates |
| `/openlearn-test` | Test guidance |
| `/openlearn-retro` | Capture learnings |
| `/openlearn-status` | Check progress |

## Context7

OpenLearn uses official docs (via Context7) so you learn to read documentation, not rely on AI hallucinations.
