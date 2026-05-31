import { workoutSetTypeLabel } from "../constants/workoutSetTypes";
import type { WorkoutSessionSnapshotSet } from "../types/workoutSessionSnapshot";
import { isTimedPerformSetType } from "./performSetExtras";

export type SessionSetDisplay = {
  kg: string | null;
  reps: string | null;
  timedNote?: string;
  planKg?: string | null;
  planReps?: string | null;
  extraLines: string[];
  rpe?: string;
  pending: boolean;
  setType: string;
  setTypeLabel: string;
};

function normNum(raw: string): string {
  return String(raw).replace(",", ".").trim();
}

function hasWeight(w: string): boolean {
  const n = Number(normNum(w));
  return Number.isFinite(n) && n > 0;
}

function hasReps(r: string): boolean {
  return String(r).trim().length > 0;
}

export function formatKgValue(weight: string): string | null {
  if (!hasWeight(weight)) return null;
  return `${normNum(weight)} kg`;
}

export function formatRepsValue(reps: string): string | null {
  if (!hasReps(reps)) return null;
  return String(reps).trim();
}

export function formatWorkDurationSec(raw?: string): string | null {
  const n = Number(String(raw ?? "").trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < 60) return `${n} s`;
  const m = Math.floor(n / 60);
  const s = n % 60;
  return s > 0 ? `${m}:${String(s).padStart(2, "0")} min` : `${m} min`;
}

function loadRepsEqual(aW: string, aR: string, bW: string, bR: string): boolean {
  return normNum(aW) === normNum(bW) && String(aR).trim() === String(bR).trim();
}

function formatSubStepsLine(
  setType: string,
  subSteps: WorkoutSessionSnapshotSet["subSteps"]
): string[] {
  if (!subSteps?.length) return [];
  const prefix = setType === "dropset" ? "↓" : "P";
  return subSteps
    .map((step, i) => {
      const kg = formatKgValue(step.weight);
      const reps = formatRepsValue(step.reps);
      if (!kg && !reps) return null;
      const parts = [kg, reps ? `${reps} reps` : null].filter(Boolean);
      return `${prefix}${i + 2} ${parts.join(" · ")}`;
    })
    .filter((line): line is string => line != null);
}

export function buildSessionSetDisplay(set: WorkoutSessionSnapshotSet): SessionSetDisplay {
  const setType = set.setType?.trim() || "normal";
  const setTypeLabel = workoutSetTypeLabel(setType);
  const timed = isTimedPerformSetType(setType);
  const planKg = formatKgValue(set.plannedWeight);
  const planReps = formatRepsValue(set.plannedReps);
  const extraLines = formatSubStepsLine(setType, set.subSteps);

  if (set.miniRestSec?.trim()) {
    const rest = formatWorkDurationSec(set.miniRestSec);
    if (rest) extraLines.unshift(`Pausa ${rest}`);
  }

  if (!set.done) {
    return {
      kg: planKg,
      reps: planReps,
      timedNote: timed ? formatWorkDurationSec(set.workDurationSec) ?? undefined : undefined,
      planKg: null,
      planReps: null,
      extraLines,
      setType,
      setTypeLabel,
      pending: true,
    };
  }

  const kg = formatKgValue(set.actualWeight);
  const reps = formatRepsValue(set.actualReps);
  const timedNote = timed ? formatWorkDurationSec(set.workDurationSec) ?? undefined : undefined;

  const showPlanKg =
    planKg && !loadRepsEqual(set.actualWeight, set.actualReps, set.plannedWeight, set.plannedReps)
      ? planKg
      : null;
  const showPlanReps =
    planReps && !loadRepsEqual(set.actualWeight, set.actualReps, set.plannedWeight, set.plannedReps)
      ? planReps
      : null;

  return {
    kg,
    reps,
    timedNote,
    planKg: showPlanKg,
    planReps: showPlanReps,
    extraLines,
    rpe: set.rpe?.trim() || undefined,
    setType,
    setTypeLabel,
    pending: false,
  };
}

export function isNonNormalSetType(setType: string): boolean {
  return setType !== "normal" && setType.length > 0;
}

export function countBlockSets(block: { sets: { done: boolean }[] }): number {
  return block.sets.length;
}
