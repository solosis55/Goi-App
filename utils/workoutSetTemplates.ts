import type { WorkoutExerciseBlock, WorkoutSetRow } from "../types/workout";

export type SetTemplateId = "3x10" | "5x5" | "4x12";

export function blockSetsAreEmpty(block: WorkoutExerciseBlock): boolean {
  return block.sets.length > 0 && block.sets.every((s) => !s.reps.trim() && !s.weight.trim());
}

function buildTemplate(reps: string, count: number): WorkoutSetRow[] {
  return Array.from({ length: count }, () => ({
    reps,
    weight: "",
    setType: "normal" as const,
  }));
}

export const SET_TEMPLATES: { id: SetTemplateId; label: string; sets: () => WorkoutSetRow[] }[] = [
  { id: "3x10", label: "3×10", sets: () => buildTemplate("10", 3) },
  { id: "5x5", label: "5×5", sets: () => buildTemplate("5", 5) },
  { id: "4x12", label: "4×12", sets: () => buildTemplate("12", 4) },
];

export function applySetsTemplate(block: WorkoutExerciseBlock, templateId: SetTemplateId): WorkoutExerciseBlock {
  const tpl = SET_TEMPLATES.find((t) => t.id === templateId);
  if (!tpl) return block;
  return { ...block, sets: tpl.sets() };
}

/** @deprecated Usa applySetsTemplate(block, "3x10") */
export function applySetsTemplate3x10(block: WorkoutExerciseBlock): WorkoutExerciseBlock {
  return applySetsTemplate(block, "3x10");
}
