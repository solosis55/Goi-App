import type { WorkoutSessionSnapshot } from "../../types/workoutSessionSnapshot";

export type SessionSelectMeta = {
  workoutTitle: string;
  performedAt: string;
  notes?: string;
  workoutId?: string;
  snapshot?: WorkoutSessionSnapshot | null;
};

function metricsFromSnapshot(snapshot?: WorkoutSessionSnapshot | null) {
  if (!snapshot) {
    return {
      sessionCompletedSets: null as number | null,
      sessionTotalSets: null as number | null,
      sessionCompletedExercises: null as number | null,
      sessionTotalExercises: null as number | null,
    };
  }
  return {
    sessionCompletedSets: snapshot.completedSets,
    sessionTotalSets: snapshot.totalSets,
    sessionCompletedExercises: snapshot.completedExercises,
    sessionTotalExercises: snapshot.totalExercises,
  };
}

export function applySessionMeta(meta: SessionSelectMeta | null | undefined) {
  if (!meta) {
    return {
      sessionWorkoutTitle: null as string | null,
      sessionPerformedAt: null as string | null,
      sessionNotes: null as string | null,
      ...metricsFromSnapshot(null),
    };
  }
  return {
    sessionWorkoutTitle: meta.workoutTitle,
    sessionPerformedAt: meta.performedAt,
    sessionNotes: meta.notes ?? null,
    ...metricsFromSnapshot(meta.snapshot),
  };
}
