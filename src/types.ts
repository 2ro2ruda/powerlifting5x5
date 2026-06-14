/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum ExerciseId {
  SQUAT = "squat",
  BENCH_PRESS = "bench_press",
  DEADLIFT = "deadlift",
  OVERHEAD_PRESS = "overhead_press",
  BARBELL_ROW = "barbell_row",
}

export interface ExerciseConfig {
  id: ExerciseId;
  name: string;
  nameKr: string;
  current1RM: number; // in kg
  intensityPercent: number; // e.g., 75 (%)
  startingWeight: number; // initial training weight in kg, rounded to 5kg
  weeklyIncrement: number; // default 5kg
}

export interface SessionExercise {
  id: string; // e.g., "squat-w1d1"
  exerciseId: ExerciseId;
  nameKr: string;
  targetWeight: number; // rounded to 5kg
  targetSets: number; // usually 5, deadlift 1 or 3
  targetReps: number; // usually 5
  completedReps: number[]; // e.g., [5, 5, 5, 5, 5] (-1 means not done yet)
  isCompleted: boolean;
}

export interface WorkoutSession {
  id: string; // e.g., "w1d1"
  label: string; // e.g., "Day 1 (Workout A)"
  type: 'A' | 'B';
  isCompleted: boolean;
  completedAt?: string;
  exercises: SessionExercise[];
}

export interface WeeklyProgram {
  weekNumber: number; // 1 to 4
  sessions: WorkoutSession[];
  isCompleted: boolean;
}

export interface ProgramState {
  configs: Record<ExerciseId, ExerciseConfig>;
  weeks: WeeklyProgram[];
  activeWeek: number; // 1 to 4
  activeDay: number; // 0 to 2 (Day 1, Day 2, Day 3)
  programGenerated: boolean;
  historyLog: {
    date: string;
    action: string;
    details: string;
  }[];
}
