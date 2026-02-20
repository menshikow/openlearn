---
description: Capture what was learned and save to JSON and markdown
agent: mentor
---

# /openlearn-retro


## Important: Theory Mode

This command provides information and guidance. I will:
- Answer questions and provide explanations
- Show max 5-line examples if relevant
- **NEVER** create files or modify your code without permission

Capture learnings from a completed task and store them for future reference.

## Flow

1. **Ask what they learned**
   - What concept did you understand better?
   - What technique did you master?
   - What was the key insight?

2. **Ask what was challenging**
   - What was confusing at first?
   - What mistake did you make?
   - What would you do differently?

3. **Generate learning file**
   - Create timestamped markdown file
   - Save to `.opencode/openlearn/learnings/`
   - Format: `YYYY-MM-DD-[slug].md`

4. **Save to JSON storage**
   - Store in `openlearn.json` for querying
   - Update topics collection
   - Link related learnings

5. **Update topics encountered**
   - Add new technologies/concepts to config
   - Increment encounter count

## Storage Schema

The learning is saved under the `learnings` array:
```json
{
  "id": 12,
  "timestamp": "2026-02-17T10:00:00.000Z",
  "task": "Todo App - State Management",
  "topic": "React Hooks",
  "what_learned": "State should be lifted to the common parent",
  "mistakes": "Tried to keep duplicate state in child components"
}
```

Topics are updated in the `topics` array using normalized names and incremented counts.

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

[Generating learning file and saving to JSON storage...]

✅ Learning captured!
Saved to: learnings/2026-02-17-todo-app-usestate.md
Saved to storage: openlearn.json

Updated topics: React hooks, State management
Learning #12 recorded successfully
```

## Markdown Template

```markdown
---
date: 2026-02-17
topic: React Hooks
task: Todo App - State Management
---

# Learning: useState and Lifting State Up

## What I Learned

Understanding useState and when to lift state up to parent components.

## Key Insight

State should live in the common parent of all components that need it.
Don't duplicate state in child components.

## Mistakes Made

- Tried to put state in each TodoItem
- Didn't realize state should be lifted up

## Advice for Future Self

Before adding state, ask: "Which component owns this data?"
If multiple components need it, lift it up.

## Related Topics

- React hooks
- State management
- Component composition
```

## Implementation Notes

Use the storage module:
```typescript
import { saveLearning, recordTopic } from "./src/db.ts";

// Save learning to JSON storage
const learningId = saveLearning({
  timestamp: new Date().toISOString(),
  task: "Todo App - State Management",
  topic: "React Hooks",
  what_learned: "State should be lifted to common parent...",
  mistakes: "Tried to put state in each TodoItem"
});

// Record topics encountered
recordTopic("React Hooks");
recordTopic("State Management");
```
