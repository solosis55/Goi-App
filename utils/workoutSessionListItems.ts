import type { WorkoutSessionWithTitle } from "../types/workoutSession";
import { groupSessionsByDay } from "./workoutSessionGroups";

export type WorkoutSessionListItem =
  | { kind: "sectionHeader"; key: string; label: string }
  | { kind: "session"; key: string; session: WorkoutSessionWithTitle };

export function buildWorkoutSessionListItems(
  sessions: WorkoutSessionWithTitle[]
): WorkoutSessionListItem[] {
  const groups = groupSessionsByDay(sessions);
  const items: WorkoutSessionListItem[] = [];
  for (const group of groups) {
    items.push({ kind: "sectionHeader", key: `day-${group.key}`, label: group.label });
    for (const session of group.sessions) {
      items.push({ kind: "session", key: session.id, session });
    }
  }
  return items;
}
