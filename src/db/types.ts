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

export interface LearningStats {
  totalLearnings: number;
  totalTopics: number;
  recentLearnings: number;
  activeObjectives: number;
  topTopics: { name: string; count: number }[];
}

export type RequiredTopic = Required<Topic>;
export type RequiredLearning = Required<Omit<Learning, "topic" | "mistakes">> &
  Pick<Learning, "topic" | "mistakes">;
export type RequiredObjective = Required<Omit<Objective, "completed_at">> &
  Pick<Objective, "completed_at">;
export type RequiredGateResult = Required<Omit<GateResult, "feedback">> &
  Pick<GateResult, "feedback">;

export interface JsonStore {
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
