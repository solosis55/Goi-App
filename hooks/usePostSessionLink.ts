import { useCallback, useState, type Dispatch, type SetStateAction } from "react";
import { getWorkoutSession } from "../api/workoutSessions";
import { sessionPostTemplate } from "../constants/createPostPrompts";
import type { PostFormat } from "../constants/postFormat";
import type { WorkoutSessionSnapshot } from "../types/workoutSessionSnapshot";
import { resolveSessionSnapshotForPreview } from "../utils/deriveSessionSnapshotFromWorkout";
import { applySessionMeta, type SessionSelectMeta } from "./createPost/types";

export function usePostSessionLink(postFormat: PostFormat, setContent: Dispatch<SetStateAction<string>>) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionWorkoutTitle, setSessionWorkoutTitle] = useState<string | null>(null);
  const [sessionPerformedAt, setSessionPerformedAt] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState<string | null>(null);
  const [sessionCompletedSets, setSessionCompletedSets] = useState<number | null>(null);
  const [sessionTotalSets, setSessionTotalSets] = useState<number | null>(null);
  const [sessionCompletedExercises, setSessionCompletedExercises] = useState<number | null>(null);
  const [sessionTotalExercises, setSessionTotalExercises] = useState<number | null>(null);
  const [sessionSnapshot, setSessionSnapshot] = useState<WorkoutSessionSnapshot | null>(null);
  const [suggestedSessionId, setSuggestedSessionId] = useState<string | null>(null);

  const applySessionFields = useCallback(
    (id: string | null, meta?: SessionSelectMeta) => {
      setSessionId(id);
      const applied = applySessionMeta(meta);
      setSessionWorkoutTitle(applied.sessionWorkoutTitle);
      setSessionPerformedAt(applied.sessionPerformedAt);
      setSessionNotes(applied.sessionNotes);
      setSessionCompletedSets(applied.sessionCompletedSets);
      setSessionTotalSets(applied.sessionTotalSets);
      setSessionCompletedExercises(applied.sessionCompletedExercises);
      setSessionTotalExercises(applied.sessionTotalExercises);
      setSessionSnapshot(meta?.snapshot ?? null);
      if (id && meta?.workoutTitle && postFormat === "training") {
        setContent((prev) => (prev.trim() ? prev : sessionPostTemplate(meta.workoutTitle)));
      }
    },
    [postFormat, setContent]
  );

  const applyLinkedSession = useCallback(
    (
      id: string,
      title: string | null,
      performedAt: string | null,
      notes: string | null,
      snapshot: WorkoutSessionSnapshot | null
    ) => {
      setSessionId(id);
      if (title && performedAt) {
        applySessionFields(id, {
          workoutTitle: title,
          performedAt,
          notes: notes ?? undefined,
          snapshot,
        });
      }
    },
    [applySessionFields]
  );

  const enrichSessionMeta = useCallback(async (id: string, meta?: SessionSelectMeta): Promise<SessionSelectMeta> => {
    let workoutTitle = meta?.workoutTitle ?? "";
    let performedAt = meta?.performedAt ?? new Date().toISOString();
    let notes = meta?.notes ?? "";
    let snapshot = meta?.snapshot ?? null;
    let workoutId = meta?.workoutId;

    if (!snapshot?.blocks?.length) {
      try {
        const detail = await getWorkoutSession(id);
        workoutTitle = detail.workoutTitle;
        performedAt = detail.performedAt;
        notes = detail.notes;
        snapshot = detail.snapshot ?? null;
        workoutId = detail.workoutId;
      } catch {
        /* list meta only */
      }
    }

    if (!snapshot?.blocks?.length && workoutId) {
      snapshot = await resolveSessionSnapshotForPreview({
        workoutId,
        notes,
        workoutTitle,
        snapshot,
      });
    }

    return {
      workoutTitle,
      performedAt,
      notes,
      snapshot,
    };
  }, []);

  const selectSession = useCallback(
    async (id: string | null, meta?: SessionSelectMeta) => {
      if (!id) {
        applySessionFields(null, undefined);
        return;
      }
      const resolvedMeta = await enrichSessionMeta(id, meta);
      applySessionFields(id, resolvedMeta);
    },
    [applySessionFields, enrichSessionMeta]
  );

  const restoreSessionBasics = useCallback((id: string | null, title: string | null) => {
    setSessionId(id);
    setSessionWorkoutTitle(title);
  }, []);

  const clearSession = useCallback(() => {
    setSessionId(null);
    setSessionWorkoutTitle(null);
    setSessionPerformedAt(null);
    setSessionNotes(null);
    setSessionCompletedSets(null);
    setSessionTotalSets(null);
    setSessionCompletedExercises(null);
    setSessionTotalExercises(null);
    setSessionSnapshot(null);
    setSuggestedSessionId(null);
  }, []);

  return {
    sessionId,
    sessionWorkoutTitle,
    sessionPerformedAt,
    sessionNotes,
    sessionCompletedSets,
    sessionTotalSets,
    sessionCompletedExercises,
    sessionTotalExercises,
    sessionSnapshot,
    suggestedSessionId,
    selectSession,
    applySessionFields,
    applyLinkedSession,
    restoreSessionBasics,
    enrichSessionMeta,
    clearSession,
    setSuggestedSessionId,
  };
}
