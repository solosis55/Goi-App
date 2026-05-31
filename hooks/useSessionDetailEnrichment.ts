import { useEffect, useState } from "react";
import { getExercises } from "../api/exercises";
import { getWorkouts } from "../api/workouts";
import { equipmentLabel } from "../constants/exerciseEquipment";
import type { WorkoutSessionDetail } from "../types/workoutSession";
import type { ExerciseLastPerformance } from "../utils/exerciseLastPerformance";
import { readExerciseLastPerformanceMap } from "../utils/exerciseLastPerformance";

export type SessionExerciseMeta = {
  equipmentSlug?: string;
  laterality?: "bilateral" | "unilateral";
  equipmentLabel: string | null;
};

export type SessionDetailEnrichment = {
  loading: boolean;
  imageByExerciseId: Record<string, string | null>;
  metaByExerciseId: Record<string, SessionExerciseMeta>;
  lastPerformanceByExerciseId: Record<string, ExerciseLastPerformance>;
};

const EMPTY: SessionDetailEnrichment = {
  loading: false,
  imageByExerciseId: {},
  metaByExerciseId: {},
  lastPerformanceByExerciseId: {},
};

export function useSessionDetailEnrichment(session: WorkoutSessionDetail | null): SessionDetailEnrichment {
  const [state, setState] = useState<SessionDetailEnrichment>({ ...EMPTY, loading: Boolean(session) });

  useEffect(() => {
    if (!session) {
      setState(EMPTY);
      return;
    }

    let cancelled = false;
    setState((prev) => ({ ...prev, loading: true }));

    void (async () => {
      try {
        const [exercises, workouts, perfMap] = await Promise.all([
          getExercises().catch(() => []),
          getWorkouts().catch(() => []),
          readExerciseLastPerformanceMap(),
        ]);

        if (cancelled) return;

        const imageByExerciseId: Record<string, string | null> = {};
        for (const ex of exercises) {
          imageByExerciseId[ex.id] = ex.imageUrl?.trim() || null;
        }

        const workout = workouts.find((w) => w.id === session.workoutId);
        const metaByExerciseId: Record<string, SessionExerciseMeta> = {};

        for (const block of session.snapshot?.blocks ?? []) {
          const fromSnapshot =
            block.equipmentSlug != null || block.laterality != null
              ? {
                  equipmentSlug: block.equipmentSlug,
                  laterality: block.laterality,
                }
              : null;
          const fromWorkout = workout?.exerciseBlocks?.find((b) => b.exerciseId === block.exerciseId);
          const equipmentSlug = fromSnapshot?.equipmentSlug ?? fromWorkout?.equipmentSlug;
          const laterality =
            fromSnapshot?.laterality ??
            (fromWorkout?.laterality === "unilateral" ? "unilateral" : "bilateral");
          metaByExerciseId[block.exerciseId] = {
            equipmentSlug,
            laterality,
            equipmentLabel: equipmentLabel(equipmentSlug) || null,
          };
        }

        setState({
          loading: false,
          imageByExerciseId,
          metaByExerciseId,
          lastPerformanceByExerciseId: perfMap,
        });
      } catch {
        if (!cancelled) setState({ ...EMPTY, loading: false });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.id, session?.workoutId, session?.snapshot?.blocks?.length]);

  return state;
}
