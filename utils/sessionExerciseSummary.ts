import { equipmentLabel } from "../constants/exerciseEquipment";
import type { WorkoutSessionSnapshotBlock, WorkoutSessionSnapshotSet } from "../types/workoutSessionSnapshot";
import type { ExerciseLastPerformance } from "./exerciseLastPerformance";
import { formatKgValue, formatRepsValue } from "./sessionSetDisplay";

export type SetHighlight = "pr" | "top" | null;

export type SetGroupSection = {
  key: string;
  label: string;
  items: { index: number; set: WorkoutSessionSnapshotSet }[];
};

type SetTypeCategory = "warmup" | "work" | "intensity";

function setTypeCategory(setType: string): SetTypeCategory {
  if (setType === "calentamiento") return "warmup";
  if (setType === "dropset" || setType === "rest_pause" || setType === "amrap" || setType === "tempo") {
    return "intensity";
  }
  return "work";
}

const CATEGORY_LABEL: Record<SetTypeCategory, string> = {
  warmup: "Calentamiento",
  work: "Trabajo",
  intensity: "Intensidad",
};

function parseNum(raw: string): number {
  const n = Number(String(raw).replace(",", ".").trim());
  return Number.isFinite(n) ? n : 0;
}

function setVolumeScore(set: WorkoutSessionSnapshotSet): number {
  if (!set.done) return 0;
  const w = parseNum(set.actualWeight);
  const r = parseNum(set.actualReps);
  return w > 0 && r > 0 ? w * r : r > 0 ? r : w;
}

function compactSetLabel(set: WorkoutSessionSnapshotSet): string | null {
  if (!set.done) return null;
  const kg = formatKgValue(set.actualWeight);
  const reps = formatRepsValue(set.actualReps);
  if (kg && reps) {
    const w = kg.replace(/\s*kg$/, "");
    return `${w}×${reps}`;
  }
  if (kg) return kg.replace(/\s*kg$/, "");
  if (reps) return reps;
  return null;
}

/** Línea compacta bajo el nombre: «60×10 · 80×8 · 80×6». */
export function buildExerciseQuickSummary(sets: WorkoutSessionSnapshotSet[]): string {
  const parts = sets.map(compactSetLabel).filter((p): p is string => Boolean(p));
  if (parts.length > 0) return parts.join(" · ");
  const done = sets.filter((s) => s.done).length;
  if (done > 0) return `${done} series registradas`;
  return "";
}

/** Agrupa series por categoría (calentamiento / trabajo / intensidad). */
export function groupSetsByCategory(sets: WorkoutSessionSnapshotSet[]): SetGroupSection[] {
  if (sets.length === 0) return [];
  const buckets: Record<SetTypeCategory, SetGroupSection["items"]> = {
    warmup: [],
    work: [],
    intensity: [],
  };

  sets.forEach((set, index) => {
    const cat = setTypeCategory(set.setType?.trim() || "normal");
    buckets[cat].push({ index, set });
  });

  const order: SetTypeCategory[] = ["warmup", "work", "intensity"];
  return order
    .filter((cat) => buckets[cat].length > 0)
    .map((cat) => ({
      key: cat,
      label: CATEGORY_LABEL[cat],
      items: buckets[cat],
    }));
}

export function computeSetHighlights(
  block: WorkoutSessionSnapshotBlock,
  lastPerformance?: ExerciseLastPerformance | null
): Map<number, SetHighlight> {
  const out = new Map<number, SetHighlight>();
  let topIndex = -1;
  let topScore = 0;

  block.sets.forEach((set, index) => {
    if (!set.done) return;
    const score = setVolumeScore(set);
    if (score > topScore) {
      topScore = score;
      topIndex = index;
    }
  });

  if (topIndex >= 0 && topScore > 0) {
    const topSet = block.sets[topIndex]!;
    let isPr = false;
    if (lastPerformance) {
      const w = parseNum(topSet.actualWeight);
      const r = parseNum(topSet.actualReps);
      const pw = parseNum(lastPerformance.weight);
      const pr = parseNum(lastPerformance.reps);
      isPr = w > pw || (w === pw && r > pr) || (pw <= 0 && w > 0);
    }
    out.set(topIndex, isPr ? "pr" : "top");
  }

  return out;
}

export function sessionBlockMetaLine(meta: {
  laterality?: "bilateral" | "unilateral";
  equipmentSlug?: string;
  equipmentLabel?: string | null;
}): string {
  const parts: string[] = [];
  parts.push(meta.laterality === "unilateral" ? "Unilateral" : "Bilateral");
  const eq = meta.equipmentLabel ?? equipmentLabel(meta.equipmentSlug);
  if (eq) parts.push(eq);
  return parts.join(" · ");
}
