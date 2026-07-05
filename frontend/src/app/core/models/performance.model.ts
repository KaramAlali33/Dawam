export interface CompetencyScores {
  technical: number; // 1-5 scale
  communication: number; // 1-5 scale
  teamwork: number; // 1-5 scale
  leadership: number; // 1-5 scale
}

export enum GoalStatus {
  NotStarted = 'NotStarted',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Deferred = 'Deferred'
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  weight: number; // e.g. 25 for 25%
  progress: number; // 0-100
  status: GoalStatus;
}

export enum PerformanceStatus {
  Draft = 'Draft',
  PendingSelf = 'PendingSelf',
  PendingManager = 'PendingManager',
  Completed = 'Completed'
}

export interface PerformanceReview {
  id: number;
  employeeId: number;
  employeeName: string;
  department: string;
  reviewCycle: string; // e.g., "Q1 2026", "السنوي 2026"
  managerName: string;
  selfRating?: number; // 1-5 overall self score
  managerRating?: number; // Calculated overall average
  selfComments?: string;
  managerComments?: string;
  status: PerformanceStatus;
  scores?: CompetencyScores;
  updatedAt: string;
}
