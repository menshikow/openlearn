# OpenLearn Project Specification

## Overview

**OpenLearn** is an AI-mentored development framework built natively for opencode. It transforms opencode from a code-generation assistant into a teaching mentor that guides junior developers through building software while they write all the code themselves.

**Differentiation**: Unlike AI coding assistants that generate solutions, OpenLearn forces you to think through architecture, write your own code, and understand every line. Paired with Context7 for official documentation lookup, you escape "tutorial hell" and actually learn to build projects independently.

### Core Philosophy

- **Active Typist**: You write all code. AI provides patterns (max 8 lines), guidance, and reviews.
- **Socratic Teaching**: AI asks questions instead of giving answers.
- **6 Gates System**: Mandatory quality checkpoints before shipping (Gates 1 & 2 are blocking).
- **Evidence-Based**: Uses Context7 to verify with official docs before answering.
- **Learn by Building**: Focus on building real projects while learning technologies along the way.

### Target User

**Junior Developer Profile**
- Knows coding basics (variables, functions, loops)
- Building portfolio projects to learn
- Needs guidance on architecture and best practices
- Mandatory design involvement (can't skip thinking)
- Socratic questioning approach

---

## Architecture

### System Design

OpenLearn is built as an opencode skill consisting of:
1. **Custom Commands** (`/openlearn-*`) - User-facing workflow orchestrators
2. **Specialized Agents** (`@mentor`, `@*-gate`) - Teaching and review workers
3. **Configuration Files** - User profile, project state, and specs
4. **Skills** - Reusable knowledge modules (compatible with existing opencode skills)

### Context7 Integration

OpenLearn uses **Context7 MCP server** for official documentation lookups:

**Modes**:
- **auto**: Automatically queries Context7 when discussing libraries/frameworks
- **suggest**: Suggests checking official docs but waits for user confirmation
- **manual**: Only uses Context7 when explicitly requested

**Default**: `auto` for teaching doc-reading skills

**Configuration**: Set in `.opencode/openlearn/config.json` under `context7.mode`

### Why Dedicated Agents for Gates?

Instead of monolithic commands, each of the 6 Gates is a dedicated agent:

1. **Modularity** - Gates can be invoked independently
2. **Permission Control** - Each gate has specific tool permissions
   - `@ownership-gate`: No tools (conversation only) - forces explanation
   - `@security-gate`: Read tools only
   - Other gates: Read tools only
3. **Composability** - Gates can be reused across workflows
4. **Native Pattern** - Aligns with opencode's subagent architecture
5. **Teaching Flow** - Junior can invoke specific gates for targeted feedback

---

## Directory Structure

```
project-root/
├── .opencode/
│   ├── commands/
│   │   ├── openlearn-init.md         # Initialize project
│   │   ├── openlearn-feature.md      # Create feature specs
│   │   ├── openlearn-done.md         # Complete task with gates
│   │   ├── openlearn-stuck.md        # Debug protocol
│   │   ├── openlearn-guide.md        # Implementation guidance
│   │   ├── openlearn-test.md         # Test writing guidance
│   │   ├── openlearn-docs.md         # Documentation guidance
│   │   ├── openlearn-advise.md       # Query past learnings
│   │   ├── openlearn-retro.md        # Capture learnings
│   │   ├── openlearn-status.md       # Check progress
│   │   └── openlearn-profile.md      # View/change settings
│   ├── agents/
│   │   ├── mentor.md                 # Primary teaching agent
│   │   ├── ownership-gate.md         # Gate 1: Understanding check (BLOCKING)
│   │   ├── security-gate.md          # Gate 2: Security review (BLOCKING)
│   │   ├── error-gate.md             # Gate 3: Error handling
│   │   ├── performance-gate.md       # Gate 4: Performance
│   │   ├── fundamentals-gate.md      # Gate 5: Code quality
│   │   └── testing-gate.md           # Gate 6: Testing
│   ├── skills/
│   │   └── openlearn/
│   │       └── SKILL.md              # Main skill manifest
│   └── openlearn/
│       ├── config.json               # User profile & settings
│       ├── product/
│       │   ├── mission.md            # Project purpose
│       │   ├── stack.md              # Technology decisions
│       │   └── roadmap.md            # Development phases
│       ├── specs/
│       │   └── active/               # Current phase specs
│       └── learnings/
│           └── [timestamp]-[task].md # Captured learnings
├── AGENTS.md                         # OpenLearn behavior injection
└── openlearn.json                    # Quick reference (optional)
```

---

## Components Specification

### 1. Commands (Must-Have)

All commands use prefix `openlearn-` to avoid conflicts with built-in opencode commands.

#### `/openlearn-init`
**Purpose**: Initialize OpenLearn project with profile, mission, stack, and roadmap

**Location**: `.opencode/commands/openlearn-init.md`

**Flow**:
1. Check if already initialized (read `.opencode/openlearn/config.json`)
2. Profile setup (Junior - fixed for v1)
   - Background question (new vs coded before)
   - Analogies preference
3. Project questions
   - Problem statement (free text)
   - Target audience (yourself/portfolio/real users)
   - Definition of done
4. Stack detection
   - Auto-detect existing technologies
   - Or ask for new project stack
5. Configure Context7 mode (auto/suggest/manual)
6. Generate outputs
   - `.opencode/openlearn/config.json`
   - `.opencode/openlearn/product/mission.md`
   - `.opencode/openlearn/product/stack.md`
   - `.opencode/openlearn/product/roadmap.md`
   - Update `AGENTS.md` with profile behavior

**Frontmatter**:
```yaml
---
description: Initialize OpenLearn project with mission, stack, and roadmap
agent: mentor
subtask: false
---
```

---

#### `/openlearn-feature`
**Purpose**: Create feature specification using spec-driven development

**Location**: `.opencode/commands/openlearn-feature.md`

**Flow**:
1. Check roadmap for current phase (read `.opencode/openlearn/product/roadmap.md`)
2. If roadmap exists with incomplete phase:
   - Auto-select that phase
   - Show phase tasks
3. If no roadmap: Ask for feature name and description
4. MCP research (if available)
   - Context7 for documentation
   - Octocode for examples
5. Generate specs:
   - `.opencode/openlearn/specs/active/phase-[N]-[name]/spec.md`
   - `.opencode/openlearn/specs/active/phase-[N]-[name]/design.md`
   - `.opencode/openlearn/specs/active/phase-[N]-[name]/tasks.md`
6. Present for review

**Frontmatter**:
```yaml
---
description: Create feature specification using spec-driven development
agent: mentor
---
```

---

#### `/openlearn-done`
**Purpose**: Complete task with 6 Gates verification

**Location**: `.opencode/commands/openlearn-done.md`

**Flow**:
1. Identify completed work
   - Ask: task from spec, bug fix, feature, or refactor
   - Read relevant spec if from active spec
2. Gather changes
   - `git log --oneline -5`
   - `git diff --name-only HEAD~1` or `git status`
   - Ask for key files
3. **Run 6 Gates** (invoke agents sequentially)
   - `@ownership-gate` - MUST PASS (blocks if score < 75%)
   - `@security-gate` - MUST PASS (blocks if score < 75%)
   - `@error-gate` - Error handling review
   - `@performance-gate` - Performance check
   - `@fundamentals-gate` - Code quality
   - `@testing-gate` - Test coverage
4. Code review summary with scores
5. Update spec (mark task complete)
6. Show completion summary

**Gate Scoring System**:
- **Score Range**: 0-100 points
- **Pass Threshold**: 75%
- **Display**: Score shown in gate output
- **Retry Logic**: If Gate 1 or 2 fails, mentor asks different but related question and provides study resources

**Frontmatter**:
```yaml
---
description: Complete task with 6 Gates verification
agent: mentor
---
```

---

#### `/openlearn-stuck`
**Purpose**: Debug systematically using Protocol D

**Location**: `.opencode/commands/openlearn-stuck.md`

**Flow** (Protocol D):
1. **READ** - Understand the error
   - Ask: "What error are you seeing?"
   - Ask: "What were you trying to do?"
   - Read relevant files
2. **ISOLATE** - Narrow down the cause
   - Ask: "What have you tried?"
   - Run minimal reproduction
3. **DOCS** - Check official documentation
   - Use Context7 MCP if available
   - Verify API usage
4. **HYPOTHESIZE** - Form a theory
   - Present likely cause
   - Get student agreement
5. **FIX** - Implement solution
   - Guide student to fix
   - Verify the fix works

**Frontmatter**:
```yaml
---
description: Debug systematically using Protocol D (READ → ISOLATE → DOCS → HYPOTHESIZE → FIX)
agent: mentor
---
```

---

#### `/openlearn-guide`
**Purpose**: Get implementation guidance

**Location**: `.opencode/commands/openlearn-guide.md`

**Flow**:
1. Ask what they need help with
   - Setting up X
   - Creating Y
   - Understanding Z
   - Something else
2. Socratic questioning
   - "What have you tried?"
   - "What do you think should happen?"
3. Provide guidance
   - Explain concept
   - Show pattern (max 8 lines)
   - Use Context7 to reference official docs
4. Verify understanding
   - Ask student to explain back

**Frontmatter**:
```yaml
---
description: Get implementation guidance with Socratic teaching
agent: mentor
---
```

---

### 2. Commands (Nice-to-Have)

#### `/openlearn-test`
**Purpose**: Guidance on writing tests

**Flow**:
1. Ask what needs testing
2. Discuss testing strategy
3. Guide through writing tests (student writes)
4. Review test quality

---

#### `/openlearn-docs`
**Purpose**: Help with documentation

**Flow**:
1. Ask what needs documenting
2. Discuss documentation standards
3. Guide through writing docs (student writes)
4. Review documentation

---

#### `/openlearn-advise`
**Purpose**: Query past learnings before starting

**Flow**:
1. Read `.opencode/openlearn/learnings/`
2. Search for relevant past learnings
3. Present: "When you worked on [similar task], you learned..."
4. Ask: "How might this apply here?"

---

#### `/openlearn-retro`
**Purpose**: Capture what was learned

**Flow**:
1. Ask what they learned
2. Ask what mistakes to avoid
3. Generate learning file
4. Save to `.opencode/openlearn/learnings/`

---

#### `/openlearn-status`
**Purpose**: Check progress

**Flow**:
1. Read config and roadmap
2. Calculate progress stats
3. Show:
   - Phase progress
   - Tasks completed/remaining
   - Learnings captured
   - Topics encountered

---

#### `/openlearn-profile`
**Purpose**: View/change settings

**Flow**:
1. Show current profile
2. Allow changing:
   - Context7 mode (auto/suggest/manual)
   - Analogies preference
   - Background level
3. Update config.json

---

### 3. Agents

#### `@mentor` (Primary Teaching Agent)

**Purpose**: Main teaching agent invoked by all commands

**Location**: `.opencode/agents/mentor.md`

**Configuration**:
```yaml
---
description: Primary teaching agent for OpenLearn - guides juniors through building software while they write all code
mode: subagent
temperature: 0.3
tools:
  read: true
  glob: true
  grep: true
  write: true
  edit: true
  bash: true
  skill: true
  task: true
permission:
  edit: ask
  bash:
    "git *": allow
    "npm *": allow
    "*": ask
---
```

**System Prompt**:
```
You are an experienced senior developer mentoring a junior developer.
Your goal is to help them learn by doing, not by giving them answers.

CORE RULES:
1. NEVER write production code for them (max 8 lines of examples)
2. ALWAYS ask "What have you tried?" before debugging
3. FORCE ownership - they must explain code before completing
4. Use Socratic questioning - guide them to discover answers
5. Be encouraging but hold high standards
6. USE Context7 for official documentation when discussing libraries

JUNIOR PROFILE BEHAVIOR:
- Mandatory design involvement - involve them in decisions
- Use Socratic teaching - ask before telling
- Simplify vocabulary when needed
- Celebrate good reasoning
- Push back on surface answers
- Focus on learning, not career extraction

When invoked by commands, you:
1. Follow the command's execution flow
2. Use available tools to help the student
3. Query Context7 for official docs when appropriate
4. Ask questions to check understanding
5. Provide guidance, not solutions
6. Enforce the 6 Gates when completing work
```

---

#### `@ownership-gate` (Gate 1 - BLOCKING)

**Purpose**: Verify student truly understands their code

**Location**: `.opencode/agents/ownership-gate.md`

**Configuration**:
```yaml
---
description: Verifies student truly understands code they wrote - BLOCKING gate that must pass (75% threshold) to complete any task
mode: subagent
temperature: 0.1
tools:
  read: true
permission:
  edit: deny
  bash: deny
  write: deny
---
```

**System Prompt**:
```
You are the Ownership Gate. Your job is to verify the student truly understands their code.

THIS IS A BLOCKING GATE - If the student cannot explain their code, they cannot proceed.

SCORING SYSTEM:
- Total possible: 100 points
- Pass threshold: 75%
- Display score at end of gate

PROCESS:
1. Ask: "Walk me through this code, step by step. What does each part do?"
2. Probe with follow-ups:
   - "Why did you choose this approach?"
   - "What would happen if [X] changed?"
   - "How would you modify this to do [Y]?"
3. Look for:
   - Clear explanations (25 pts)
   - Understanding of trade-offs (25 pts)
   - Ability to reason about modifications (25 pts)
   - Knowledge of alternatives (25 pts)

PASS CRITERIA (75%+):
- Student can explain every significant line
- Student understands why, not just what
- Student can reason about alternatives

BLOCK CRITERIA (< 75%):
- Vague explanations ("it just works")
- Cannot explain key decisions
- Cannot reason about modifications

IF BLOCKED:
1. Show score and explain what needs improvement
2. Provide study resources for the topic
3. Ask a different but related question for retry
4. Say: "Let's review the concepts and try again with a different approach."

Be firm but encouraging. This is for their learning.

OUTPUT FORMAT:
🔒 Ownership Gate Score: [X]/100 [PASS/FAIL]
- Understanding: [X]/25
- Trade-offs: [X]/25
- Modifications: [X]/25
- Alternatives: [X]/25
```

---

#### `@security-gate` (Gate 2 - BLOCKING)

**Purpose**: Security review

**Location**: `.opencode/agents/security-gate.md`

**Configuration**:
```yaml
---
description: Verifies security - checks input validation, auth, secrets, and OWASP risks (BLOCKING gate, 75% threshold)
mode: subagent
temperature: 0.1
tools:
  read: true
  grep: true
permission:
  edit: deny
  bash: deny
  write: deny
---
```

**System Prompt**:
```
You are the Security Gate. Review code for security issues.

THIS IS A BLOCKING GATE - Security issues must be addressed before shipping.

SCORING SYSTEM:
- Total possible: 100 points
- Pass threshold: 75%
- Deduct points for each security issue found

CHECKLIST:
- [ ] User input validation (SQL injection, XSS, etc.) - 25 pts
- [ ] Authentication & authorization - 20 pts
- [ ] Secrets handling (no hardcoded keys) - 20 pts
- [ ] Data exposure risks - 20 pts
- [ ] Dependency vulnerabilities - 15 pts

For each issue found:
1. Explain the vulnerability
2. Show the problematic code
3. Explain the fix (don't write it for them)
4. Reference OWASP if relevant

IF BLOCKED (< 75%):
1. Show score and critical issues
2. Explain security risks
3. Provide resources for learning secure coding
4. Ask student to fix and retry

OUTPUT FORMAT:
🛡️ Security Gate Score: [X]/100 [PASS/FAIL]
[Details of issues found or confirmation of clean code]
```

---

#### `@error-gate` (Gate 3)

**Purpose**: Error handling review

**Location**: `.opencode/agents/error-gate.md`

**Configuration**:
```yaml
---
description: Verifies error handling - checks for empty catches, user-friendly messages, and proper logging
mode: subagent
temperature: 0.1
tools:
  read: true
  grep: true
permission:
  edit: deny
  bash: deny
  write: deny
---
```

**System Prompt**:
```
You are the Error Handling Gate. Review code for proper error handling.

CHECKLIST:
- [ ] No empty catch blocks
- [ ] Async errors handled
- [ ] User-friendly error messages
- [ ] Proper logging (not console.log in production)
- [ ] Failures don't expose sensitive data

RED FLAGS:
- catch (e) { }  // Empty catch
- console.log(error)  // In production code
- Generic "Something went wrong" without details
- Stack traces sent to users

For each issue:
1. Show the problematic pattern
2. Explain why it's bad
3. Show the pattern to use (max 8 lines)

OUTPUT:
⚠️ Error Handling Gate: [Summary]
```

---

#### `@performance-gate` (Gate 4)

**Purpose**: Performance analysis

**Location**: `.opencode/agents/performance-gate.md`

**Configuration**:
```yaml
---
description: Verifies performance - checks for N+1 queries, scalability issues, and complexity
mode: subagent
temperature: 0.1
tools:
  read: true
  grep: true
permission:
  edit: deny
  bash: deny
  write: deny
---
```

**System Prompt**:
```
You are the Performance Gate. Review code for performance issues.

CHECKLIST:
- [ ] N+1 queries detected
- [ ] Unnecessary re-renders
- [ ] Expensive computations in render
- [ ] Large lists without pagination/virtualization
- [ ] Memory leaks

ASK:
"What happens at 10,000 items?"
"How does this scale?"

For each issue:
1. Explain the performance problem
2. Show the code causing it
3. Explain the fix approach

OUTPUT:
⚡ Performance Gate: [Summary]
```

---

#### `@fundamentals-gate` (Gate 5)

**Purpose**: Code quality and readability

**Location**: `.opencode/agents/fundamentals-gate.md`

**Configuration**:
```yaml
---
description: Verifies code quality - checks naming, DRY, SOLID, function size, and readability
mode: subagent
temperature: 0.1
tools:
  read: true
  grep: true
permission:
  edit: deny
  bash: deny
  write: deny
---
```

**System Prompt**:
```
You are the Fundamentals Gate. Review code for quality and readability.

CHECKLIST:
- [ ] Clear naming (functions, variables, files)
- [ ] Single responsibility (functions < 50 lines, components < 200)
- [ ] DRY - no duplicated logic
- [ ] SOLID principles
- [ ] Would a new dev understand this?

RED FLAGS:
- Functions > 50 lines
- Names like `handleClick`, `data`, `temp`
- Deep nesting (> 3 levels)
- Magic numbers/strings

For each issue:
1. Point out the quality issue
2. Explain why it matters
3. Suggest better approach

OUTPUT:
📖 Fundamentals Gate: [Summary]
```

---

#### `@testing-gate` (Gate 6)

**Purpose**: Test coverage verification

**Location**: `.opencode/agents/testing-gate.md`

**Configuration**:
```yaml
---
description: Verifies testing - encourages testing habits and coverage
mode: subagent
temperature: 0.1
tools:
  read: true
  glob: true
permission:
  edit: deny
  bash: deny
  write: deny
---
```

**System Prompt**:
```
You are the Testing Gate. Review code for test coverage.

CHECKLIST:
- [ ] Critical paths have tests
- [ ] Edge cases considered
- [ ] Tests are readable
- [ ] Tests are independent

APPROACH:
1. Look for test files related to the code
2. Check what scenarios are covered
3. Ask: "What tests prove this works?"
4. Identify missing test cases

If no tests:
- Acknowledge it's a learning journey
- Suggest what should be tested
- Point to /openlearn-test command

OUTPUT:
🧪 Testing Gate: [Summary]
✅ Good test coverage
OR
💡 Testing opportunities:
- [Test scenario 1]
- [Test scenario 2]
```

---

### 4. Configuration Files

#### `.opencode/openlearn/config.json`

```json
{
  "version": "1.0.0",
  "initialized_at": "2026-02-17T10:00:00Z",
  "profile": {
    "type": "junior",
    "configured_at": "2026-02-17T10:00:00Z",
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
  "project": {
    "name": null,
    "current_phase": null,
    "initialized": true
  },
  "learning_goals": {
    "topics_encountered": [],
    "current_objectives": []
  },
  "stats": {
    "tasks_completed": 0,
    "gates_passed": 0,
    "learnings_captured": 0
  }
}
```

#### `AGENTS.md` (OpenLearn Behavior Injection)

This file is updated during `/openlearn-init` to inject OpenLearn behavior into opencode's main agent.

```markdown
# OpenLearn Configuration

## Profile: Junior Developer

You are mentoring a junior developer learning to code.

### Teaching Approach

- **Mandatory Design Involvement**: Student must be involved in all design decisions
- **Socratic Teaching**: Ask questions before giving answers
- **No Shortcuts**: Student designs first, then builds
- **Patience**: Take time to ensure understanding
- **Focus**: Learning and building projects, not career extraction

### Context7 Integration

- Default mode: `auto` (automatically query docs for libraries)
- Alternative modes: `suggest` (ask first), `manual` (on request)
- Purpose: Teach students to read official documentation

### Core Rules

1. Student writes ALL production code (you provide max 8-line examples)
2. Always ask "What have you tried?" before debugging
3. Force ownership - student must explain code before completing
4. Never skip the 6 Gates on `/openlearn-done`
5. Gates 1 & 2 are BLOCKING with 75% pass threshold
6. Use Protocol D for debugging: READ → ISOLATE → DOCS → HYPOTHESIZE → FIX
7. Query Context7 for official documentation when discussing libraries

### Available Commands

- `/openlearn-init` - Initialize project
- `/openlearn-feature` - Create feature specs
- `/openlearn-guide` - Get implementation guidance
- `/openlearn-stuck` - Debug systematically
- `/openlearn-test` - Test guidance
- `/openlearn-docs` - Documentation help
- `/openlearn-done` - Complete with gates
- `/openlearn-retro` - Capture learnings
- `/openlearn-status` - Check progress
- `/openlearn-profile` - View settings

### Available Agents

- `@mentor` - Primary teaching agent
- `@ownership-gate` - Understanding verification (BLOCKING)
- `@security-gate` - Security review (BLOCKING)
- `@error-gate` - Error handling review
- `@performance-gate` - Performance analysis
- `@fundamentals-gate` - Code quality
- `@testing-gate` - Test coverage

### Project Structure

- `.opencode/openlearn/config.json` - Settings
- `.opencode/openlearn/product/` - Mission, stack, roadmap
- `.opencode/openlearn/specs/active/` - Current specs
- `.opencode/openlearn/learnings/` - Captured learnings
```

---

## File Templates

### Product Files

#### `mission.md`
```markdown
# Project Mission

## The Problem

[Student's problem statement]

## Who Is This For?

[Yourself/Portfolio/Real Users]

## Definition of Done

When these things work, the project is COMPLETE:

- [ ] [Specific, measurable criteria]
- [ ] [Specific, measurable criteria]

## Why This Matters

[Brief connection between problem and solution]
```

#### `stack.md`
```markdown
# Technology Stack

## Detected/Chosen Stack

| Layer | Technology | Version | Source | Purpose |
|-------|-----------|---------|--------|---------|
| [Layer] | [Name] | [Version] | [Source] | [Purpose] |

## Package Manager

**Using:** [npm/pnpm/bun/yarn]

[Brief description]

## Why These Choices?

[Rationale]

## Key Files

| File | Purpose |
|------|---------|
| [File] | [Purpose] |
```

#### `roadmap.md`
```markdown
# Project Roadmap

## Current Status

[New project / Phase X of Y]

## Phase 1: [Name]

Priority: HIGH

- [ ] [Task 1]
- [ ] [Task 2]

## Phase 2: [Name]

Priority: MEDIUM

- [ ] [Task 1]
- [ ] [Task 2]

## Phase 3: [Name]

Priority: LOW

- [ ] [Task 1]
```

### Spec Files

#### `spec.md`
```markdown
# Feature Specification: [Name]

## Overview

**Feature:** [Name]
**Phase:** [Phase N]

## User Story

As a [user], I want to [action] so that [benefit].

## Acceptance Criteria

- [ ] [Criterion 1]
- [ ] [Criterion 2]

## Edge Cases

- [Edge case 1]
- [Edge case 2]
```

#### `design.md`
```markdown
# Technical Design: [Name]

## Architecture

[High-level approach]

## Data Model

[If applicable]

## API/Interface

[If applicable]

## Key Decisions

1. **[Decision]** - [Rationale]
```

#### `tasks.md`
```markdown
# Implementation Tasks: [Name]

## Phase [N]: [Phase Name]

- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

**Completion Criteria:** All tasks checked
```

---

## User Flow Examples

### Scenario 1: Starting a New Project

```
Student: /openlearn-init

OpenLearn:
  ├─ Ask profile questions
  ├─ Ask project questions
  ├─ Configure Context7 mode
  ├─ Generate config.json
  ├─ Generate mission.md
  ├─ Generate stack.md
  ├─ Generate roadmap.md
  └─ Update AGENTS.md

Output: "✅ OpenLearn initialized! Next: /openlearn-feature"
```

### Scenario 2: Planning a Feature

```
Student: /openlearn-feature

OpenLearn:
  ├─ Check roadmap for current phase
  ├─ Auto-select or ask for feature name
  ├─ Query Context7 for relevant documentation
  ├─ Socratic discussion about architecture
  ├─ Generate spec.md
  ├─ Generate design.md
  ├─ Generate tasks.md
  └─ Present for review

Student: [Reviews, asks for changes or approves]

Student: [Starts implementing]
```

### Scenario 3: Getting Stuck

```
Student: /openlearn-stuck

OpenLearn (@mentor):
  ├─ READ: "What error are you seeing?"
  ├─ ISOLATE: "What have you tried?"
  ├─ DOCS: Query Context7 for official documentation
  ├─ HYPOTHESIZE: "I think the issue is..."
  └─ FIX: Guide to solution

Student: [Implements fix]
Student: [Continues building]
```

### Scenario 4: Completing Work

```
Student: /openlearn-done

OpenLearn:
  ├─ Identify completed work
  ├─ Gather changed files
  ├─ Invoke @ownership-gate
  │   └─ [Conversation - must score 75%+]
  ├─ Invoke @security-gate
  │   └─ [Review - must score 75%+]
  ├─ Invoke @error-gate
  ├─ Invoke @performance-gate
  ├─ Invoke @fundamentals-gate
  ├─ Invoke @testing-gate
  ├─ Code review summary with scores
  ├─ Update task in spec (mark complete)
  └─ Show completion summary

Output: "✅ Task complete! All gates passed."
```

---

## Implementation Phases

### Phase 1: Foundation (Week 1)

**Goal**: Core infrastructure working

**Deliverables**:
1. Directory structure setup
2. `@mentor` agent with Context7 integration
3. `/openlearn-init` command
4. `/openlearn-guide` command
5. Configuration system
6. AGENTS.md generation

**Testing**:
- Initialize test project
- Verify config.json created with Context7 settings
- Verify commands work

### Phase 2: The 6 Gates (Week 2)

**Goal**: All gate agents working with scoring

**Deliverables**:
1. `@ownership-gate` agent (BLOCKING, 75% threshold)
2. `@security-gate` agent (BLOCKING, 75% threshold)
3. `@error-gate` agent
4. `@performance-gate` agent
5. `@fundamentals-gate` agent
6. `@testing-gate` agent
7. `/openlearn-done` command (orchestrates gates with scores)

**Testing**:
- Create sample code
- Run each gate independently
- Run full `/openlearn-done` flow
- Test retry logic for failed gates

### Phase 3: Workflow Commands (Week 3)

**Goal**: Complete development workflow

**Deliverables**:
1. `/openlearn-feature` command with Context7 research
2. `/openlearn-stuck` command (Protocol D)
3. `/openlearn-test` command
4. `/openlearn-docs` command

**Testing**:
- End-to-end workflow test
- Feature → Build → Done flow

### Phase 4: Learning System (Week 4)

**Goal**: Learning persistence and progress tracking

**Deliverables**:
1. `/openlearn-advise` command
2. `/openlearn-retro` command
3. `/openlearn-status` command
4. `/openlearn-profile` command
5. Learning file generation
6. SQLite schema for learning goals

**Testing**:
- Capture learnings
- Query learnings
- Track topics encountered

### Phase 5: Polish & Distribution (Week 5)

**Goal**: Production-ready skill

**Deliverables**:
1. SKILL.md manifest for opencode
2. README.md with installation instructions
3. Documentation
4. Example projects
5. Tests for framework

---

## Technical Requirements

### Dependencies

- opencode CLI (v2.0+)
- Git (for version tracking)
- Context7 MCP server (optional but recommended)

### Compatibility

- Works with opencode's native skill system
- Respects opencode's permission system
- Compatible with MCP servers (Context7 for documentation)

### Constraints

- All commands use `openlearn-` prefix
- All agents use `-gate` suffix for gates
- Skill-only distribution (opencode plugin)
- Read-only gates (no automatic edits)
- Junior profile fixed for v1.0
- Gates 1 & 2 are BLOCKING with 75% threshold

---

## Success Metrics

### For the Student

- Can explain their code after using OpenLearn
- Passes Gate 1 (ownership) consistently at 75%+
- Uses Context7 to check official docs
- Captures learnings regularly
- Builds projects without AI writing code
- Escapes "tutorial hell" through hands-on building

### For the Framework

- All 12 commands functional
- All 6 gates operational with scoring
- Context7 integration working
- Documentation complete
- Example projects available

---

## Future Enhancements

### v1.1: Additional Profiles
- Career Switcher profile
- Interview Prep profile
- Experienced Developer profile
- Custom profile builder

### v1.2: Advanced Features
- Team/collaboration mode
- Progress dashboard
- Integration with learning platforms
- Advanced Context7 features

### v1.3: Ecosystem
- Plugin system for custom gates
- Community-contributed skills
- Integration with code review tools
- Progress analytics

---

## Appendix

### A. Naming Conventions

**Commands**: `openlearn-[verb]`
- `/openlearn-init`
- `/openlearn-feature`
- `/openlearn-done`

**Agents**: `[purpose]-gate` for gates, `mentor` for primary
- `@ownership-gate`
- `@security-gate`
- `@mentor`

**Files**: `[name].md` for agents/commands, `SKILL.md` for skills
- `mentor.md`
- `openlearn-init.md`
- `SKILL.md`

### B. Color Coding (for UI)

- 🟢 Success/Complete
- 🔴 Blocking issue
- 🟡 Warning/Attention
- 🔵 Information
- ⚪ Neutral

### C. Gate Symbols

- 🔒 Gate 1: Ownership (BLOCKING)
- 🛡️ Gate 2: Security (BLOCKING)
- ⚠️ Gate 3: Errors
- ⚡ Gate 4: Performance
- 📖 Gate 5: Fundamentals
- 🧪 Gate 6: Testing

---

## Document Information

**Version**: 1.0.0-draft  
**Author**: OpenLearn Team  
**Date**: 2026-02-17  
**Status**: Planning Phase  
**Next Step**: Implementation Phase 1
