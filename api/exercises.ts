import type { Exercise } from "../types/exercise";
import { legacyApiFetch as apiFetch } from "./client";

export function getExercises() {
  return apiFetch<Exercise[]>("/exercises");
}

export function getExercise(id: string) {
  return apiFetch<Exercise>(`/exercises/${encodeURIComponent(id)}`);
}
