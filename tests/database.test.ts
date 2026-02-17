import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import * as fs from 'fs';
import * as path from 'path';
import {
  getDatabase,
  closeDatabase,
  initializeSchema,
  recordTopic,
  getTopics,
  saveLearning,
  getLearnings,
  searchLearnings,
  addObjective,
  getActiveObjectives,
  completeObjective,
  getLearningStats,
  recordGateResult,
  getGateStats,
} from "../src/db";

describe("Database Operations", () => {
  const testDbPath = path.join(process.cwd(), ".opencode", "openlearn", "test.db");
  
  beforeEach(() => {
    // Close any existing connection
    closeDatabase();
    
    // Remove test database if exists
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });
  
  afterEach(() => {
    closeDatabase();
    
    // Clean up test database
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });
  
  describe("Topics", () => {
    test("recordTopic creates new topic", () => {
      recordTopic("React");
      
      const topics = getTopics();
      expect(topics.length).toBeGreaterThan(0);
      expect(topics.find(t => t.name === "react")).toBeDefined();
    });
    
    test("recordTopic increments count for existing topic", () => {
      const initialTopics = getTopics();
      const initialReact = initialTopics.find(t => t.name === "react");
      const initialCount = initialReact?.count || 0;
      
      recordTopic("React");
      recordTopic("React");
      
      const topics = getTopics();
      const reactTopic = topics.find(t => t.name === "react");
      expect(reactTopic?.count).toBe(initialCount + 2);
    });
    
    test("getTopics returns sorted by count", () => {
      recordTopic("React");
      recordTopic("React");
      recordTopic("TypeScript");
      
      const topics = getTopics();
      expect(topics[0].name).toBe("react");
      expect(topics[0].count).toBeGreaterThanOrEqual(topics[1].count);
    });
  });
  
  describe("Learnings", () => {
    test("saveLearning stores learning in database", () => {
      const id = saveLearning({
        timestamp: new Date().toISOString(),
        task: "Test task",
        topic: "React",
        what_learned: "State management",
        mistakes: "Forgot to initialize state",
      });
      
      expect(id).toBeGreaterThan(0);
    });
    
    test("getLearnings returns saved learnings", () => {
      saveLearning({
        timestamp: new Date().toISOString(),
        task: "Test task",
        topic: "React",
        what_learned: "State management",
        mistakes: "Forgot to initialize state",
      });
      
      const learnings = getLearnings();
      expect(learnings.length).toBeGreaterThan(0);
      expect(learnings[0].task).toBe("Test task");
    });
    
    test("searchLearnings finds relevant learnings", () => {
      saveLearning({
        timestamp: new Date().toISOString(),
        task: "Build todo app",
        topic: "React",
        what_learned: "useState hook for state",
        mistakes: "Forgot to initialize",
      });
      
      const results = searchLearnings("todo");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].task).toContain("todo");
    });
    
    test("saveLearning also records topic", () => {
      saveLearning({
        timestamp: new Date().toISOString(),
        task: "Test task",
        topic: "NewTopic",
        what_learned: "Something new",
      });
      
      const topics = getTopics();
      expect(topics.find(t => t.name === "newtopic")).toBeDefined();
    });
  });
  
  describe("Objectives", () => {
    test("addObjective creates active objective", () => {
      const id = addObjective("Learn React hooks");
      expect(id).toBeGreaterThan(0);
      
      const objectives = getActiveObjectives();
      expect(objectives.length).toBeGreaterThan(0);
      expect(objectives[0].objective).toBe("Learn React hooks");
      expect(objectives[0].status).toBe("active");
    });
    
    test("completeObjective marks objective as completed", () => {
      const id = addObjective("Learn React hooks");
      completeObjective(id);
      
      const objectives = getActiveObjectives();
      expect(objectives.find(o => o.id === id)).toBeUndefined();
    });
  });
  
  describe("Stats", () => {
    test("getLearningStats returns correct statistics", () => {
      saveLearning({
        timestamp: new Date().toISOString(),
        task: "Task 1",
        topic: "React",
        what_learned: "Learned about state",
      });
      
      saveLearning({
        timestamp: new Date().toISOString(),
        task: "Task 2",
        topic: "TypeScript",
        what_learned: "Learned about types",
      });
      
      const stats = getLearningStats();
      
      expect(stats.totalLearnings).toBeGreaterThanOrEqual(2);
      expect(stats.totalTopics).toBeGreaterThanOrEqual(2);
      expect(stats.topTopics.length).toBeGreaterThan(0);
    });
  });
  
  describe("Gate Results", () => {
    test("recordGateResult stores gate data", () => {
      recordGateResult({
        task_name: "Todo app",
        gate_name: "ownership",
        score: 85,
        passed: true,
        feedback: "Good understanding",
      });
      
      const stats = getGateStats();
      expect(stats.totalGates).toBeGreaterThan(0);
      expect(stats.passedGates).toBeGreaterThan(0);
      expect(stats.averageScore).toBeGreaterThan(0);
    });
    
    test("getGateStats calculates correctly", () => {
      recordGateResult({
        task_name: "Task 1",
        gate_name: "ownership",
        score: 80,
        passed: true,
      });
      
      recordGateResult({
        task_name: "Task 1",
        gate_name: "security",
        score: 70,
        passed: false,
      });
      
      const stats = getGateStats();
      expect(stats.totalGates).toBeGreaterThanOrEqual(2);
      expect(stats.passedGates).toBeGreaterThanOrEqual(1);
      expect(stats.averageScore).toBeGreaterThanOrEqual(70);
    });
  });
});
