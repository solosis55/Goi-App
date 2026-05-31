import { getExercises } from "../api/exercises";
import { getWorkouts } from "../api/workouts";
import type { Exercise } from "../types/exercise";
import type { Workout } from "../types/workout";
import type { WorkoutSessionSnapshot } from "../types/workoutSessionSnapshot";

function parseSeriesFromNotes(notes: string): { completed: number; total: number } | null {
  const first = notes.trim().split("\n")[0]?.trim() ?? "";
  const m = first.match(/^(\d+)\/(\d+)\s+series completadas$/i);
  if (!m) return null;
  const completed = Number(m[1]);
  const total = Number(m[2]);
  if (!Number.isFinite(completed) || !Number.isFinite(total) || total <= 0) return null;
  return { completed, total };
}

export function deriveSessionSnapshotFromWorkout(
  workout: Workout | undefined,
  exercises: Exercise[],
  notes: string,
  workoutTitleFallback: string
): WorkoutSessionSnapshot | null {
  if (!workout) return null;

  const nameById = new Map(exercises.map((e) => [e.id, e.name]));
  const blocksFromWorkout = workout.exerciseBlocks ?? [];
  const idsFromWorkout = workout.exerciseIds ?? [];

  if (blocksFromWorkout.length === 0 && idsFromWorkout.length === 0) return null;

  const series = parseSeriesFromNotes(notes);

  const blocks =
    blocksFromWorkout.length > 0
      ? blocksFromWorkout.map((block) => {
          return {
            exerciseId: block.exerciseId,
            exerciseName: nameById.get(block.exerciseId)?.trim() || "Ejercicio",
            equipmentSlug: block.equipmentSlug,
            laterality: (block.laterality === "unilateral" ? "unilateral" : "bilateral") as
              | "bilateral"
              | "unilateral",
            sets: (block.sets ?? []).map((planned) => ({
              done: true,
              plannedReps: planned.reps ?? "",
              plannedWeight: planned.weight ?? "",
              actualReps: "",
              actualWeight: "",
              setType: planned.setType || "normal",
            })),
          };
        })
      : idsFromWorkout.map((exerciseId) => ({
          exerciseId,
          exerciseName: nameById.get(exerciseId)?.trim() || "Ejercicio",
          sets: [] as WorkoutSessionSnapshot["blocks"][number]["sets"],
        }));

  const totalSetsFromBlocks = blocks.reduce((sum, b) => sum + b.sets.length, 0);
  const totalSets = series?.total ?? totalSetsFromBlocks;
  const completedSets = series?.completed ?? totalSets;

  return {
    workoutTitle: workout.title?.trim() || workoutTitleFallback,
    completedSets,
    totalSets,
    completedExercises: blocks.length,
    totalExercises: blocks.length,
    blocks,
  };
}

let workoutsCache: Workout[] | null = null;
let exercisesCache: Exercise[] | null = null;

async function loadWorkoutsAndExercises(): Promise<[Workout[], Exercise[]]> {
  const [workouts, exercises] = await Promise.all([
    workoutsCache ? Promise.resolve(workoutsCache) : getWorkouts().then((w) => {
        workoutsCache = w;
        return w;
      }),
    exercisesCache ? Promise.resolve(exercisesCache) : getExercises().then((e) => {
        exercisesCache = e;
        return e;
      }),
  ]);
  return [workouts, exercises];
}

/** Resuelve snapshot para preview cuando la API o el listado no lo traen. */
export async function resolveSessionSnapshotForPreview(input: {
  workoutId: string;
  notes: string;
  workoutTitle: string;
  snapshot?: WorkoutSessionSnapshot | null;
}): Promise<WorkoutSessionSnapshot | null> {
  if (input.snapshot?.blocks?.length) return input.snapshot;
  try {
    const [workouts, exercises] = await loadWorkoutsAndExercises();
    const workout = workouts.find((w) => w.id === input.workoutId);
    return deriveSessionSnapshotFromWorkout(workout, exercises, input.notes, input.workoutTitle);
  } catch {
    return input.snapshot ?? null;
  }
}

export function clearSessionPreviewCaches() {
  workoutsCache = null;
  exercisesCache = null;
}
