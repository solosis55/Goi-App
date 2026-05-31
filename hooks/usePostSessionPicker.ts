import { useCallback, useEffect, useMemo, useState } from "react";
import { getPosts } from "../api/posts";
import { getWorkoutSessions } from "../api/workoutSessions";
import type { WorkoutSessionWithTitle } from "../types/workoutSession";

export function usePostSessionPicker(userId: string | undefined) {
  const [sessions, setSessions] = useState<WorkoutSessionWithTitle[]>([]);
  const [linkedSessionIds, setLinkedSessionIds] = useState<Set<string>>(() => new Set());
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setSessions([]);
      setLinkedSessionIds(new Set());
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [list, posts] = await Promise.all([getWorkoutSessions(), getPosts()]);
      const linked = new Set(
        posts.filter((p) => p.userId === userId && p.sessionId).map((p) => p.sessionId as string)
      );
      setLinkedSessionIds(linked);
      setSessions(
        list
          .filter((s) => s.userId === userId)
          .sort((a, b) => b.performedAt.localeCompare(a.performedAt))
      );
    } catch {
      setSessions([]);
      setLinkedSessionIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const available = useMemo(
    () => sessions.filter((s) => !linkedSessionIds.has(s.id)),
    [sessions, linkedSessionIds]
  );

  const getSession = useCallback(
    (id: string | null) => (id ? sessions.find((s) => s.id === id) ?? null : null),
    [sessions]
  );

  return {
    sessions,
    available,
    linkedSessionIds,
    loading,
    refresh,
    getSession,
  };
}
