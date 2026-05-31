import type { WorkoutSessionSnapshot } from "../types/workoutSessionSnapshot";
import type { ActiveWorkoutSession, SessionPerformBlock } from "../types/workoutSessionPerform";

type PerformProgress = {
  completedSets: number;
  totalSets: number;
  completedExercises: number;
  totalExercises: number;
};

function parseWeightKg(raw: string): number {
  const n = Number(String(raw).replace(",", ".").trim());
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function parseReps(raw: string): number {
  const n = Number(String(raw).trim());
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export function computeSessionVolumeKg(blocks: SessionPerformBlock[]): number {
  let total = 0;
  for (const block of blocks) {
    for (const row of block.sets) {
      if (!row.done) continue;
      const w = parseWeightKg(row.actualWeight);
      const r = parseReps(row.actualReps);
      if (w > 0 && r > 0) total += w * r;
    }
  }
  return Math.round(total);
}

export function computeSessionDurationSec(startedAt: string, totalPausedMs = 0): number | undefined {
  const start = Date.parse(startedAt);
  if (!Number.isFinite(start)) return undefined;
  const elapsed = Math.max(0, Date.now() - start - totalPausedMs);
  return Math.round(elapsed / 1000);
}

export function buildSessionSnapshotFromPerform(
  session: ActiveWorkoutSession,
  progress: PerformProgress,
  exerciseName: (exerciseId: string) => string
): WorkoutSessionSnapshot {
  return {
    workoutTitle: session.workoutTitle,
    completedSets: progress.completedSets,
    totalSets: progress.totalSets,
    completedExercises: progress.completedExercises,
    totalExercises: progress.totalExercises,
    durationSec: computeSessionDurationSec(session.startedAt, session.totalPausedMs ?? 0),
    volumeKg: computeSessionVolumeKg(session.blocks),
    blocks: session.blocks.map((block) => ({
      exerciseId: block.exerciseId,
      exerciseName: exerciseName(block.exerciseId),
      notes: block.notes?.trim() || undefined,
      equipmentSlug: block.equipmentSlug?.trim() || undefined,
      laterality: block.laterality === "unilateral" ? "unilateral" : "bilateral",
      sets: block.sets.map((row) => ({
        done: row.done,
        plannedReps: row.planned.reps,
        plannedWeight: row.planned.weight,
        actualReps: row.actualReps,
        actualWeight: row.actualWeight,
        rpe: row.rpe?.trim() || undefined,
        setType: row.planned.setType?.trim() || "normal",
        workDurationSec: row.workDurationSec?.trim() || undefined,
        miniRestSec: row.miniRestSec?.trim() || undefined,
        subSteps: row.subSteps?.length
          ? row.subSteps.map((step) => ({
              weight: step.weight,
              reps: step.reps,
            }))
          : undefined,
      })),
    })),
  };
}

/** Extrae métricas de la primera línea de notes (sesiones antiguas sin snapshot). */
export function parseSessionNotesSummary(notes: string): {
  setsLabel: string | null;
  bodyNotes: string;
} {
  const trimmed = notes.trim();
  if (!trimmed) return { setsLabel: null, bodyNotes: "" };
  const lines = trimmed.split("\n");
  const first = lines[0]?.trim() ?? "";
  const setsMatch = /^(\d+\/\d+)\s+series completadas$/i.test(first);
  const setsLabel = setsMatch ? first.match(/^(\d+\/\d+)/)?.[1] ?? null : null;
  const bodyStart = setsMatch ? 1 : 0;
  let body = lines.slice(bodyStart).join("\n").trim();
  if (body.startsWith("--- Por ejercicio ---")) {
    body = body.replace(/^--- Por ejercicio ---\n?/, "").trim();
  }
  return { setsLabel, bodyNotes: body };
}

export function formatDurationLabel(totalSec?: number): string | null {
  if (totalSec == null || totalSec <= 0) return null;
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  if (m <= 0) return `${s} s`;
  return s > 0 ? `${m} min ${s} s` : `${m} min`;
}
