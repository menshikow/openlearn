/**
 * OpenLearn Data Module
 * Uses JSON file storage for local persistence
 */

export type {
  GateResult,
  JsonStore,
  Learning,
  LearningStats,
  Objective,
  Topic,
} from "./db/types";

export {
  addObjective,
  closeDatabase,
  completeObjective,
  getActiveObjectives,
  getDatabase,
  getGateStats,
  getLearnings,
  getLearningsByTopic,
  getLearningStats,
  getRecentLearnings,
  getRecentTopics,
  getStoragePath,
  getTopics,
  initializeSchema,
  recordGateResult,
  recordTopic,
  saveLearning,
  searchLearnings,
} from "./db/api";

import { initializeSchema } from "./db/api";

if (import.meta.main) {
  initializeSchema();
}
