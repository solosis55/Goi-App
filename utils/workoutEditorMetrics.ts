import type { WorkoutExerciseBlock } from "../types/workout";

export function countWorkoutSets(blocks: WorkoutExerciseBlock[]): number {
  return blocks.reduce((sum, b) => sum + b.sets.length, 0);
}

export function parseTagsInput(raw: string): string[] {
  return raw
    .split(/[,;\n]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function tagsToInputValue(tags: string[]): string {
  return tags.filter(Boolean).join(", ");
}
