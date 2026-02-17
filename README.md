![OpenLearn Cover](assets/cover.png)

# OpenLearn - AI-Mentored Development Framework

[![Tests](https://github.com/menshikow/openlearn/workflows/Tests/badge.svg)](https://github.com/menshikow/openlearn/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-333333?style=flat)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![GitHub stars](https://img.shields.io/github/stars/menshikow/openlearn?style=flat&color=333333)](https://github.com/menshikow/openlearn/stargazers)
[![Built for opencode](https://img.shields.io/badge/Built%20for-opencode-6366f1?style=flat)](https://opencode.ai)

> Stop generating code. Start understanding it.

OpenLearn is an AI-mentored development framework for **opencode** that transforms AI from a code generator into a teaching mentor.

You write **100% of the production code**. OpenLearn guides your thinking, architecture decisions, and quality — without doing the work for you.

---

## What is opencode?

**opencode** is a powerful AI coding assistant that works directly in your terminal and IDE. It understands your codebase, can read and write files, run commands, and help you build software.

Think of opencode as your coding partner that lives in your development environment.

**Learn more:** [opencode.ai](https://opencode.ai)

---

## Why OpenLearn?

Most AI coding tools generate code for you, which means:
- ❌ You copy without understanding
- ❌ You can't explain what you built
- ❌ You stay in "tutorial hell"

**OpenLearn flips this:**

- ✅ You write all the code yourself
- ✅ AI asks Socratic questions to guide you
- ✅ You must explain your code before shipping
- ✅ 6 quality gates ensure you're actually learning
- ✅ Uses official docs (Context7) to teach you to read documentation

**The goal:** Escape tutorial hell. Build real projects. Actually learn.

---

## How It Works

### 1. opencode Commands

OpenLearn adds custom commands to opencode that start with `/openlearn-*`:

- Type `/openlearn-init` to set up your project
- Type `/openlearn-feature` to plan a new feature
- Type `/openlearn-done` when you're ready to ship

These commands invoke specialized **agents** that mentor you through each step.

### 2. Specialized Agents

Agents are AI workers with specific jobs:

- **@mentor** - Your primary teaching guide
- **@ownership-gate** - Makes sure you understand your code (BLOCKING)
- **@security-gate** - Checks for security issues (BLOCKING)
- **@error-gate** - Reviews error handling
- **@performance-gate** - Analyzes performance
- **@fundamentals-gate** - Checks code quality
- **@testing-gate** - Reviews test coverage

### 3. The 6 Gates

Before any code ships, it must pass 6 quality gates:

| Gate | Name | Blocking | Purpose |
|------|------|----------|----------|
| 🔒 | Ownership | ✅ Yes | You must explain every line |
| 🛡️ | Security | ✅ Yes | No security vulnerabilities |
| ⚠️ | Errors | No | Proper error handling |
| ⚡ | Performance | No | Scales well |
| 📖 | Fundamentals | No | Clean, readable code |
| 🧪 | Testing | No | Tested adequately |

**Gates 1 & 2 require 75%+ to pass.** If you fail, you retry with different questions until you prove understanding.

### 4. Context7 Integration

OpenLearn automatically checks official documentation before answering:

- **Auto mode** (default): Queries docs automatically
- **Suggest mode**: Asks before checking
- **Manual mode**: Only checks when you ask

This teaches you to read docs, not rely on AI hallucinations.

---

## Installation

### Prerequisites

1. **Install opencode CLI**
   ```bash
   # macOS/Linux
   curl -fsSL https://opencode.ai/install.sh | bash
   
   # Or download from: https://opencode.ai
   ```

2. **Verify installation**
   ```bash
   opencode --version
   ```

### Install OpenLearn

OpenLearn is an **opencode skill** that adds custom commands.

**Option 1: Copy to your project (recommended)**

```bash
# Clone the repository
git clone https://github.com/menshikow/openlearning.git

# Copy the .opencode folder to your project
cp -r openlearning/.opencode/ /path/to/your/project/

# Done! OpenLearn commands are now available
```

**Option 2: Install globally**

```bash
# Copy to your opencode config directory
cp -r openlearning/.opencode/ ~/.config/opencode/
```

---

## Quick Start Guide

### Step 1: Initialize OpenLearn

In your project directory, start opencode and type:

```
/openlearn-init
```

This will:
- Set up your learning profile
- Create project mission and roadmap
- Configure Context7 documentation lookup
- Update AGENTS.md with OpenLearn behavior

**Example session:**
```
Student: /openlearn-init

OpenLearn: Let's set up OpenLearn! What's your coding background?
Options: Know basics | Built projects

Student: Know basics

OpenLearn: What problem are you solving?
Student: I want to build a todo app to track daily tasks

OpenLearn: Great! I'll create your project files...

✅ OpenLearn initialized!
Created:
- mission.md (your project purpose)
- stack.md (technology decisions)
- roadmap.md (development phases)

Next: /openlearn-feature to plan your first feature
```

### Step 2: Plan Your First Feature

```
/openlearn-feature
```

This will:
- Check your roadmap
- Help you define the feature
- Research with Context7 (official docs)
- Create detailed specifications
- Break it into tasks

**Example session:**
```
Student: /openlearn-feature

OpenLearn: What feature are you building?
Student: Add a todo item

OpenLearn: Let me check the React docs for form handling...
[Queries Context7]

OpenLearn: What components do you need?
Student: An input field and button

OpenLearn: How will the todo get added to the list?
Student: Lift state up to parent?

OpenLearn: Exactly! Here's your spec:

📄 spec.md - Requirements
📄 design.md - Technical approach
📄 tasks.md - Implementation steps

Start with Task 1!
```

### Step 3: Build It (You Write the Code!)

```
/openlearn-guide
```

Get Socratic guidance without being given the answer:

```
Student: /openlearn-guide

OpenLearn: What do you need help with?
Student: Creating the input component

OpenLearn: What have you tried?
Student: I'm not sure where to start

OpenLearn: What should the input capture?
Student: The todo text

OpenLearn: Good! In React, you use useState for input values.
Here's a minimal pattern (max 8 lines):

function TodoInput({ onAdd }) {
  const [text, setText] = useState('');
  // How would you handle the submit?
}

Try writing it yourself!
```

### Step 4: Debug When Stuck

```
/openlearn-stuck
```

Debug systematically using Protocol D:

```
Student: /openlearn-stuck

OpenLearn: What error are you seeing?
Student: "Cannot read property 'map' of undefined"

OpenLearn: What were you trying to do?
Student: Display a list from API

OpenLearn: [READ] Let me see your code...
[ISOLATE] What's your initial state?
Student: useState()

OpenLearn: [DOCS] Let's check React docs...
[Queries Context7 for useState]

OpenLearn: [HYPOTHESIZE] The issue is initial state is undefined.
[FIX] Try initializing with an empty array: useState([])

Student: That worked!

OpenLearn: Can you explain why?
Student: map() needs an array, undefined doesn't work

OpenLearn: Perfect! Great debugging!
```

### Step 5: Complete with Quality Gates

```
/openlearn-done
```

This runs all 6 gates:

```
Student: /openlearn-done

🔒 Gate 1: Ownership
"Walk me through your code..."

Student: [Explains each part]

🔒 Ownership Gate: 85/100 ✅ PASS

🛡️ Gate 2: Security
[Reviews for vulnerabilities]

🛡️ Security Gate: 100/100 ✅ PASS

⚠️ Gate 3: Errors
Found 1 empty catch block at line 23
[Shows how to fix]

⚡ Gate 4: Performance
No issues

📖 Gate 5: Fundamentals
Function handleSubmit is 60 lines
Suggestion: Break into smaller functions

🧪 Gate 6: Testing
💡 Opportunities:
- Test adding a todo
- Test empty input validation

✅ Task complete!
```

### Step 6: Capture Your Learning

```
/openlearn-retro
```

```
Student: /openlearn-retro

OpenLearn: What did you learn?
Student: I understand useState and lifting state up now

OpenLearn: What was challenging?
Student: Figuring out where to put state

OpenLearn: What mistake did you make?
Student: Put state in each child instead of parent

[Saved learning to learnings/2026-02-17-todo-app.md]
```

---

## Full Command Reference

### Core Development

| Command | What It Does |
|---------|--------------|
| `/openlearn-init` | Initialize project with mission, stack, roadmap |
| `/openlearn-feature` | Plan feature with specs, design, tasks |
| `/openlearn-guide` | Get Socratic guidance on implementation |
| `/openlearn-stuck` | Debug using Protocol D (READ→ISOLATE→DOCS→HYPOTHESIZE→FIX) |
| `/openlearn-done` | Complete task with 6 Gates verification |

### Support Commands

| Command | What It Does |
|---------|--------------|
| `/openlearn-test` | Guidance on writing tests |
| `/openlearn-docs` | Help with documentation |
| `/openlearn-retro` | Capture what you learned |
| `/openlearn-advise` | Recall past learnings for similar tasks |
| `/openlearn-status` | Check project progress |
| `/openlearn-profile` | View/change settings |

---

## Success Criteria

You're succeeding with OpenLearn if:

✅ You can explain every line of code you write  
✅ You consistently pass Ownership Gate (75%+)  
✅ You check official documentation (Context7)  
✅ You build projects without copying tutorials  
✅ You capture learnings after each feature  

---

## Design Principles

1. **Student writes all code** - AI shows patterns (max 8 lines), never full implementations
2. **Socratic questioning** - Ask before tell
3. **No automatic edits** - Gates are read-only, you make all changes
4. **Security & ownership are mandatory** - Must pass Gates 1 & 2
5. **Learning > speed** - Understanding matters more than shipping fast

---

## Project Structure

```
your-project/
├── .opencode/
│   ├── commands/              # OpenLearn commands
│   │   ├── openlearn-init.md
│   │   ├── openlearn-feature.md
│   │   └── ...
│   ├── agents/                # Teaching agents
│   │   ├── mentor.md
│   │   ├── ownership-gate.md
│   │   ├── security-gate.md
│   │   └── ...
│   └── openlearn/
│       ├── config.json        # Your settings
│       ├── product/
│       │   ├── mission.md     # Project purpose
│       │   ├── stack.md       # Technology choices
│       │   └── roadmap.md     # Development phases
│       ├── specs/active/      # Feature specifications
│       └── learnings/         # Captured learnings
└── AGENTS.md                  # OpenLearn behavior injection
```

---

## Development

### Running Tests

```bash
# Run all tests
bun test

# Run specific test suite
bun test:structure
bun test:frontmatter
bun test:json
bun test:references

# With coverage
bun test --coverage

# TypeScript check
bun run typecheck
```

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `bun test`
5. Commit with conventional commits
6. Push and create a PR

---

## License

[MIT](LICENSE)

---

> **AI can either make you faster at not understanding, or make you better at thinking. OpenLearn chooses the second.**
