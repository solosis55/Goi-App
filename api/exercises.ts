import type { Exercise } from "../types/exercise";
import { apiFetch } from "./client";

export function getExercises() {
  return apiFetch<Exercise[]>("/exercises");
}

export function getExercise(id: string) {
  return apiFetch<Exercise>(`/exercises/${encodeURIComponent(id)}`);
}
