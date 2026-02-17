---
description: Check progress
agent: mentor
---

# /openlearn-status

Check project progress and stats.

## Flow

1. **Read config and roadmap**
   - Read `.opencode/openlearn/config.json`
   - Read `.opencode/openlearn/product/roadmap.md`
   - Read `.opencode/openlearn/learnings/` directory

2. **Calculate progress stats**
   - Tasks completed / total
   - Gates passed
   - Learnings captured
   - Topics encountered

3. **Show progress dashboard**
   - Phase progress
   - Current tasks
   - Learning journey

## Example Output

```
📊 OpenLearn Status

🎯 Project: Todo App
📍 Current Phase: Phase 1 - Foundation

Phase Progress:
Phase 1: Foundation        ████████░░ 80% (4/5 tasks)
Phase 2: Core Features     ░░░░░░░░░░ 0% (0/3 tasks)
Phase 3: Polish            ░░░░░░░░░░ 0% (0/2 tasks)

📚 Learning Journey:
Topics encountered: React, useState, Props
Learnings captured: 2

🏆 Stats:
Tasks completed: 4
Gates passed: 4

📝 Current Tasks:
- [x] Set up project
- [x] Create TodoItem component
- [x] Create TodoList component
- [x] Add task functionality
- [ ] Persist to localStorage

Next: Complete localStorage persistence
```
