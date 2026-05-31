import { getWorkoutSessions } from "../api/workoutSessions";
import type { WorkoutSessionWithTitle } from "../types/workoutSession";
import {
  readExerciseLastPerformanceMap,
  type ExerciseLastPerformance,
} from "./exerciseLastPerformance";

export type ExerciseUsageStats = {
  lastPerformance: ExerciseLastPerformance | null;
  sessionsCount: number;
  prLabel: string;
};

function formatPrLabel(entry: ExerciseLastPerformance | null): string {
  if (!entry) return "—";
  const w = entry.weight.trim();
  const hasWeight = w && w !== "—" && w !== "0";
  return hasWeight ? `${entry.reps} × ${w} kg` : `${entry.reps} reps`;
}

function sessionUsesExercise(session: WorkoutSessionWithTitle, exerciseId: string): boolean {
  const blocks = session.snapshot?.blocks;
  if (!blocks?.length) return false;
  return blocks.some((b) => b.exerciseId === exerciseId);
}

export async function loadExerciseUsageStats(exerciseId: string): Promise<ExerciseUsageStats> {
  const [perfMap, sessions] = await Promise.all([
    readExerciseLastPerformanceMap(),
    getWorkoutSessions().catch(() => [] as WorkoutSessionWithTitle[]),
  ]);
  const lastPerformance = perfMap[exerciseId] ?? null;
  const sessionsCount = sessions.filter((s) => sessionUsesExercise(s, exerciseId)).length;
  return {
    lastPerformance,
    sessionsCount,
    prLabel: formatPrLabel(lastPerformance),
  };
}
