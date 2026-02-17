/**
 * OpenLearn Database Module
 * Uses bun:sqlite for local SQLite storage
 */

import { Database } from "bun:sqlite";
import * as path from "path";
import * as fs from "fs";

// Database file path
const DB_DIR = path.join(process.cwd(), ".opencode", "openlearn");
const DB_PATH = path.join(DB_DIR, "openlearn.db");

// Singleton database instance
let dbInstance: Database | null = null;

/**
 * Get or create database connection
 */
export function getDatabase(): Database {
  if (!dbInstance) {
    // Ensure directory exists
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    dbInstance = new Database(DB_PATH);
    dbInstance.exec("PRAGMA journal_mode = WAL;");
  }
  return dbInstance;
}

/**
 * Close database connection
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Initialize database schema
 */
export function initializeSchema(): void {
  const db = getDatabase();

  // Topics table - tracks technologies/concepts encountered
  db.exec(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      first_encountered TEXT NOT NULL,
      last_encountered TEXT NOT NULL,
      count INTEGER DEFAULT 1
    );
  `);

  // Learnings table - stores retrospective learnings
  db.exec(`
    CREATE TABLE IF NOT EXISTS learnings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT NOT NULL,
      task TEXT NOT NULL,
      topic TEXT,
      what_learned TEXT NOT NULL,
      mistakes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Objectives table - tracks learning objectives
  db.exec(`
    CREATE TABLE IF NOT EXISTS objectives (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      objective TEXT NOT NULL,
      status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      completed_at TEXT
    );
  `);

  // Gates table - tracks gate scores
  db.exec(`
    CREATE TABLE IF NOT EXISTS gate_results (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      task_name TEXT NOT NULL,
      gate_name TEXT NOT NULL,
      score INTEGER,
      passed BOOLEAN,
      feedback TEXT
    );
  `);
}

// ============================================================================
// Topic Operations
// ============================================================================

export interface Topic {
  id?: number;
  name: string;
  first_encountered: string;
  last_encountered: string;
  count: number;
}

/**
 * Record a topic encounter
 */
export function recordTopic(name: string): void {
  const db = getDatabase();
  const now = new Date().toISOString();

  const existing = db
    .query("SELECT * FROM topics WHERE name = $name")
    .get({ $name: name.toLowerCase() }) as Topic | null;

  if (existing) {
    db.run(
      "UPDATE topics SET count = count + 1, last_encountered = $now WHERE name = $name",
      { $name: name.toLowerCase(), $now: now }
    );
  } else {
    db.run(
      "INSERT INTO topics (name, first_encountered, last_encountered, count) VALUES ($name, $now, $now, 1)",
      { $name: name.toLowerCase(), $now: now }
    );
  }
}

/**
 * Get all topics sorted by encounter count
 */
export function getTopics(): Topic[] {
  const db = getDatabase();
  return db
    .query("SELECT * FROM topics ORDER BY count DESC, last_encountered DESC")
    .all() as Topic[];
}

/**
 * Get topics encountered recently
 */
export function getRecentTopics(days: number = 30): Topic[] {
  const db = getDatabase();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return db
    .query("SELECT * FROM topics WHERE last_encountered > $cutoff ORDER BY last_encountered DESC")
    .all({ $cutoff: cutoff.toISOString() }) as Topic[];
}

// ============================================================================
// Learning Operations
// ============================================================================

export interface Learning {
  id?: number;
  timestamp: string;
  task: string;
  topic?: string;
  what_learned: string;
  mistakes?: string;
  created_at?: string;
}

/**
 * Save a learning to the database
 */
export function saveLearning(learning: Omit<Learning, "id" | "created_at">): number {
  const db = getDatabase();

  const result = db.run(
    `INSERT INTO learnings (timestamp, task, topic, what_learned, mistakes)
     VALUES ($timestamp, $task, $topic, $what_learned, $mistakes)`,
    {
      $timestamp: learning.timestamp,
      $task: learning.task,
      $topic: learning.topic || null,
      $what_learned: learning.what_learned,
      $mistakes: learning.mistakes || null,
    }
  );

  // Also record the topic if provided
  if (learning.topic) {
    recordTopic(learning.topic);
  }

  return result.lastInsertRowid as number;
}

/**
 * Get all learnings
 */
export function getLearnings(limit: number = 100): Learning[] {
  const db = getDatabase();
  return db
    .query("SELECT * FROM learnings ORDER BY timestamp DESC LIMIT $limit")
    .all({ $limit: limit }) as Learning[];
}

/**
 * Search learnings by topic or content
 */
export function searchLearnings(query: string): Learning[] {
  const db = getDatabase();
  const searchTerm = `%${query.toLowerCase()}%`;

  return db
    .query(
      `SELECT * FROM learnings 
       WHERE LOWER(topic) LIKE $query 
          OR LOWER(task) LIKE $query 
          OR LOWER(what_learned) LIKE $query 
       ORDER BY timestamp DESC`
    )
    .all({ $query: searchTerm }) as Learning[];
}

/**
 * Get learnings for a specific topic
 */
export function getLearningsByTopic(topic: string): Learning[] {
  const db = getDatabase();
  return db
    .query("SELECT * FROM learnings WHERE LOWER(topic) = $topic ORDER BY timestamp DESC")
    .all({ $topic: topic.toLowerCase() }) as Learning[];
}

/**
 * Get recent learnings
 */
export function getRecentLearnings(days: number = 30): Learning[] {
  const db = getDatabase();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return db
    .query("SELECT * FROM learnings WHERE timestamp > $cutoff ORDER BY timestamp DESC")
    .all({ $cutoff: cutoff.toISOString() }) as Learning[];
}

// ============================================================================
// Objective Operations
// ============================================================================

export interface Objective {
  id?: number;
  objective: string;
  status: "active" | "completed" | "abandoned";
  created_at?: string;
  completed_at?: string;
}

/**
 * Add a new learning objective
 */
export function addObjective(objective: string): number {
  const db = getDatabase();
  const result = db.run(
    "INSERT INTO objectives (objective, status) VALUES ($objective, 'active')",
    { $objective: objective }
  );
  return result.lastInsertRowid as number;
}

/**
 * Get active objectives
 */
export function getActiveObjectives(): Objective[] {
  const db = getDatabase();
  return db
    .query("SELECT * FROM objectives WHERE status = 'active' ORDER BY created_at DESC")
    .all() as Objective[];
}

/**
 * Complete an objective
 */
export function completeObjective(id: number): void {
  const db = getDatabase();
  db.run(
    "UPDATE objectives SET status = 'completed', completed_at = $now WHERE id = $id",
    { $id: id, $now: new Date().toISOString() }
  );
}

// ============================================================================
// Stats Operations
// ============================================================================

export interface LearningStats {
  totalLearnings: number;
  totalTopics: number;
  recentLearnings: number;
  activeObjectives: number;
  topTopics: { name: string; count: number }[];
}

/**
 * Get learning statistics
 */
export function getLearningStats(): LearningStats {
  const db = getDatabase();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const totalLearnings = (db.query("SELECT COUNT(*) as count FROM learnings").get() as { count: number }).count;
  const totalTopics = (db.query("SELECT COUNT(*) as count FROM topics").get() as { count: number }).count;
  const recentLearnings = (db.query(
    "SELECT COUNT(*) as count FROM learnings WHERE timestamp > $cutoff",
    { $cutoff: thirtyDaysAgo.toISOString() }
  ).get() as { count: number }).count;
  const activeObjectives = (db.query(
    "SELECT COUNT(*) as count FROM objectives WHERE status = 'active'"
  ).get() as { count: number }).count;
  const topTopics = db.query(
    "SELECT name, count FROM topics ORDER BY count DESC LIMIT 5"
  ).all() as { name: string; count: number }[];

  return {
    totalLearnings,
    totalTopics,
    recentLearnings,
    activeObjectives,
    topTopics,
  };
}

// ============================================================================
// Gate Results Operations
// ============================================================================

export interface GateResult {
  id?: number;
  timestamp?: string;
  task_name: string;
  gate_name: string;
  score: number;
  passed: boolean;
  feedback?: string;
}

/**
 * Record a gate result
 */
export function recordGateResult(result: Omit<GateResult, "id" | "timestamp">): void {
  const db = getDatabase();
  db.run(
    `INSERT INTO gate_results (task_name, gate_name, score, passed, feedback)
     VALUES ($task, $gate, $score, $passed, $feedback)`,
    {
      $task: result.task_name,
      $gate: result.gate_name,
      $score: result.score,
      $passed: result.passed ? 1 : 0,
      $feedback: result.feedback || null,
    }
  );
}

/**
 * Get gate statistics
 */
export function getGateStats(): {
  totalGates: number;
  passedGates: number;
  averageScore: number;
} {
  const db = getDatabase();

  const stats = db.query(
    `SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN passed = 1 THEN 1 ELSE 0 END) as passed,
      AVG(score) as avg_score
     FROM gate_results`
  ).get() as { total: number; passed: number; avg_score: number | null };

  return {
    totalGates: stats.total,
    passedGates: stats.passed,
    averageScore: stats.avg_score ? Math.round(stats.avg_score) : 0,
  };
}

// Initialize on module load
initializeSchema();
