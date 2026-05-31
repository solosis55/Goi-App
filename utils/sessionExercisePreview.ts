import type {
  WorkoutSessionSnapshot,
  WorkoutSessionSnapshotBlock,
  WorkoutSessionSnapshotSet,
} from "../types/workoutSessionSnapshot";
import { parseSessionNotesSummary } from "./buildSessionSnapshot";

export type SessionExercisePreview = {
  exerciseName: string;
  summary: string;
};

const DEFAULT_MAX_EXERCISES = 3;

function formatSetBrief(set: WorkoutSessionSnapshotSet): string {
  if (!set.done) return "";
  const w = set.actualWeight.trim().replace(",", ".");
  const r = set.actualReps.trim();
  if (w && r) return `${w} kg × ${r}`;
  if (r) return `${r} reps`;
  return "✓";
}

export function summarizeExerciseBlock(block: WorkoutSessionSnapshotBlock): string {
  const total = block.sets.length;
  const done = block.sets.filter((s) => s.done);
  if (total === 0) return "";
  if (done.length === 0) return `${total} series`;
  const lastDone = done[done.length - 1];
  const lastLabel = formatSetBrief(lastDone);
  if (done.length === 1 && lastLabel) return lastLabel;
  if (lastLabel) return `${done.length}/${total} ser. · ${lastLabel}`;
  return `${done.length}/${total} series`;
}

/** Primeros ejercicios de la sesión para mini-preview en posts Training. */
export function buildSessionExercisePreviews(
  snapshot?: WorkoutSessionSnapshot | null,
  maxExercises = DEFAULT_MAX_EXERCISES
): SessionExercisePreview[] {
  if (!snapshot?.blocks?.length) return [];
  return snapshot.blocks.slice(0, maxExercises).map((block) => ({
    exerciseName: block.exerciseName,
    summary: summarizeExerciseBlock(block),
  }));
}

export function countRemainingExercises(
  snapshot: WorkoutSessionSnapshot | null | undefined,
  shown: number
): number {
  const total = snapshot?.blocks?.length ?? 0;
  return Math.max(0, total - shown);
}

/** Fallback para sesiones antiguas sin snapshot (bloque «Por ejercicio» en notes). */
export function parseExercisePreviewsFromNotes(
  notes: string | null | undefined,
  maxExercises = DEFAULT_MAX_EXERCISES
): SessionExercisePreview[] {
  const parsed = parseSessionNotesSummary(notes ?? "");
  const body = parsed.bodyNotes.trim();
  if (!body) return [];
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines.slice(0, maxExercises).map((line) => {
    const colon = line.indexOf(":");
    if (colon > 0) {
      return {
        exerciseName: line.slice(0, colon).trim(),
        summary: line.slice(colon + 1).trim() || "—",
      };
    }
    return { exerciseName: line, summary: "" };
  });
}

export function resolveSessionExercisePreviews(input: {
  snapshot?: WorkoutSessionSnapshot | null;
  previews?: SessionExercisePreview[] | null;
  notes?: string | null;
  maxExercises?: number;
}): SessionExercisePreview[] {
  const max = input.maxExercises ?? DEFAULT_MAX_EXERCISES;
  const fromSnapshot = buildSessionExercisePreviews(input.snapshot, max);
  if (fromSnapshot.length > 0) return fromSnapshot;
  if (input.previews && input.previews.length > 0) return input.previews.slice(0, max);
  return parseExercisePreviewsFromNotes(input.notes, max);
}

export function resolveSessionMoreExercisesCount(input: {
  snapshot?: WorkoutSessionSnapshot | null;
  previews?: SessionExercisePreview[] | null;
  notes?: string | null;
  shown: number;
}): number {
  const totalFromSnapshot = input.snapshot?.blocks?.length ?? 0;
  if (totalFromSnapshot > 0) return countRemainingExercises(input.snapshot, input.shown);
  const fromNotes = parseExercisePreviewsFromNotes(input.notes, 99).length;
  return Math.max(0, fromNotes - input.shown);
}
