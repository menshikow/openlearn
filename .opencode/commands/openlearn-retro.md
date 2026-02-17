---
description: Capture what was learned
agent: mentor
---

# /openlearn-retro

Capture learnings from a completed task.

## Flow

1. **Ask what they learned**
   - What concept did you understand better?
   - What technique did you master?

2. **Ask what was challenging**
   - What was confusing at first?
   - What mistake did you make?

3. **Generate learning file**
   - Create timestamped markdown file
   - Save to `.opencode/openlearn/learnings/`

4. **Update topics encountered**
   - Add new technologies/concepts to config

## Example Session

```
Student: /openlearn-retro

OpenLearn: What did you learn from building the todo app?
Student: I finally understand useState and lifting state up

OpenLearn: What was challenging?
Student: Figuring out where to put the state was confusing

OpenLearn: What mistake did you make?
Student: I tried to put state in each TodoItem at first

OpenLearn: What would you tell your past self?
Student: Think about which component owns the data before adding state

[Generating learning file...]

✅ Learning captured!
Saved to: learnings/2026-02-17-todo-app-usestate.md

Updated topics: React hooks, State management
```
