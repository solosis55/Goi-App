import { useCallback, useEffect, useMemo, useState } from "react";
import { getExercises } from "../api/exercises";
import { createWorkoutSession } from "../api/workoutSessions";
import { WORKOUT_EXERCISES_MAX, WORKOUT_SETS_MAX_PER_EXERCISE } from "../constants/workoutFormLimits";
import type { Exercise } from "../types/exercise";
import type { Workout, WorkoutSetRow } from "../types/workout";
import type { ActiveWorkoutSession, SessionPerformBlock, SessionPerformSet } from "../types/workoutSessionPerform";
import { getErrorMessage } from "../utils/errorMessages";
import { buildSessionSnapshotFromPerform } from "../utils/buildSessionSnapshot";
import { mergeExerciseLastPerformanceFromBlocks } from "../utils/exerciseLastPerformance";
import { readWorkoutRestPreference } from "../utils/workoutRestPreference";
import { blockRestSec } from "../utils/performBlockRest";
import { toggleSessionPause } from "../utils/workoutSessionTimer";
import {
  buildSessionNotesFromPerform,
  collectPerformBlockNotesLines,
  clearActiveWorkoutSession,
  countPerformProgress,
  createActiveSessionFromWorkout,
  createPerformBlockForExercise,
  createPerformSet,
  normalizeActiveWorkoutSession,
  readActiveWorkoutSession,
  writeActiveWorkoutSession,
} from "../utils/workoutSessionPerform";
import { clonePerformSet } from "../utils/performSetExtras";

function syncActualWithPlanned(row: SessionPerformSet, plannedPatch: Partial<WorkoutSetRow>): SessionPerformSet {
  const nextPlanned = { ...row.planned, ...plannedPatch };
  const patch: Partial<SessionPerformSet> = { planned: nextPlanned };
  if (!row.done) {
    if (plannedPatch.reps !== undefined && row.actualReps === row.planned.reps) {
      patch.actualReps = nextPlanned.reps;
    }
    if (plannedPatch.weight !== undefined && row.actualWeight === row.planned.weight) {
      patch.actualWeight = nextPlanned.weight;
    }
  }
  return { ...row, ...patch };
}

export function useWorkoutPerform(workout: Workout) {
  const [session, setSession] = useState<ActiveWorkoutSession | null>(null);
  const [catalog, setCatalog] = useState<Exercise[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateBlocks = useCallback((fn: (blocks: SessionPerformBlock[]) => SessionPerformBlock[]) => {
    setSession((prev) => (prev ? { ...prev, blocks: fn(prev.blocks) } : prev));
  }, []);

  useEffect(() => {
    let cancelled = false;
    void getExercises()
      .then((list) => {
        if (!cancelled) {
          setCatalog(list);
          setCatalogError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) setCatalogError(getErrorMessage(e, "No se pudo cargar el catálogo"));
      })
      .finally(() => {
        if (!cancelled) setCatalogLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([readActiveWorkoutSession(), readWorkoutRestPreference()]).then(([stored, defaultRestSec]) => {
      if (cancelled) return;
      if (stored?.workoutId === workout.id) {
        setSession(normalizeActiveWorkoutSession(stored, defaultRestSec));
      } else {
        setSession(createActiveSessionFromWorkout(workout, defaultRestSec));
      }
      setHydrated(true);
    });
    return () => {
      cancelled = true;
    };
  }, [workout.id]);

  useEffect(() => {
    if (!hydrated || !session) return;
    const t = setTimeout(() => {
      void writeActiveWorkoutSession(session);
    }, 300);
    return () => clearTimeout(t);
  }, [hydrated, session]);

  const catalogById = useMemo(() => new Map(catalog.map((e) => [e.id, e])), [catalog]);

  const selectedExerciseIds = useMemo(
    () => new Set(session?.blocks.map((b) => b.exerciseId) ?? []),
    [session?.blocks]
  );

  const slotsLeft = WORKOUT_EXERCISES_MAX - (session?.blocks.length ?? 0);

  const progress = useMemo(
    () => countPerformProgress(session?.blocks ?? []),
    [session?.blocks]
  );

  const allSetsDone =
    progress.totalSets > 0 && progress.completedSets === progress.totalSets;

  const patchSet = useCallback(
    (blockIndex: number, setIndex: number, patch: Partial<SessionPerformSet>) => {
      updateBlocks((blocks) =>
        blocks.map((block, bi) => {
          if (bi !== blockIndex) return block;
          return {
            ...block,
            sets: block.sets.map((row, si) => (si === setIndex ? { ...row, ...patch } : row)),
          };
        })
      );
    },
    [updateBlocks]
  );

  const patchPlannedSet = useCallback(
    (blockIndex: number, setIndex: number, patch: Partial<WorkoutSetRow>) => {
      updateBlocks((blocks) =>
        blocks.map((block, bi) => {
          if (bi !== blockIndex) return block;
          return {
            ...block,
            sets: block.sets.map((row, si) =>
              si === setIndex ? syncActualWithPlanned(row, patch) : row
            ),
          };
        })
      );
    },
    [updateBlocks]
  );

  const patchBlock = useCallback(
    (blockIndex: number, patch: Partial<SessionPerformBlock>) => {
      updateBlocks((blocks) =>
        blocks.map((block, bi) => (bi === blockIndex ? { ...block, ...patch } : block))
      );
    },
    [updateBlocks]
  );

  const addSet = useCallback(
    (blockIndex: number, copyLast = false) => {
      updateBlocks((blocks) =>
        blocks.map((block, bi) => {
          if (bi !== blockIndex || block.sets.length >= WORKOUT_SETS_MAX_PER_EXERCISE) return block;
          const last = block.sets[block.sets.length - 1];
          const row = copyLast && last ? clonePerformSet(last) : createPerformSet();
          return { ...block, sets: [...block.sets, row] };
        })
      );
    },
    [updateBlocks]
  );

  const removeSet = useCallback(
    (blockIndex: number, setIndex: number) => {
      updateBlocks((blocks) =>
        blocks.map((block, bi) => {
          if (bi !== blockIndex || block.sets.length <= 1) return block;
          return { ...block, sets: block.sets.filter((_, si) => si !== setIndex) };
        })
      );
    },
    [updateBlocks]
  );

  const restSecForNewBlock = useCallback((blocks: SessionPerformBlock[]) => {
    const last = blocks[blocks.length - 1];
    return last ? blockRestSec(last) : undefined;
  }, []);

  const addExercise = useCallback(
    (exerciseId: string) => {
      if (slotsLeft <= 0 || selectedExerciseIds.has(exerciseId)) return;
      updateBlocks((blocks) => [
        ...blocks,
        createPerformBlockForExercise(exerciseId, catalogById.get(exerciseId), restSecForNewBlock(blocks)),
      ]);
    },
    [updateBlocks, slotsLeft, selectedExerciseIds, catalogById, restSecForNewBlock]
  );

  const addExercises = useCallback(
    (exerciseIds: string[]) => {
      updateBlocks((blocks) => {
        let next = [...blocks];
        for (const exerciseId of exerciseIds) {
          if (next.length >= WORKOUT_EXERCISES_MAX) break;
          if (next.some((b) => b.exerciseId === exerciseId)) continue;
          next.push(
            createPerformBlockForExercise(
              exerciseId,
              catalogById.get(exerciseId),
              restSecForNewBlock(next)
            )
          );
        }
        return next;
      });
    },
    [updateBlocks, catalogById, restSecForNewBlock]
  );

  const removeBlock = useCallback(
    (blockIndex: number) => {
      updateBlocks((blocks) => blocks.filter((_, bi) => bi !== blockIndex));
    },
    [updateBlocks]
  );

  const moveBlock = useCallback(
    (blockIndex: number, delta: -1 | 1) => {
      const j = blockIndex + delta;
      updateBlocks((blocks) => {
        if (j < 0 || j >= blocks.length) return blocks;
        const next = [...blocks];
        const tmp = next[blockIndex]!;
        next[blockIndex] = next[j]!;
        next[j] = tmp;
        return next;
      });
    },
    [updateBlocks]
  );

  const setNotes = useCallback((notes: string) => {
    setSession((prev) => (prev ? { ...prev, notes } : prev));
  }, []);

  const togglePause = useCallback(() => {
    setSession((prev) => (prev ? toggleSessionPause(prev) : prev));
  }, []);

  const markAllSetsInBlock = useCallback(
    (blockIndex: number) => {
      updateBlocks((blocks) =>
        blocks.map((block, bi) => {
          if (bi !== blockIndex) return block;
          return {
            ...block,
            sets: block.sets.map((row) => ({
              ...row,
              done: true,
              actualReps: row.actualReps.trim() || row.planned.reps,
              actualWeight: row.actualWeight.trim() || row.planned.weight,
            })),
          };
        })
      );
    },
    [updateBlocks]
  );

  const finishSession = useCallback(
    async (notesOverride?: string): Promise<string | null> => {
      if (!session) return null;
      if (session.blocks.length === 0) {
        setError("Añade al menos un ejercicio para completar el entrenamiento");
        return null;
      }
      setFinishing(true);
      setError(null);
      try {
        const blockNoteLines = collectPerformBlockNotesLines(
          session.blocks,
          (id) => catalogById.get(id)?.name?.trim() || "Ejercicio"
        );
        const notes = buildSessionNotesFromPerform(
          notesOverride ?? session.notes,
          progress.completedSets,
          progress.totalSets,
          blockNoteLines
        );
        const snapshot = buildSessionSnapshotFromPerform(session, progress, (id) =>
          catalogById.get(id)?.name?.trim() || "Ejercicio"
        );
        const saved = await createWorkoutSession({
          workoutId: session.workoutId,
          performedAt: new Date().toISOString(),
          notes,
          snapshot,
        });
        await mergeExerciseLastPerformanceFromBlocks(session.blocks);
        await clearActiveWorkoutSession();
        return saved.id;
      } catch (e) {
        setError(getErrorMessage(e, "No se pudo completar el entrenamiento"));
        return null;
      } finally {
        setFinishing(false);
      }
    },
    [session, progress.completedSets, progress.totalSets, catalogById]
  );

  const abandonSession = useCallback(async () => {
    await clearActiveWorkoutSession();
    setSession(null);
  }, []);

  return {
    session,
    catalog,
    catalogById,
    catalogLoading,
    catalogError,
    selectedExerciseIds,
    slotsLeft,
    hydrated,
    progress,
    allSetsDone,
    patchSet,
    patchPlannedSet,
    patchBlock,
    addSet,
    removeSet,
    addExercise,
    addExercises,
    removeBlock,
    moveBlock,
    setNotes,
    togglePause,
    markAllSetsInBlock,
    finishSession,
    abandonSession,
    finishing,
    error,
    setError,
  };
}
