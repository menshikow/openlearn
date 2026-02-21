import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";
import {
  type JsonStore,
  type RequiredGateResult,
  type RequiredLearning,
  type RequiredObjective,
  type RequiredTopic,
} from "./types";
import { isValidTimestamp } from "./validators";

const DB_VERSION = "1.0.0";
const LOCK_RETRY_MS = 25;
const LOCK_TIMEOUT_MS = 2000;

interface StoragePaths {
  dir: string;
  json: string;
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
      lockDir: path.join(resolved, "openlearn.lock"),
    };
  }

  const cwdRoot = findProjectRoot(process.cwd());
  if (cwdRoot) {
    const dir = path.join(cwdRoot, ".opencode", "openlearn");
    return {
      dir,
      json: path.join(dir, "openlearn.json"),
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

  return {
    id,
    name,
    first_encountered: firstEncountered,
    last_encountered: lastEncountered,
    count,
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

  return {
    id,
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

  return {
    id,
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

  return {
    id,
    timestamp,
    task_name: taskName,
    gate_name: gateName,
    score,
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

function loadStoreFromDisk(paths: StoragePaths, forceReload: boolean = false): JsonStore {
  ensureDirectoryExists(paths);

  if (!forceReload && cacheStore && fs.existsSync(paths.json)) {
    const currentMtime = fs.statSync(paths.json).mtimeMs;
    if (cacheMtimeMs !== null && currentMtime === cacheMtimeMs) {
      return cloneStore(cacheStore);
    }
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

export function withWrite<T>(writer: (store: JsonStore) => T): T {
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

export function getDatabaseSnapshot(): JsonStore {
  const store = loadStoreFromDisk(resolveStoragePaths());
  return cloneStore(store);
}

export function getStoragePath(): string {
  return resolveStoragePaths().json;
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
