import {
  type GateResult,
  type JsonStore,
  type Learning,
  type LearningStats,
  type Objective,
  type RequiredLearning,
  type Topic,
} from "./types";
import {
  validateBoolean,
  validateNonEmptyString,
  validatePositiveInteger,
  validateScore,
  validateTimestamp,
} from "./validators";
import {
  closeDatabase,
  getDatabaseSnapshot,
  getStoragePath,
  initializeSchema,
  withWrite,
} from "./storage";

function upsertTopic(store: JsonStore, topicName: string, encounteredAt: string): void {
  const normalized = topicName.toLowerCase();
  const existing = store.topics.find((item) => item.name === normalized);
  if (existing) {
    existing.count += 1;
    existing.last_encountered = encounteredAt;
    return;
  }

  store.counters.topics += 1;
  store.topics.push({
    id: store.counters.topics,
    name: normalized,
    first_encountered: encounteredAt,
    last_encountered: encounteredAt,
    count: 1,
  });
}

export { closeDatabase, getStoragePath, initializeSchema };

export function getDatabase(): JsonStore {
  return getDatabaseSnapshot();
}

export function recordTopic(name: string): void {
  const validatedName = validateNonEmptyString(name, "Topic name").toLowerCase();

  withWrite((store) => {
    const now = new Date().toISOString();
    upsertTopic(store, validatedName, now);
  });
}

export function getTopics(): Topic[] {
  const db = getDatabase();
  return [...db.topics].sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return b.last_encountered.localeCompare(a.last_encountered);
  });
}

export function getRecentTopics(days: number = 30): Topic[] {
  const validatedDays = validatePositiveInteger(days, "Days");
  const db = getDatabase();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - validatedDays);

  return db.topics
    .filter((topic) => new Date(topic.last_encountered).getTime() > cutoff.getTime())
    .sort((a, b) => b.last_encountered.localeCompare(a.last_encountered));
}

export function saveLearning(learning: Omit<Learning, "id" | "created_at">): number {
  const task = validateNonEmptyString(learning.task, "Task");
  const whatLearned = validateNonEmptyString(learning.what_learned, "What learned");
  const timestamp = validateTimestamp(learning.timestamp, "Timestamp");

  const topic = learning.topic ? validateNonEmptyString(learning.topic, "Topic") : undefined;
  const mistakes = learning.mistakes
    ? validateNonEmptyString(learning.mistakes, "Mistakes")
    : undefined;

  return withWrite((store) => {
    store.counters.learnings += 1;
    const entry: RequiredLearning = {
      id: store.counters.learnings,
      timestamp,
      task,
      topic,
      what_learned: whatLearned,
      mistakes,
      created_at: new Date().toISOString(),
    };

    store.learnings.push(entry);

    if (topic) {
      upsertTopic(store, topic, new Date().toISOString());
    }

    return entry.id;
  });
}

export function getLearnings(limit: number = 100): Learning[] {
  const validatedLimit = validatePositiveInteger(limit, "Limit");
  const db = getDatabase();

  return [...db.learnings]
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
    .slice(0, validatedLimit);
}

export function searchLearnings(query: string): Learning[] {
  const validatedQuery = validateNonEmptyString(query, "Search query").toLowerCase();
  const db = getDatabase();

  return [...db.learnings]
    .filter((learning) => {
      const topic = learning.topic?.toLowerCase() || "";
      return (
        topic.includes(validatedQuery) ||
        learning.task.toLowerCase().includes(validatedQuery) ||
        learning.what_learned.toLowerCase().includes(validatedQuery)
      );
    })
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getLearningsByTopic(topic: string): Learning[] {
  const validatedTopic = validateNonEmptyString(topic, "Topic").toLowerCase();
  const db = getDatabase();

  return db.learnings
    .filter((learning) => (learning.topic || "").toLowerCase() === validatedTopic)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getRecentLearnings(days: number = 30): Learning[] {
  const validatedDays = validatePositiveInteger(days, "Days");
  const db = getDatabase();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - validatedDays);

  return db.learnings
    .filter((learning) => new Date(learning.timestamp).getTime() > cutoff.getTime())
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function addObjective(objective: string): number {
  const validatedObjective = validateNonEmptyString(objective, "Objective");

  return withWrite((store) => {
    store.counters.objectives += 1;
    const objectiveId = store.counters.objectives;

    store.objectives.push({
      id: objectiveId,
      objective: validatedObjective,
      status: "active",
      created_at: new Date().toISOString(),
      completed_at: undefined,
    });

    return objectiveId;
  });
}

export function getActiveObjectives(): Objective[] {
  const db = getDatabase();

  return db.objectives
    .filter((objective) => objective.status === "active")
    .sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

export function completeObjective(id: number): void {
  const validatedId = validatePositiveInteger(id, "Objective ID");

  withWrite((store) => {
    const objective = store.objectives.find((entry) => entry.id === validatedId);
    if (!objective) {
      throw new Error(`Objective with ID ${validatedId} was not found`);
    }

    objective.status = "completed";
    objective.completed_at = new Date().toISOString();
  });
}

export function getLearningStats(): LearningStats {
  const db = getDatabase();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const topTopics = [...db.topics]
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((topic) => ({ name: topic.name, count: topic.count }));

  return {
    totalLearnings: db.learnings.length,
    totalTopics: db.topics.length,
    recentLearnings: db.learnings.filter(
      (learning) => new Date(learning.timestamp).getTime() > thirtyDaysAgo.getTime()
    ).length,
    activeObjectives: db.objectives.filter((objective) => objective.status === "active").length,
    topTopics,
  };
}

export function recordGateResult(result: Omit<GateResult, "id" | "timestamp">): void {
  const taskName = validateNonEmptyString(result.task_name, "Task name");
  const gateName = validateNonEmptyString(result.gate_name, "Gate name");
  const score = validateScore(result.score);
  const passed = validateBoolean(result.passed, "Passed");
  const feedback = result.feedback
    ? validateNonEmptyString(result.feedback, "Feedback")
    : undefined;

  withWrite((store) => {
    store.counters.gate_results += 1;
    store.gate_results.push({
      id: store.counters.gate_results,
      timestamp: new Date().toISOString(),
      task_name: taskName,
      gate_name: gateName,
      score,
      passed,
      feedback,
    });
  });
}

export function getGateStats(): {
  totalGates: number;
  passedGates: number;
  averageScore: number;
} {
  const db = getDatabase();
  const totalGates = db.gate_results.length;
  const passedGates = db.gate_results.filter((gate) => gate.passed).length;

  if (totalGates === 0) {
    return {
      totalGates: 0,
      passedGates: 0,
      averageScore: 0,
    };
  }

  const totalScore = db.gate_results.reduce((sum, gate) => sum + gate.score, 0);
  return {
    totalGates,
    passedGates,
    averageScore: Math.round(totalScore / totalGates),
  };
}
