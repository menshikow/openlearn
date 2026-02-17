---
description: Query past learnings before starting
agent: mentor
---

# /openlearn-advise

Get advice based on past learnings before starting a task.

## Flow

1. **Read past learnings**
   - Read `.opencode/openlearn/learnings/` directory
   - Parse all learning files

2. **Identify relevant learnings**
   - Match current context with past topics
   - Find related mistakes and insights

3. **Present advice**
   - Show: "When you worked on [similar task], you learned..."
   - Ask: "How might this apply here?"

## Example Session

```
Student: /openlearn-advise

OpenLearn: You're about to work on state management.

💡 Based on your past learnings:

When you built the todo app (2026-02-17), you learned:
> "Lift state to the common parent component. 
> Don't duplicate state in child components."

How might this apply to your current feature?

Student: I should probably put the form state in the parent
instead of the form component?

OpenLearn: Exactly! That's the pattern you discovered before.
```
