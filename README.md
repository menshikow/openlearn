# OpenLearn

> Stop generating code. Start understanding it.

OpenLearn is an AI-mentored development framework built natively for **opencode**.  
It transforms AI from a code generator into a teaching mentor.

You write **100% of the production code**.  
OpenLearn guides your thinking, architecture decisions, and quality — without doing the work for you.

---

## Why OpenLearn?

Most AI coding tools:
- Generate code
- Solve problems for you
- Let you copy without understanding

OpenLearn does the opposite.

It:
- Forces architectural thinking
- Uses Socratic questioning
- Requires you to explain your code
- Verifies quality with 6 mandatory gates
- Uses official documentation (Context7) before answering

The goal:  
**Escape tutorial hell. Build real projects. Actually learn.**

---

## Core Philosophy

### 1️⃣ Active Typist
You write all production code.  
The AI may show patterns (max 8 lines), never full implementations.

### 2️⃣ Socratic Teaching
Instead of answers:
- “What have you tried?”
- “Why did you choose that approach?”
- “What happens if this changes?”

### 3️⃣ 6 Gates Before Shipping

Every completed task must pass:

| Gate | Name | Blocking | Purpose |
|------|------|----------|----------|
| 🔒 | Ownership | ✅ Yes | You must explain your code |
| 🛡️ | Security | ✅ Yes | Security review |
| ⚠️ | Errors | No | Error handling quality |
| ⚡ | Performance | No | Scalability & efficiency |
| 📖 | Fundamentals | No | Clean code & design |
| 🧪 | Testing | No | Test coverage & habits |

Gates 1 & 2 require **75%+ to pass**.

No shortcuts.

---

## Target User

Junior developers who:

- Know basic programming (variables, loops, functions)
- Are building portfolio projects
- Want to understand architecture
- Want guided practice — not generated answers

This is not a code generator.  
This is deliberate practice.

---

## Architecture

OpenLearn is implemented as an **opencode skill** using:

- Custom `/openlearn-*` commands
- Specialized teaching agents
- Dedicated quality gate agents
- Persistent project configuration
- Context7 integration for official docs

---

## Installation

### Requirements

- opencode CLI (v2.0+)
- Git
- (Optional) Context7 MCP server

### Setup

1. Clone the repository
2. Copy the `.opencode/` folder into your project
3. Run:

```

/openlearn-init

```

OpenLearn will:
- Configure your profile
- Create mission and roadmap files
- Set up Context7 integration
- Inject behavior into AGENTS.md

---

## Commands

### Core Commands

| Command | Purpose |
|----------|----------|
| `/openlearn-init` | Initialize project |
| `/openlearn-feature` | Create feature specs |
| `/openlearn-guide` | Get implementation guidance |
| `/openlearn-stuck` | Debug using Protocol D |
| `/openlearn-done` | Complete task with 6 Gates |

### Learning System

| Command | Purpose |
|----------|----------|
| `/openlearn-test` | Test writing guidance |
| `/openlearn-docs` | Documentation help |
| `/openlearn-retro` | Capture what you learned |
| `/openlearn-advise` | Recall past learnings |
| `/openlearn-status` | Check project progress |
| `/openlearn-profile` | View/change settings |

---

## Context7 Integration

OpenLearn uses Context7 to verify official documentation.

Modes:

- `auto` (default) – Automatically checks docs
- `suggest` – Asks before checking
- `manual` – Only when requested

This teaches you to:
- Read official docs
- Verify APIs
- Avoid hallucinated behavior

---

## Example Workflow

### 1️⃣ Initialize

```

/openlearn-init

```

### 2️⃣ Plan a Feature

```

/openlearn-feature

```

### 3️⃣ Build It Yourself

You write the code.

### 4️⃣ Complete with Gates

```

/openlearn-done

```

You must:
- Explain your code (Ownership Gate)
- Pass security checks
- Review errors, performance, quality, and tests

Only then is it complete.

---

## Success Criteria

You’re succeeding if:

- You can explain every line you write
- You consistently pass Ownership Gate (75%+)
- You consult official documentation
- You build projects without copying tutorials
- You capture learnings after each feature

---

## Design Principles

- Student writes all production code
- AI provides guidance, not answers
- No automatic edits from gates
- Security and ownership are mandatory
- Learning > speed

---

## License

[MIT](LICENSE)

---


```text
AI can either:
- Make you faster at not understanding  
or  
- Make you better at thinking  

OpenLearn chooses the second.
```
