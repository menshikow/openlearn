---
description: Query past learnings from JSON storage before starting
agent: mentor
---

# /openlearn-advise


## Important: Theory Mode

This command provides information and guidance. I will:
- Answer questions and provide explanations
- Show max 5-line examples if relevant
- **NEVER** create files or modify your code without permission

Get advice based on past learnings before starting a task.

## Flow

1. **Read past learnings from JSON storage**
   - Read `.opencode/openlearn/openlearn.json`
   - Parse `learnings` array
   - Search for relevant topics

2. **Identify relevant learnings**
   - Match current context with past topics
   - Find related mistakes and insights
   - Sort by relevance and recency

3. **Present advice**
   - Show: "When you worked on [similar task], you learned..."
   - Quote the key insight
   - Ask: "How might this apply here?"

## Storage Queries

### Search by topic:
```typescript
const byTopic = store.learnings
  .filter((entry: any) => (entry.topic || "").toLowerCase() === topic.toLowerCase())
  .sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp))
  .slice(0, 5);
```

### Search by keyword:
```typescript
const byKeyword = store.learnings
  .filter((entry: any) =>
    entry.task.toLowerCase().includes(keyword) ||
    entry.what_learned.toLowerCase().includes(keyword)
  )
  .sort((a: any, b: any) => b.timestamp.localeCompare(a.timestamp));
```

### Get top topics:
```typescript
const topTopics = [...store.topics]
  .sort((a: any, b: any) => b.count - a.count)
  .slice(0, 10);
```

## Example Session

```
Student: /openlearn-advise

OpenLearn: What are you about to work on?
Student: Adding a form to edit todos

OpenLearn: [Reading storage for relevant learnings...]

💡 Based on your past learnings:

When you built the todo app (2026-02-17), you learned:
> "Lift state to the common parent component. 
> Don't duplicate state in child components."

You also learned about form handling:
> "Controlled components need value + onChange handler."

How might these apply to your edit form feature?

Student: I should probably put the form state in the parent
instead of the form component?

OpenLearn: Exactly! That's the pattern you discovered before.
Also, remember to handle the controlled input pattern.

💡 Related learnings found: 2
💡 Topics to review: React forms, State management
```

## Implementation Notes

Use the database module:
```typescript
import { searchLearnings, getLearningsByTopic, getTopics } from "./src/db.ts";

// Search for relevant learnings
const keyword = "forms";
const relevantLearnings = searchLearnings(keyword);

// Get learnings by specific topic
const topicLearnings = getLearningsByTopic("React Hooks");

// Show frequently encountered topics
const topTopics = getTopics().slice(0, 5);
```

## No Learnings Yet?

If storage is empty:
```
OpenLearn: No previous learnings found in your storage yet.

That's normal when starting out! After you complete a few tasks,
use /openlearn-retro to capture what you've learned.

Then /openlearn-advise will help you recall and apply those insights.
```
