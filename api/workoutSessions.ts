import type {
  CreateWorkoutSessionInput,
  WorkoutSession,
  WorkoutSessionDetail,
  WorkoutSessionWithTitle,
} from "../types/workoutSession";
import type { SessionPickerPageResponse, SessionPickerQueryParams } from "../types/sessionPicker";
import { apiFetch, ApiError } from "./client";
import { getLinkedSessionIds } from "./posts";
import { buildSessionPickerPageFromList } from "../utils/sessionPickerClientFallback";

export function getWorkoutSessions() {
  return apiFetch<WorkoutSessionWithTitle[]>("/workout-sessions");
}

function pickerQueryString(params: SessionPickerQueryParams): string {
  const sp = new URLSearchParams();
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.workoutId) sp.set("workoutId", params.workoutId);
  if (params.from) sp.set("from", params.from);
  if (params.to) sp.set("to", params.to);
  if (params.cursor) sp.set("cursor", params.cursor);
  if (params.limit != null) sp.set("limit", String(params.limit));
  if (params.includeLinked === false) sp.set("includeLinked", "false");
  return sp.toString();
}

export async function getWorkoutSessionsPicker(params: SessionPickerQueryParams = {}) {
  const qs = pickerQueryString(params);
  try {
    return await apiFetch<SessionPickerPageResponse>(`/workout-sessions/picker${qs ? `?${qs}` : ""}`);
  } catch (err) {
    if (
      err instanceof ApiError &&
      (err.status === 404 || err.status === 405 || err.code === "API_INVALID_RESPONSE")
    ) {
      const [sessions, linked] = await Promise.all([getWorkoutSessions(), getLinkedSessionIds()]);
      return buildSessionPickerPageFromList(sessions, linked, params);
    }
    throw err;
  }
}

export function getWorkoutSession(id: string) {
  return apiFetch<WorkoutSessionDetail>(`/workout-sessions/${encodeURIComponent(id)}`);
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
