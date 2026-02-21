# OpenLearn Agents Reference

## Core Agents

### Primary Agent
- **mentor** - Primary teaching agent for OpenLearn - guides juniors through building software while they write all code

### Quality Gates (The 6 Gates)
- **ownership-gate** - Verifies student truly understands code they wrote (75% threshold)
- **security-gate** - Checks for vulnerabilities and security issues (75% threshold)
- **error-gate** - Validates error handling practices
- **performance-gate** - Reviews code performance and scalability
- **fundamentals-gate** - Ensures code quality and best practices
- **testing-gate** - Verifies testing habits and coverage

## Available Commands

### Project Initialization
- `openlearn-init` - Initialize project with global profile support
- `openlearn-task` - Plan task with spec-driven development
- `openlearn-profile` - View/change settings

### Development
- `openlearn-guide` - Get Socratic guidance (Theory Mode)
- `openlearn-stuck` - Debug systematically (Protocol D)
- `openlearn-test` - Testing guidance
- `openlearn-docs` - Documentation help

### Context7 Integration
- `openlearn-setup-context7` - Configure Context7 MCP

### Completion
- `openlearn-done` - Complete with 6 Gates + auto-cleanup

### Learning Tracking
- `openlearn-retro` - Capture learnings
- `openlearn-advise` - Query past learnings
- `openlearn-status` - Check progress

## Command-Agent Relationships

Commands invoke specific agents based on their function:
- `/openlearn-init` - Uses mentor agent for project setup
- `/openlearn-guide` - Uses mentor agent for Socratic guidance
- `/openlearn-done` - Invokes all 6 gate agents for quality checks
- `/openlearn-stuck` - Uses mentor agent with debugging protocols
- `/openlearn-retro` - Uses mentor agent to capture learnings
- `/openlearn-advise` - Queries learning storage via mentor agent
- `/openlearn-status` - Displays stats using mentor agent
- `/openlearn-test` - Invokes testing-gate agent
- `/openlearn-task` - Uses mentor agent for task planning
- `/openlearn-docs` - Uses mentor agent for documentation help
- `/openlearn-profile` - Uses mentor agent to manage settings
- `/openlearn-setup-context7` - Uses mentor agent for Context7 configuration

## Agent Invocation Order (for /openlearn-done)

When completing a task, gates are invoked in this order:
1. 🔒 **ownership-gate** - Student explains their code (blocking)
2. 🛡️ **security-gate** - Security vulnerabilities check (blocking)
3. ⚠️ **error-gate** - Error handling review
4. ⚡ **performance-gate** - Performance analysis
5. 📖 **fundamentals-gate** - Code quality check
6. 🧪 **testing-gate** - Test coverage review

**Note:** Gates 1 & 2 require 75%+ scores to proceed past.
