import type {
  CreateWorkoutSessionInput,
  WorkoutSession,
  WorkoutSessionWithTitle,
} from "../types/workoutSession";
import { apiFetch } from "./client";

export function getWorkoutSessions() {
  return apiFetch<WorkoutSessionWithTitle[]>("/workout-sessions");
}

export function createWorkoutSession(input: CreateWorkoutSessionInput) {
  return apiFetch<WorkoutSession>("/workout-sessions", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function deleteWorkoutSession(id: string) {
  return apiFetch<{ message: string }>(`/workout-sessions/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}
