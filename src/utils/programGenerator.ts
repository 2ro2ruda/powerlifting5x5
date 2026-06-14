/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ExerciseId, ExerciseConfig, WeeklyProgram, WorkoutSession, SessionExercise } from "../types";

// Standard round to nearest 5kg
export function roundTo5Kg(weight: number): number {
  return Math.round(weight / 5) * 5;
}

// Estimate 1RM using Epley Formula: 1RM = w * (1 + reps / 30) (returns nearest 5kg or exact)
export function estimate1RM(weight: number, reps: number, roundToNearest5: boolean = false): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  const raw1RM = weight * (1 + reps / 30);
  return roundToNearest5 ? roundTo5Kg(raw1RM) : Math.round(raw1RM * 10) / 10;
}

// Plate calculator engine
export interface BarbellPlates {
  "25": number;
  "20": number;
  "15": number;
  "10": number;
  "5": number;
  "2.5": number;
  totalSideWeight: number;
  barWeight: number;
}

export function calculatePlates(targetWeight: number, barWeight: number = 20): BarbellPlates {
  const result: BarbellPlates = {
    "25": 0,
    "20": 0,
    "15": 0,
    "10": 0,
    "5": 0,
    "2.5": 0,
    totalSideWeight: 0,
    barWeight
  };

  if (targetWeight <= barWeight) {
    return result;
  }

  const sideWeight = (targetWeight - barWeight) / 2;
  result.totalSideWeight = sideWeight;

  let remaining = sideWeight;
  const plateDenominations: (25 | 20 | 15 | 10 | 5 | 2.5)[] = [25, 20, 15, 10, 5, 2.5];

  for (const plate of plateDenominations) {
    const count = Math.floor(remaining / plate);
    if (count > 0) {
      result[plate.toString() as "25" | "20" | "15" | "10" | "5" | "2.5"] = count;
      remaining -= count * plate;
    }
  }

  return result;
}

// Generate default configurations
export function generateDefaultConfigs(): Record<ExerciseId, ExerciseConfig> {
  return {
    [ExerciseId.SQUAT]: {
      id: ExerciseId.SQUAT,
      name: "Squat",
      nameKr: "스쿼트",
      current1RM: 100,
      intensityPercent: 75,
      startingWeight: 75,
      weeklyIncrement: 5,
    },
    [ExerciseId.BENCH_PRESS]: {
      id: ExerciseId.BENCH_PRESS,
      name: "Bench Press",
      nameKr: "벤치프레스",
      current1RM: 80,
      intensityPercent: 75,
      startingWeight: 60,
      weeklyIncrement: 5,
    },
    [ExerciseId.DEADLIFT]: {
      id: ExerciseId.DEADLIFT,
      name: "Deadlift",
      nameKr: "데드리프트",
      current1RM: 120,
      intensityPercent: 75,
      startingWeight: 90,
      weeklyIncrement: 5,
    },
    [ExerciseId.OVERHEAD_PRESS]: {
      id: ExerciseId.OVERHEAD_PRESS,
      name: "Overhead Press",
      nameKr: "오버헤드프레스",
      current1RM: 50,
      intensityPercent: 70,
      startingWeight: 35,
      weeklyIncrement: 5,
    },
    [ExerciseId.BARBELL_ROW]: {
      id: ExerciseId.BARBELL_ROW,
      name: "Barbell Row",
      nameKr: "바벨로우",
      current1RM: 70,
      intensityPercent: 70,
      startingWeight: 50,
      weeklyIncrement: 5,
    },
  };
}

// Generate the 4-week program
export function generate4WeekProgram(configs: Record<ExerciseId, ExerciseConfig>): WeeklyProgram[] {
  const weeks: WeeklyProgram[] = [];

  // Progression tracking per exercise
  const currentLevel: Record<ExerciseId, number> = {
    [ExerciseId.SQUAT]: configs[ExerciseId.SQUAT].startingWeight,
    [ExerciseId.BENCH_PRESS]: configs[ExerciseId.BENCH_PRESS].startingWeight,
    [ExerciseId.DEADLIFT]: configs[ExerciseId.DEADLIFT].startingWeight,
    [ExerciseId.OVERHEAD_PRESS]: configs[ExerciseId.OVERHEAD_PRESS].startingWeight,
    [ExerciseId.BARBELL_ROW]: configs[ExerciseId.BARBELL_ROW].startingWeight,
  };

  for (let week = 1; week <= 4; week++) {
    const sessions: WorkoutSession[] = [];

    // Week alternates A-B-A and B-A-B
    // Week 1: Day 1 (A), Day 2 (B), Day 3 (A)
    // Week 2: Day 1 (B), Day 2 (A), Day 3 (B)
    // Week 3: Day 1 (A), Day 2 (B), Day 3 (A)
    // Week 4: Day 1 (B), Day 2 (A), Day 3 (B)
    const isWeekA_B_A = week % 2 !== 0;
    const pattern: ('A' | 'B')[] = isWeekA_B_A ? ['A', 'B', 'A'] : ['B', 'A', 'B'];

    for (let day = 0; day < 3; day++) {
      const type = pattern[day];
      const sessionExercises: SessionExercise[] = [];

      if (type === 'A') {
        // Squat, Bench Press, Barbell Row
        const sqWeight = currentLevel[ExerciseId.SQUAT];
        const bpWeight = currentLevel[ExerciseId.BENCH_PRESS];
        const rowWeight = currentLevel[ExerciseId.BARBELL_ROW];

        sessionExercises.push({
          id: `sq-w${week}d${day + 1}`,
          exerciseId: ExerciseId.SQUAT,
          nameKr: "스쿼트 (Squat)",
          targetWeight: sqWeight,
          targetSets: 5,
          targetReps: 5,
          completedReps: [-1, -1, -1, -1, -1],
          isCompleted: false,
        });

        sessionExercises.push({
          id: `bp-w${week}d${day + 1}`,
          exerciseId: ExerciseId.BENCH_PRESS,
          nameKr: "벤치프레스 (Bench Press)",
          targetWeight: bpWeight,
          targetSets: 5,
          targetReps: 5,
          completedReps: [-1, -1, -1, -1, -1],
          isCompleted: false,
        });

        sessionExercises.push({
          id: `row-w${week}d${day + 1}`,
          exerciseId: ExerciseId.BARBELL_ROW,
          nameKr: "바벨로우 (Barbell Row)",
          targetWeight: rowWeight,
          targetSets: 5,
          targetReps: 5,
          completedReps: [-1, -1, -1, -1, -1],
          isCompleted: false,
        });

        // Increase weights after session preparation for subsequent sessions.
        // In linear 5x5, squats go up each workout, Bench/Row go up each Workout A they appear.
        // For a clean 4-week design where players progress exactly *weekly* by 5kg,
        // we can increment by weekly increments (starting at Week 1 and going up 5kg each week).
        // Let's increment based on the week level:
        // So during a week we keep it steady, or we increment weekly.
        // If they start on 80kg in Week 1, they do all Week 1 Squats at 80kg (or increase by 2.5kg each session).
        // Standard powerlifting 4-week peaking/linear progression generally goes up *weekly* by 5kg:
        // Week 1: 100% of base
        // Week 2: Base + 5kg
        // Week 3: Base + 10kg
        // Week 4: Base + 15kg (Peak!)
        // This is extremely steady, clear, structured, and easy to visualize over 4 weeks!
        // Let's implement this weekly increment, because 5kg *session* increases on squat would lead to +60kg in 4 weeks, which is impossible for anyone already knowing their 1RM!
        // Yes, weekly progression of +5kg is perfectly doable and standard for a 4-week cycle. Let's make it go up 5kg each week.
      } else {
        // Squat, Overhead Press, Deadlift
        const sqWeight = currentLevel[ExerciseId.SQUAT];
        const ohpWeight = currentLevel[ExerciseId.OVERHEAD_PRESS];
        const dlWeight = currentLevel[ExerciseId.DEADLIFT];

        sessionExercises.push({
          id: `sq-w${week}d${day + 1}`,
          exerciseId: ExerciseId.SQUAT,
          nameKr: "스쿼트 (Squat)",
          targetWeight: sqWeight,
          targetSets: 5,
          targetReps: 5,
          completedReps: [-1, -1, -1, -1, -1],
          isCompleted: false,
        });

        sessionExercises.push({
          id: `ohp-w${week}d${day + 1}`,
          exerciseId: ExerciseId.OVERHEAD_PRESS,
          nameKr: "오버헤드프레스 (OHP)",
          targetWeight: ohpWeight,
          targetSets: 5,
          targetReps: 5,
          completedReps: [-1, -1, -1, -1, -1],
          isCompleted: false,
        });

        // Deadlift is traditional 1x5 in 5x5 (heavy weight, only 1 working set)
        sessionExercises.push({
          id: `dl-w${week}d${day + 1}`,
          exerciseId: ExerciseId.DEADLIFT,
          nameKr: "데드리프트 (Deadlift)",
          targetWeight: dlWeight,
          targetSets: 1, // Standard is 1x5 to prevent heavy CNS fatigue
          targetReps: 5,
          completedReps: [-1],
          isCompleted: false,
        });
      }

      sessions.push({
        id: `w${week}d${day + 1}`,
        label: `${week}주차 - ${day + 1}일차 (${type === 'A' ? '루틴 A' : '루틴 B'})`,
        type,
        isCompleted: false,
        exercises: sessionExercises,
      });
    }

    weeks.push({
      weekNumber: week,
      sessions,
      isCompleted: false,
    });

    // Progression applied to next week's weights
    currentLevel[ExerciseId.SQUAT] += configs[ExerciseId.SQUAT].weeklyIncrement;
    currentLevel[ExerciseId.BENCH_PRESS] += configs[ExerciseId.BENCH_PRESS].weeklyIncrement;
    currentLevel[ExerciseId.DEADLIFT] += configs[ExerciseId.DEADLIFT].weeklyIncrement;
    currentLevel[ExerciseId.OVERHEAD_PRESS] += configs[ExerciseId.OVERHEAD_PRESS].weeklyIncrement;
    currentLevel[ExerciseId.BARBELL_ROW] += configs[ExerciseId.BARBELL_ROW].weeklyIncrement;
  }

  return weeks;
}
