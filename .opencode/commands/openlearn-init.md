---
description: Initialize OpenLearn project with mission, stack, and roadmap
agent: mentor
subtask: false
---

# /openlearn-init

Initialize a new OpenLearn project with profile setup, project definition, and configuration.

## Important: Student Writes All Code

This command will ask questions and generate configuration files. Before creating any files:
1. I will explain what files will be created
2. You must explicitly confirm you want me to create them
3. You can choose to create them yourself instead

Maximum 5 lines of example code at a time. Never write production code for you.

## Flow

1. **Check if already initialized**
   - Read `.opencode/openlearn/config.json`
   - If exists, ask if they want to reinitialize

2. **Check for global profile**
   - Check `~/.config/openlearn/profile.json` (Linux) or `~/Library/Application Support/openlearn/profile.json` (macOS)
   - If exists:
     - Ask: "Use global profile? [Y/n]"
     - If yes → Copy global settings, skip profile questions
     - If no → Continue with full profile setup
   - If no global profile:
     - Ask: "Create global profile for future projects? [y/N]"
     - If yes → Store profile globally

3. **Profile setup** (if not using global)
   - Ask: "What's your coding background?"
     - Options: "Know basics (variables, functions, loops)", "Built a few projects"
   - Ask: "Do you like analogies when learning?"
     - Options: Yes/No

4. **Mode selection**
   - Ask: "What mode should I use?"
     - **Theory Mode**: I explain concepts, you write all code (recommended for learning)
     - **Build Mode**: I guide implementation with minimal examples
   - Store in config: `"mode": "theory" | "build"`

5. **Project questions**
   - Ask: "What problem are you solving?" (free text, single input; no placeholder options)
   - Ask: "Who is this for?"
      - Options: Myself learning, Portfolio project, Real users
   - Ask: "How will you know it's done?"
      - Free text, single input; no duplicate "type your answer" options
      - List 2-3 specific, measurable criteria

### Question UI rules

- For free-text questions, provide one text-entry path only.
- Do not add option labels like "Type your answer" when custom input is already available.
- For strict choice questions, disable custom input so only listed choices are shown.

6. **Stack detection**
   - Check for existing files:
     - `package.json` → Node.js project
     - `Cargo.toml` → Rust project
     - `requirements.txt` → Python project
     - `go.mod` → Go project
     - Other typical files...
   - If no existing project detected:
     - Ask: "What stack do you want to use?"
     - Examples: React, Vue, Svelte, Vanilla JS, Python/Flask, etc.

7. **Context7 configuration & MCP setup**
   - Check if Context7 MCP server is configured:
     - Check `~/.config/opencode/mcp.json` (Linux)
     - Check `~/Library/Application Support/opencode/mcp.json` (macOS)
   - If not configured:
     - Explain: "Context7 provides official documentation lookups"
     - Ask: "Setup Context7 MCP?"
       - [1] Auto-configure (add to opencode MCP config)
       - [2] Show manual setup instructions
       - [3] Skip for now
     - If auto-configure:
       - Detect opencode config location
       - Add Context7 MCP server entry
       - Restart opencode if needed
   - Ask: "How should I use documentation?"
     - Auto: Automatically check official docs
     - Suggest: Ask before checking docs
     - Manual: Only check when you ask

8. **File creation confirmation**
   - Show list of files to be created:
     - `.opencode/openlearn/config.json`
     - `.opencode/openlearn/product/mission.md`
     - `.opencode/openlearn/product/stack.md`
     - `.opencode/openlearn/product/roadmap.md`
     - `.opencode/openlearn/AGENTS.md` (moved from root)
     - `.opencode/openlearn/PROJECT.md` (moved from root)
   - Ask: "Create these files? [Y/n]"
   - If no: Explain how to create manually, provide templates

9. **Generate outputs** (with permission)
   - Only proceed if student confirms
   - Create all configuration files
   - If `auto_cleanup_temp_files: true`, skip creating root copies

10. **Confirm success**
    - Show summary of what was created
    - Next step: `/openlearn-task`

## Example Session

```
Student: /openlearn-init

OpenLearn: Let's set up your OpenLearn project! I'll ask a few questions...

OpenLearn: Checking for global profile...
Found global profile. Use it for this project? [Y/n]
Student: Y

OpenLearn: What problem are you solving?
Student: I want to build a todo app to track my daily tasks

OpenLearn: Who is this for?
Student: Portfolio project

OpenLearn: How will you know it's done?
Student: Can add tasks, mark complete, delete tasks, persist data

OpenLearn: I see you have a package.json. Using React/Vite setup. Correct?
Student: Yes

OpenLearn: Checking Context7 MCP configuration...
Context7 not configured. Setup now?
[1] Auto-configure  [2] Show instructions  [3] Skip
Student: 1

OpenLearn: Configuring Context7 MCP server...
✅ Context7 configured

OpenLearn: I'll create the following files:
- .opencode/openlearn/config.json
- .opencode/openlearn/product/mission.md
- .opencode/openlearn/product/stack.md
- .opencode/openlearn/product/roadmap.md

Create these files? [Y/n]
Student: Y

[Creating files...]

✅ OpenLearn initialized!

Created:
- config.json
- mission.md  
- stack.md
- roadmap.md

Next: /openlearn-task to plan your first task
```
