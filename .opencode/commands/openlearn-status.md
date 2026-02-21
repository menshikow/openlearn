---
description: Check progress from JSON storage
agent: mentor
---

# /openlearn-status


## Important: Theory Mode

This command provides information and guidance. I will:
- Answer questions and provide explanations
- Show max 5-line examples if relevant
- **NEVER** create files or modify your code without permission

Check project progress and stats from JSON storage.

## Flow

1. **Read config and roadmap**
   - Read `.opencode/openlearn/config.json`
   - Read `.opencode/openlearn/product/roadmap.md`

2. **Read JSON storage for stats**
   - Total learnings captured
   - Topics encountered
   - Recent activity (30 days)
   - Active objectives
   - Gate scores

3. **Calculate progress**
   - Tasks completed / total
   - Gates passed statistics
   - Learning journey metrics

4. **Show progress dashboard**
   - Visual progress bars
   - Phase progress
   - Current tasks
   - Learning statistics

## Storage Queries

### Get learning stats:
```typescript
import { getLearningStats, getGateStats, getTopics } from "./src/db.ts";

const stats = getLearningStats();
// Returns: { totalLearnings, totalTopics, recentLearnings, 
//            activeObjectives, topTopics }

const gateStats = getGateStats();
// Returns: { totalGates, passedGates, averageScore }

const topics = getTopics();
// Returns: Array of topics with encounter counts
```

### JSON equivalents:
```typescript
import { readFileSync } from "fs";

const raw = readFileSync(".opencode/openlearn/openlearn.json", "utf8");
const store = JSON.parse(raw);

const totalLearnings = store.learnings.length;
const totalTopics = store.topics.length;
const activeObjectives = store.objectives.filter((o: any) => o.status === "active").length;
```

## Example Output

```
📊 OpenLearn Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎯 Project: Todo App
📍 Current Phase: Phase 1 - Foundation

Phase Progress:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Phase 1: Foundation        ████████░░ 80% (4/5 tasks)
Phase 2: Core Features     ░░░░░░░░░░  0% (0/3 tasks)
Phase 3: Polish            ░░░░░░░░░░  0% (0/2 tasks)

📚 Learning Journey:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Topics encountered: 12
Top topics:
  • React hooks (5x)
  • State management (3x)
  • CSS Grid (2x)

Learnings captured: 8
Recent (30 days): 3

Active objectives: 2

🏆 Gate Statistics:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total gates run: 16
Passed: 14 (88%)
Average score: 82/100

📝 Current Tasks:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[x] Set up project
[x] Create TodoItem component
[x] Create TodoList component
[x] Add task functionality
[ ] Persist to localStorage

Next: Complete localStorage persistence

💾 Data Storage:
JSON Store: .opencode/openlearn/openlearn.json
Learnings: .opencode/openlearn/learnings/
```

## Implementation Notes

Visual progress bars can be simple ASCII:
```typescript
function renderProgressBar(percent: number, width: number = 20): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

// Usage
const progress = renderProgressBar(80);
console.log(`Phase 1: ${progress} 80%`);
// Output: Phase 1: ████████████████░░░░ 80%
```

Color output:
- Green: Success/completed
- Yellow: In progress/warning
- Red: Failed/blocking
- Blue: Information
