import type { SessionPickerItem, SessionPickerPageResponse, SessionPickerQueryParams } from "../types/sessionPicker";
import type { WorkoutSessionWithTitle } from "../types/workoutSession";
import { filterSessionsByQuery } from "./sessionPickerFilter";

function toPickerItem(session: WorkoutSessionWithTitle, linkedIds: Set<string>): SessionPickerItem {
  return {
    id: session.id,
    userId: session.userId,
    workoutId: session.workoutId,
    performedAt: session.performedAt,
    notes: session.notes,
    createdAt: session.createdAt,
    workoutTitle: session.workoutTitle,
    snapshot: session.snapshot,
    linkedPostId: linkedIds.has(session.id) ? "linked" : null,
  };
}

function buildRoutineOptions(sessions: SessionPickerItem[]) {
  const counts = new Map<string, { workoutTitle: string; sessionCount: number }>();
  for (const session of sessions) {
    const prev = counts.get(session.workoutId);
    if (prev) prev.sessionCount += 1;
    else counts.set(session.workoutId, { workoutTitle: session.workoutTitle, sessionCount: 1 });
  }
  return [...counts.entries()]
    .map(([workoutId, meta]) => ({ workoutId, ...meta }))
    .sort((a, b) => a.workoutTitle.localeCompare(b.workoutTitle, "es"));
}

function isBeforeCursor(session: SessionPickerItem, cursor: string): boolean {
  const [performedAt, id] = cursor.split("|");
  if (!performedAt || !id) return true;
  const ta = Date.parse(session.performedAt);
  const tb = Date.parse(performedAt);
  if (ta < tb) return true;
  if (ta > tb) return false;
  return session.id < id;
}

/** Fallback local cuando `/workout-sessions/picker` no existe en el servidor (p. ej. Render sin deploy). */
export function buildSessionPickerPageFromList(
  sessions: WorkoutSessionWithTitle[],
  linkedSessionIds: string[],
  params: SessionPickerQueryParams = {},
): SessionPickerPageResponse {
  const linkedIds = new Set(linkedSessionIds);
  let rows = sessions.map((s) => toPickerItem(s, linkedIds));

  if (params.workoutId) rows = rows.filter((s) => s.workoutId === params.workoutId);

  const fromMs = params.from ? Date.parse(params.from) : NaN;
  const toMs = params.to ? Date.parse(params.to) : NaN;
  if (Number.isFinite(fromMs)) rows = rows.filter((s) => Date.parse(s.performedAt) >= fromMs);
  if (Number.isFinite(toMs)) rows = rows.filter((s) => Date.parse(s.performedAt) <= toMs);

  if (params.q?.trim()) {
    const filtered = filterSessionsByQuery(rows as WorkoutSessionWithTitle[], params.q);
    const ids = new Set(filtered.map((s) => s.id));
    rows = rows.filter((s) => ids.has(s.id));
  }

  if (params.includeLinked === false) rows = rows.filter((s) => !s.linkedPostId);

  rows.sort((a, b) => b.performedAt.localeCompare(a.performedAt) || b.id.localeCompare(a.id));

  const routineOptions = params.cursor ? [] : buildRoutineOptions(rows);

  if (params.cursor) rows = rows.filter((s) => isBeforeCursor(s, params.cursor!));

  const limit = Math.min(50, Math.max(1, params.limit ?? 25));
  const page = rows.slice(0, limit);
  const hasMore = rows.length > limit;
  const last = page[page.length - 1];

  return {
    sessions: page,
    nextCursor: hasMore && last ? `${last.performedAt}|${last.id}` : null,
    hasMore,
    routineOptions,
  };
}
