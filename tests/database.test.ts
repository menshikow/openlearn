import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { Database as SQLiteDatabase } from "bun:sqlite";
import * as fs from "fs";
import * as path from "path";
import {
  getStoragePath,
  closeDatabase,
  initializeSchema,
  recordTopic,
  getTopics,
  saveLearning,
  getLearnings,
  searchLearnings,
  getLearningsByTopic,
  getRecentTopics,
  getRecentLearnings,
  addObjective,
  getActiveObjectives,
  completeObjective,
  getLearningStats,
  recordGateResult,
  getGateStats,
} from "../src/db";

describe("JSON Storage Operations", () => {
  function prepareIsolatedStorage(): string {
    const unique = `openlearn-test-${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const dir = path.join(process.cwd(), ".tmp", unique);
    fs.mkdirSync(dir, { recursive: true });
    process.env.OPENLEARN_STORAGE_DIR = dir;
    return dir;
  }

  beforeEach(() => {
    const dir = prepareIsolatedStorage();
    closeDatabase();
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true });
    }
    fs.mkdirSync(dir, { recursive: true });
    initializeSchema();
  });

  afterEach(() => {
    const dir = process.env.OPENLEARN_STORAGE_DIR;
    closeDatabase();
    if (dir && fs.existsSync(dir)) {
      const expectedPrefix = path.resolve(process.cwd(), ".tmp") + path.sep;
      const resolvedDir = path.resolve(dir);
      if (!resolvedDir.startsWith(expectedPrefix)) {
        throw new Error(`Refusing to delete unexpected storage dir: ${resolvedDir}`);
      }
      fs.rmSync(dir, { recursive: true, force: true });
    }
    delete process.env.OPENLEARN_STORAGE_DIR;
  });

  test("initializeSchema creates JSON storage file", () => {
    const storagePath = getStoragePath();
    expect(fs.existsSync(storagePath)).toBe(true);
    const raw = fs.readFileSync(storagePath, "utf8");
    const data = JSON.parse(raw);

    expect(data.version).toBeDefined();
    expect(Array.isArray(data.topics)).toBe(true);
    expect(Array.isArray(data.learnings)).toBe(true);
    expect(Array.isArray(data.objectives)).toBe(true);
    expect(Array.isArray(data.gate_results)).toBe(true);
  });

  test("recordTopic normalizes to lowercase and increments count", () => {
    recordTopic("React");
    recordTopic("react");
    recordTopic("  REACT  ");

    const topics = getTopics();
    expect(topics.length).toBe(1);
    expect(topics[0].name).toBe("react");
    expect(topics[0].count).toBe(3);
  });

  test("saveLearning stores data and updates topic stats", () => {
    const learningId = saveLearning({
      timestamp: new Date().toISOString(),
      task: "Build stateful form",
      topic: "TypeScript",
      what_learned: "Type-safe form state",
      mistakes: "Did not type event handlers",
    });

    expect(learningId).toBeGreaterThan(0);

    const learnings = getLearnings();
    expect(learnings.length).toBe(1);
    expect(learnings[0].id).toBe(learningId);
    expect(learnings[0].topic).toBe("TypeScript");

    const topics = getTopics();
    expect(topics.find((t) => t.name === "typescript")?.count).toBe(1);
  });

  test("searchLearnings and getLearningsByTopic are case-insensitive", () => {
    saveLearning({
      timestamp: new Date().toISOString(),
      task: "Build Todo app",
      topic: "React Hooks",
      what_learned: "useState and lifted state",
    });

    const byKeyword = searchLearnings("todo");
    const byTopic = getLearningsByTopic("react hooks");

    expect(byKeyword.length).toBe(1);
    expect(byKeyword[0].task).toContain("Todo");
    expect(byTopic.length).toBe(1);
  });

  test("getRecentLearnings filters by day window", () => {
    const old = new Date();
    old.setDate(old.getDate() - 45);

    saveLearning({
      timestamp: old.toISOString(),
      task: "Old learning",
      topic: "Legacy",
      what_learned: "Old concept",
    });

    saveLearning({
      timestamp: new Date().toISOString(),
      task: "New learning",
      topic: "Fresh",
      what_learned: "New concept",
    });

    const recent = getRecentLearnings(30);
    expect(recent.length).toBe(1);
    expect(recent[0].task).toBe("New learning");
  });

  test("objective completion updates active list and throws for invalid id", () => {
    const objectiveId = addObjective("Learn testing strategy");
    expect(getActiveObjectives().length).toBe(1);

    completeObjective(objectiveId);
    expect(getActiveObjectives().length).toBe(0);

    expect(() => completeObjective(99999)).toThrow("was not found");
  });

  test("recordGateResult enforces score boundaries", () => {
    recordGateResult({
      task_name: "Task A",
      gate_name: "ownership",
      score: 0,
      passed: false,
    });

    recordGateResult({
      task_name: "Task B",
      gate_name: "security",
      score: 100,
      passed: true,
    });

    expect(() =>
      recordGateResult({
        task_name: "Task C",
        gate_name: "testing",
        score: 101,
        passed: true,
      })
    ).toThrow("between 0 and 100");

    const stats = getGateStats();
    expect(stats.totalGates).toBe(2);
    expect(stats.passedGates).toBe(1);
    expect(stats.averageScore).toBe(50);
  });

  test("getGateStats returns zeros when no data exists", () => {
    const stats = getGateStats();
    expect(stats.totalGates).toBe(0);
    expect(stats.passedGates).toBe(0);
    expect(stats.averageScore).toBe(0);
  });

  test("getRecentTopics filters by days", () => {
    recordTopic("React");
    const topics = getTopics();
    topics[0].last_encountered = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString();

    const storagePath = getStoragePath();
    const raw = JSON.parse(fs.readFileSync(storagePath, "utf8"));
    raw.topics[0].last_encountered = topics[0].last_encountered;
    fs.writeFileSync(storagePath, JSON.stringify(raw), "utf8");

    closeDatabase();
    const filtered = getRecentTopics(30);
    expect(filtered.length).toBe(0);
  });

  test("rejects invalid input for required fields", () => {
    expect(() => getLearnings(0)).toThrow("positive integer");
    expect(() => getRecentLearnings(0)).toThrow("positive integer");
    expect(() => completeObjective(0)).toThrow("positive integer");
    expect(() =>
      saveLearning({
        timestamp: "invalid",
        task: "Task",
        what_learned: "Learned",
      })
    ).toThrow("valid ISO timestamp");
    expect(() =>
      recordGateResult({
        task_name: "Task",
        gate_name: "security",
        score: 50,
        passed: "true" as unknown as boolean,
      })
    ).toThrow("must be a boolean");
  });

  test("data persists after closing and reopening storage", () => {
    saveLearning({
      timestamp: new Date().toISOString(),
      task: "Persist me",
      topic: "Storage",
      what_learned: "JSON persistence works",
    });

    closeDatabase();
    const reloaded = getLearnings();
    expect(reloaded.length).toBe(1);
    expect(reloaded[0].task).toBe("Persist me");
  });

  test("learning stats aggregate stored values", () => {
    saveLearning({
      timestamp: new Date().toISOString(),
      task: "Task 1",
      topic: "React",
      what_learned: "Hooks",
    });

    saveLearning({
      timestamp: new Date().toISOString(),
      task: "Task 2",
      topic: "TypeScript",
      what_learned: "Narrowing",
    });

    addObjective("Ship feature");
    const stats = getLearningStats();

    expect(stats.totalLearnings).toBe(2);
    expect(stats.totalTopics).toBeGreaterThanOrEqual(2);
    expect(stats.activeObjectives).toBe(1);
    expect(stats.topTopics.length).toBeGreaterThan(0);
  });

  test("storage file path is under .opencode/openlearn", () => {
    const previousEnv = process.env.OPENLEARN_STORAGE_DIR;
    const originalCwd = process.cwd();
    const sandboxRoot = path.join(process.cwd(), ".tmp", `openlearn-root-${Date.now()}`);

    fs.mkdirSync(path.join(sandboxRoot, ".opencode", "openlearn"), { recursive: true });
    fs.writeFileSync(path.join(sandboxRoot, "package.json"), JSON.stringify({ name: "sandbox" }), "utf8");

    try {
      delete process.env.OPENLEARN_STORAGE_DIR;
      process.chdir(sandboxRoot);
      closeDatabase();
      initializeSchema();

      const storagePath = getStoragePath();
      const normalized = storagePath.split(path.sep).join("/");
      expect(normalized).toContain(".opencode/openlearn/openlearn.json");
      expect(normalized.startsWith(sandboxRoot.split(path.sep).join("/"))).toBe(true);
    } finally {
      process.chdir(originalCwd);
      if (previousEnv) {
        process.env.OPENLEARN_STORAGE_DIR = previousEnv;
      } else {
        delete process.env.OPENLEARN_STORAGE_DIR;
      }
      fs.rmSync(sandboxRoot, { recursive: true, force: true });
    }
  });

  test("OPENLEARN_STORAGE_DIR overrides default storage location", () => {
    const storagePath = getStoragePath();
    expect(storagePath.startsWith(process.env.OPENLEARN_STORAGE_DIR || "")).toBe(true);
  });

  test("migrates existing sqlite data to json storage", () => {
    const storageDir = process.env.OPENLEARN_STORAGE_DIR as string;
    const sqlitePath = path.join(storageDir, "openlearn.db");
    const jsonPath = path.join(storageDir, "openlearn.json");

    if (fs.existsSync(jsonPath)) {
      fs.unlinkSync(jsonPath);
    }

    const sqlite = new SQLiteDatabase(sqlitePath);
    sqlite.exec(`
      CREATE TABLE topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        first_encountered TEXT NOT NULL,
        last_encountered TEXT NOT NULL,
        count INTEGER DEFAULT 1
      );
      CREATE TABLE learnings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        task TEXT NOT NULL,
        topic TEXT,
        what_learned TEXT NOT NULL,
        mistakes TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE objectives (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        objective TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        completed_at TEXT
      );
      CREATE TABLE gate_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
        task_name TEXT NOT NULL,
        gate_name TEXT NOT NULL,
        score INTEGER,
        passed BOOLEAN,
        feedback TEXT
      );
    `);

    sqlite.run(
      "INSERT INTO topics (name, first_encountered, last_encountered, count) VALUES (?, ?, ?, ?)",
      ["react", new Date().toISOString(), new Date().toISOString(), 2]
    );
    sqlite.run(
      "INSERT INTO learnings (timestamp, task, topic, what_learned, mistakes) VALUES (?, ?, ?, ?, ?)",
      [new Date().toISOString(), "Legacy task", "React", "Migrated learning", "None"]
    );
    sqlite.close();

    closeDatabase();
    initializeSchema();

    expect(fs.existsSync(jsonPath)).toBe(true);
    expect(getTopics().length).toBe(1);
    expect(getLearnings().length).toBe(1);
  });

  test("normalizes malformed json store and keeps valid records", () => {
    const storagePath = getStoragePath();
    fs.writeFileSync(
      storagePath,
      JSON.stringify({
        version: "1.0.0",
        topics: [{ id: 1, name: "react", first_encountered: new Date().toISOString(), last_encountered: new Date().toISOString(), count: 2 }, { bad: true }],
        learnings: [{ id: 1, timestamp: new Date().toISOString(), task: "ok", what_learned: "ok", created_at: new Date().toISOString() }, { id: "bad" }],
        objectives: [{ id: 1, objective: "ship", status: "active", created_at: new Date().toISOString() }, { id: 2, objective: "broken", status: "unknown" }],
        gate_results: [{ id: 1, timestamp: new Date().toISOString(), task_name: "a", gate_name: "b", score: 10, passed: false }, { id: "bad" }],
        counters: { topics: 0, learnings: 0, objectives: 0, gate_results: 0 },
      }),
      "utf8"
    );

    closeDatabase();
    const stats = getLearningStats();
    const gateStats = getGateStats();

    expect(stats.totalTopics).toBe(1);
    expect(stats.totalLearnings).toBe(1);
    expect(stats.activeObjectives).toBe(1);
    expect(gateStats.totalGates).toBe(1);
  });
});
