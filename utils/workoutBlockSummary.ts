import type { WorkoutExerciseBlock } from "../types/workout";

/** Resumen compacto para tarjeta colapsada en el editor. */
export function workoutBlockCollapsedSummary(block: WorkoutExerciseBlock): string {
  const { sets } = block;
  if (!sets.length) return "Sin series";

  const n = sets.length;
  const reps = sets.map((s) => s.reps.trim() || "—");
  const kg = sets.map((s) => s.weight.trim());

  const sameReps = reps.every((r) => r === reps[0]) && reps[0] !== "—";
  const filledKg = kg.filter(Boolean);
  const sameKg = filledKg.length === n && filledKg.every((w) => w === filledKg[0]);

  if (sameReps && sameKg && filledKg[0]) {
    return `${n} × ${reps[0]} @ ${filledKg[0]} kg`;
  }
  if (sameReps) {
    return `${n} × ${reps[0]} reps`;
  }

  const nums = reps
    .map((r) => parseInt(r.replace(/\D/g, ""), 10))
    .filter((x) => !Number.isNaN(x));
  if (nums.length >= 2) {
    const min = Math.min(...nums);
    const max = Math.max(...nums);
    const repPart = min === max ? `${min}` : `${min}–${max}`;
    if (sameKg && filledKg[0]) return `${n} × ${repPart} @ ${filledKg[0]} kg`;
    return `${n} × ${repPart} reps`;
  }

  return `${n} serie${n === 1 ? "" : "s"}`;
}

/** Píldoras por serie para vista colapsada (p. ej. «10 · 10 · 8»). */
export function workoutBlockCollapsedSetPills(block: WorkoutExerciseBlock): string[] {
  return block.sets.map((s) => {
    const r = s.reps.trim();
    const w = s.weight.trim();
    if (r && w) return `${r}@${w}`;
    if (r) return r;
    if (w) return `${w}kg`;
    return "—";
  });
}

export function shouldShowCollapsedPills(block: WorkoutExerciseBlock): boolean {
  return block.sets.length >= 4;
}
