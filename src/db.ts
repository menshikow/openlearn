/**
 * OpenLearn Data Module
 * Uses JSON file storage for local persistence
 */

import { Database as SQLiteDatabase } from "bun:sqlite";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const DB_VERSION = "1.0.0";
const LOCK_RETRY_MS = 25;
const LOCK_TIMEOUT_MS = 2000;

export interface Topic {
  id?: number;
  name: string;
  first_encountered: string;
  last_encountered: string;
  count: number;
}

export interface Learning {
  id?: number;
  timestamp: string;
  task: string;
  topic?: string;
  what_learned: string;
  mistakes?: string;
  created_at?: string;
}

export interface Objective {
  id?: number;
  objective: string;
  status: "active" | "completed" | "abandoned";
  created_at?: string;
  completed_at?: string;
}

export interface GateResult {
  id?: number;
  timestamp?: string;
  task_name: string;
  gate_name: string;
  score: number;
  passed: boolean;
  feedback?: string;
}

type RequiredTopic = Required<Topic>;
type RequiredLearning = Required<Omit<Learning, "topic" | "mistakes">> &
  Pick<Learning, "topic" | "mistakes">;
type RequiredObjective = Required<Omit<Objective, "completed_at">> &
  Pick<Objective, "completed_at">;
type RequiredGateResult = Required<Omit<GateResult, "feedback">> &
  Pick<GateResult, "feedback">;

interface JsonStore {
  version: string;
  topics: RequiredTopic[];
  learnings: RequiredLearning[];
  objectives: RequiredObjective[];
  gate_results: RequiredGateResult[];
  counters: {
    topics: number;
    learnings: number;
    objectives: number;
    gate_results: number;
  };
}

interface StoragePaths {
  dir: string;
  json: string;
  sqlite: string;
  lockDir: string;
}

let cacheStore: JsonStore | null = null;
let cacheMtimeMs: number | null = null;

function cloneStore(store: JsonStore): JsonStore {
  return JSON.parse(JSON.stringify(store)) as JsonStore;
}

function sleepSync(ms: number): void {
  const shared = new SharedArrayBuffer(4);
  const view = new Int32Array(shared);
  Atomics.wait(view, 0, 0, ms);
}

function createEmptyStore(): JsonStore {
  return {
    version: DB_VERSION,
    topics: [],
    learnings: [],
    objectives: [],
    gate_results: [],
    counters: {
      topics: 0,
      learnings: 0,
      objectives: 0,
      gate_results: 0,
    },
  };
}

function validateNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${fieldName} must be a non-empty string`);
  }
  return value.trim();
}

function validatePositiveInteger(value: unknown, fieldName: string): number {
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    throw new Error(`${fieldName} must be a positive integer`);
  }
  return num;
}

function validateTimestamp(value: unknown, fieldName: string): string {
  if (typeof value !== "string") {
    throw new Error(`${fieldName} must be a string`);
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid ISO timestamp`);
  }
  return value;
}

function validateBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${fieldName} must be a boolean`);
  }
  return value;
}

function validateScore(value: unknown): number {
  const num = Number(value);
  if (!Number.isInteger(num) || num < 0 || num > 100) {
    throw new Error("Score must be an integer between 0 and 100");
  }
  return num;
}

function isValidTimestamp(value: string): boolean {
  return !Number.isNaN(new Date(value).getTime());
}

function findProjectRoot(start: string): string | null {
  let current = path.resolve(start);
  const parsedRoot = path.parse(current).root;

  while (true) {
    const hasPackageJson = fs.existsSync(path.join(current, "package.json"));
    const hasGit = fs.existsSync(path.join(current, ".git"));
    const hasOpenCode = fs.existsSync(path.join(current, ".opencode"));
    if (hasPackageJson && (hasGit || hasOpenCode)) {
      return current;
    }

    if (current === parsedRoot) {
      break;
    }
    current = path.dirname(current);
  }

  return null;
}

function resolveStoragePaths(): StoragePaths {
  const envDir = process.env.OPENLEARN_STORAGE_DIR;
  if (envDir && envDir.trim().length > 0) {
    const resolved = path.resolve(envDir);
    if (resolved === path.parse(resolved).root) {
      throw new Error("OPENLEARN_STORAGE_DIR cannot be a filesystem root");
    }
    return {
      dir: resolved,
      json: path.join(resolved, "openlearn.json"),
      sqlite: path.join(resolved, "openlearn.db"),
      lockDir: path.join(resolved, "openlearn.lock"),
    };
  }

  const cwdRoot = findProjectRoot(process.cwd());
  if (cwdRoot) {
    const dir = path.join(cwdRoot, ".opencode", "openlearn");
    return {
      dir,
      json: path.join(dir, "openlearn.json"),
      sqlite: path.join(dir, "openlearn.db"),
      lockDir: path.join(dir, "openlearn.lock"),
    };
  }

  const moduleDir = path.dirname(fileURLToPath(import.meta.url));
  const moduleRoot = findProjectRoot(moduleDir);
  const baseRoot = moduleRoot || process.cwd();
  const dir = path.join(baseRoot, ".opencode", "openlearn");

  return {
    dir,
    json: path.join(dir, "openlearn.json"),
    sqlite: path.join(dir, "openlearn.db"),
    lockDir: path.join(dir, "openlearn.lock"),
  };
}

function ensureDirectoryExists(paths: StoragePaths): void {
  if (!fs.existsSync(paths.dir)) {
    fs.mkdirSync(paths.dir, { recursive: true, mode: 0o700 });
  }

  try {
    fs.chmodSync(paths.dir, 0o700);
  } catch {
    // Ignore chmod failures on unsupported filesystems.
  }
}

function isStaleLock(paths: StoragePaths): boolean {
  try {
    const stat = fs.statSync(paths.lockDir);
    const ageMs = Date.now() - stat.mtimeMs;
    return ageMs > LOCK_TIMEOUT_MS * 3;
  } catch {
    return false;
  }
}

function acquireLock(paths: StoragePaths): void {
  const startedAt = Date.now();

  while (true) {
    try {
      fs.mkdirSync(paths.lockDir);
      const ownerPath = path.join(paths.lockDir, "owner.json");
      fs.writeFileSync(
        ownerPath,
        JSON.stringify({ pid: process.pid, createdAt: new Date().toISOString() }),
        { encoding: "utf8", mode: 0o600 }
      );
      return;
    } catch (error) {
      if (!(error instanceof Error) || !("code" in error) || error.code !== "EEXIST") {
        throw error;
      }

      if (isStaleLock(paths)) {
        try {
          fs.rmSync(paths.lockDir, { recursive: true, force: true });
          continue;
        } catch {
          // If stale-lock cleanup fails, continue retry loop.
        }
      }

      if (Date.now() - startedAt >= LOCK_TIMEOUT_MS) {
        throw new Error("Timed out waiting for storage lock");
      }

      sleepSync(LOCK_RETRY_MS);
    }
  }
}

function releaseLock(paths: StoragePaths): void {
  try {
    fs.rmSync(paths.lockDir, { recursive: true, force: true });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

function writeStore(paths: StoragePaths, store: JsonStore): void {
  ensureDirectoryExists(paths);
  const tempPath = `${paths.json}.tmp`;
  const fd = fs.openSync(tempPath, "w", 0o600);
  try {
    fs.writeFileSync(fd, JSON.stringify(store), "utf8");
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.renameSync(tempPath, paths.json);
}

function toRequiredTopic(entry: unknown): RequiredTopic | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const raw = entry as Partial<RequiredTopic>;
  const id = raw.id;
  const name = raw.name;
  const firstEncountered = raw.first_encountered;
  const lastEncountered = raw.last_encountered;
  const count = raw.count;

  if (
    typeof id !== "number" ||
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof name !== "string" ||
    typeof firstEncountered !== "string" ||
    typeof lastEncountered !== "string" ||
    typeof count !== "number" ||
    !Number.isInteger(count) ||
    count <= 0 ||
    !isValidTimestamp(firstEncountered) ||
    !isValidTimestamp(lastEncountered)
  ) {
    return null;
  }

  const safeId = id as number;
  const safeCount = count as number;

  return {
    id: safeId,
    name,
    first_encountered: firstEncountered,
    last_encountered: lastEncountered,
    count: safeCount,
  };
}

function toRequiredLearning(entry: unknown): RequiredLearning | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const raw = entry as Partial<RequiredLearning>;
  const id = raw.id;
  const timestamp = raw.timestamp;
  const task = raw.task;
  const whatLearned = raw.what_learned;
  const createdAt = raw.created_at;

  if (
    typeof id !== "number" ||
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof timestamp !== "string" ||
    typeof task !== "string" ||
    typeof whatLearned !== "string" ||
    typeof createdAt !== "string" ||
    !isValidTimestamp(timestamp) ||
    !isValidTimestamp(createdAt)
  ) {
    return null;
  }

  const safeId = id as number;

  return {
    id: safeId,
    timestamp,
    task,
    topic: typeof raw.topic === "string" ? raw.topic : undefined,
    what_learned: whatLearned,
    mistakes: typeof raw.mistakes === "string" ? raw.mistakes : undefined,
    created_at: createdAt,
  };
}

function toRequiredObjective(entry: unknown): RequiredObjective | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const raw = entry as Partial<RequiredObjective>;
  const id = raw.id;
  const objective = raw.objective;
  const createdAt = raw.created_at;
  const status = raw.status;
  const validStatus = status === "active" || status === "completed" || status === "abandoned";
  if (
    typeof id !== "number" ||
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof objective !== "string" ||
    typeof createdAt !== "string" ||
    !isValidTimestamp(createdAt) ||
    !validStatus
  ) {
    return null;
  }

  const safeId = id as number;

  return {
    id: safeId,
    objective,
    status: status as "active" | "completed" | "abandoned",
    created_at: createdAt,
    completed_at: typeof raw.completed_at === "string" ? raw.completed_at : undefined,
  };
}

function toRequiredGateResult(entry: unknown): RequiredGateResult | null {
  if (!entry || typeof entry !== "object") {
    return null;
  }

  const raw = entry as Partial<RequiredGateResult>;
  const id = raw.id;
  const timestamp = raw.timestamp;
  const taskName = raw.task_name;
  const gateName = raw.gate_name;
  const score = raw.score;
  const passed = raw.passed;

  if (
    typeof id !== "number" ||
    !Number.isInteger(id) ||
    id <= 0 ||
    typeof timestamp !== "string" ||
    typeof taskName !== "string" ||
    typeof gateName !== "string" ||
    typeof score !== "number" ||
    !Number.isInteger(score) ||
    score < 0 ||
    score > 100 ||
    typeof passed !== "boolean"
  ) {
    return null;
  }

  const safeId = id as number;
  const safeScore = score as number;

  return {
    id: safeId,
    timestamp,
    task_name: taskName,
    gate_name: gateName,
    score: safeScore,
    passed,
    feedback: typeof raw.feedback === "string" ? raw.feedback : undefined,
  };
}

function normalizeStore(parsed: unknown): JsonStore {
  const base = createEmptyStore();
  if (!parsed || typeof parsed !== "object") {
    return base;
  }

  const raw = parsed as Partial<JsonStore>;

  const topics = Array.isArray(raw.topics)
    ? raw.topics.map(toRequiredTopic).filter((entry): entry is RequiredTopic => entry !== null)
    : [];
  const learnings = Array.isArray(raw.learnings)
    ? raw.learnings
        .map(toRequiredLearning)
        .filter((entry): entry is RequiredLearning => entry !== null)
    : [];
  const objectives = Array.isArray(raw.objectives)
    ? raw.objectives
        .map(toRequiredObjective)
        .filter((entry): entry is RequiredObjective => entry !== null)
    : [];
  const gateResults = Array.isArray(raw.gate_results)
    ? raw.gate_results
        .map(toRequiredGateResult)
        .filter((entry): entry is RequiredGateResult => entry !== null)
    : [];

  const inferredCounters = {
    topics: topics.reduce((max, current) => Math.max(max, current.id), 0),
    learnings: learnings.reduce((max, current) => Math.max(max, current.id), 0),
    objectives: objectives.reduce((max, current) => Math.max(max, current.id), 0),
    gate_results: gateResults.reduce((max, current) => Math.max(max, current.id), 0),
  };

  return {
    version: typeof raw.version === "string" ? raw.version : DB_VERSION,
    topics,
    learnings,
    objectives,
    gate_results: gateResults,
    counters: {
      topics: Math.max(raw.counters?.topics || 0, inferredCounters.topics),
      learnings: Math.max(raw.counters?.learnings || 0, inferredCounters.learnings),
      objectives: Math.max(raw.counters?.objectives || 0, inferredCounters.objectives),
      gate_results: Math.max(raw.counters?.gate_results || 0, inferredCounters.gate_results),
    },
  };
}

function migrateFromSQLite(paths: StoragePaths): JsonStore | null {
  if (!fs.existsSync(paths.sqlite) || fs.existsSync(paths.json)) {
    return null;
  }

  let sqliteDb: SQLiteDatabase | null = null;

  try {
    sqliteDb = new SQLiteDatabase(paths.sqlite, { readonly: true });

    const topics = sqliteDb
      .query<RequiredTopic, []>(
        "SELECT id, name, first_encountered, last_encountered, count FROM topics"
      )
      .all();

    const learnings = sqliteDb
      .query<RequiredLearning, []>(
        "SELECT id, timestamp, task, topic, what_learned, mistakes, created_at FROM learnings"
      )
      .all();

    const objectives = sqliteDb
      .query<RequiredObjective, []>(
        "SELECT id, objective, status, created_at, completed_at FROM objectives"
      )
      .all();

    const gateResults = sqliteDb
      .query<RequiredGateResult, []>(
        "SELECT id, timestamp, task_name, gate_name, score, passed, feedback FROM gate_results"
      )
      .all()
      .map((entry) => ({ ...entry, passed: Boolean(entry.passed) }));

    const migrated: JsonStore = {
      version: DB_VERSION,
      topics,
      learnings,
      objectives,
      gate_results: gateResults,
      counters: {
        topics: topics.reduce((max, current) => Math.max(max, current.id), 0),
        learnings: learnings.reduce((max, current) => Math.max(max, current.id), 0),
        objectives: objectives.reduce((max, current) => Math.max(max, current.id), 0),
        gate_results: gateResults.reduce((max, current) => Math.max(max, current.id), 0),
      },
    };

    writeStore(paths, migrated);
    return migrated;
  } catch (error) {
    throw new Error(
      `Failed SQLite to JSON migration: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  } finally {
    if (sqliteDb) {
      sqliteDb.close();
    }
  }
}

function loadStoreFromDisk(paths: StoragePaths, forceReload: boolean = false): JsonStore {
  ensureDirectoryExists(paths);

  if (!forceReload && cacheStore && fs.existsSync(paths.json)) {
    const currentMtime = fs.statSync(paths.json).mtimeMs;
    if (cacheMtimeMs !== null && currentMtime === cacheMtimeMs) {
      return cloneStore(cacheStore);
    }
  }

  const migrated = migrateFromSQLite(paths);
  if (migrated) {
    cacheStore = cloneStore(migrated);
    cacheMtimeMs = fs.statSync(paths.json).mtimeMs;
    return migrated;
  }

  if (!fs.existsSync(paths.json)) {
    const empty = createEmptyStore();
    writeStore(paths, empty);
    cacheStore = cloneStore(empty);
    cacheMtimeMs = fs.statSync(paths.json).mtimeMs;
    return empty;
  }

  try {
    const raw = fs.readFileSync(paths.json, "utf8");
    const normalized = normalizeStore(JSON.parse(raw));
    cacheStore = cloneStore(normalized);
    cacheMtimeMs = fs.statSync(paths.json).mtimeMs;
    return normalized;
  } catch (error) {
    throw new Error(
      `Failed to read JSON storage: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function withWrite<T>(writer: (store: JsonStore) => T): T {
  const paths = resolveStoragePaths();
  ensureDirectoryExists(paths);
  acquireLock(paths);

  let primaryError: unknown = null;
  try {
    const store = loadStoreFromDisk(paths, true);
    const result = writer(store);
    writeStore(paths, store);
    cacheStore = cloneStore(store);
    cacheMtimeMs = fs.statSync(paths.json).mtimeMs;
    return result;
  } catch (error) {
    primaryError = error;
    throw error;
  } finally {
    try {
      releaseLock(paths);
    } catch (releaseError) {
      if (!primaryError) {
        throw releaseError;
      }
      console.error("Failed to release storage lock:", releaseError);
    }
  }
}

export function getStoragePath(): string {
  return resolveStoragePaths().json;
}

export function getDatabase(): JsonStore {
  const store = loadStoreFromDisk(resolveStoragePaths());
  return cloneStore(store);
}

export function closeDatabase(): void {
  cacheStore = null;
  cacheMtimeMs = null;
}

export function initializeSchema(): void {
  withWrite((store) => {
    if (!store.version) {
      store.version = DB_VERSION;
    }
  });
}

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

export interface LearningStats {
  totalLearnings: number;
  totalTopics: number;
  recentLearnings: number;
  activeObjectives: number;
  topTopics: { name: string; count: number }[];
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

if (import.meta.main) {
  initializeSchema();
}
