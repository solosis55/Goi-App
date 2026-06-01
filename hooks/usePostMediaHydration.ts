import { useEffect, useState } from "react";
import { getPostById } from "../api/posts";
import type { Post } from "../types/post";
import { sanitizePostMedia } from "../utils/postDisplayMedia";

function needsSessionDetail(post: Post): boolean {
  if (!post.sessionId) return false;
  if ((post.sessionExercisePreviews?.length ?? 0) > 0) return false;
  return true;
}

function mergeSessionDetail(base: Post, patch: Partial<Post>): Post {
  return {
    ...base,
    sessionWorkoutTitle: patch.sessionWorkoutTitle ?? base.sessionWorkoutTitle,
    sessionPerformedAt: patch.sessionPerformedAt ?? base.sessionPerformedAt,
    sessionCompletedSets: patch.sessionCompletedSets ?? base.sessionCompletedSets,
    sessionTotalSets: patch.sessionTotalSets ?? base.sessionTotalSets,
    sessionCompletedExercises: patch.sessionCompletedExercises ?? base.sessionCompletedExercises,
    sessionTotalExercises: patch.sessionTotalExercises ?? base.sessionTotalExercises,
    sessionExercisePreviews: patch.sessionExercisePreviews?.length
      ? patch.sessionExercisePreviews
      : base.sessionExercisePreviews,
    sessionMoreExercisesCount: patch.sessionMoreExercisesCount ?? base.sessionMoreExercisesCount,
  };
}

/** Hidrata metadatos de sesión; nunca reutiliza media legacy del estado anterior. */
export function usePostMediaHydration(post: Post): Post {
  const [hydrated, setHydrated] = useState(() => sanitizePostMedia(post));

  useEffect(() => {
    setHydrated(sanitizePostMedia(post));
  }, [post]);

  useEffect(() => {
    if (!needsSessionDetail(post)) return;

    let cancelled = false;

    void (async () => {
      try {
        const full = await getPostById(post.id);
        if (cancelled || !full) return;
        setHydrated((prev) =>
          prev.id === post.id ? sanitizePostMedia(mergeSessionDetail(prev, full)) : prev
        );
      } catch {
        /* red / timeout */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [post]);

  return hydrated;
}
