import { useEffect, useRef, useState } from "react";
import { getPostById, getPostMedia } from "../api/posts";
import type { Post } from "../types/post";
import { hasDisplayableMedia, needsLazyPostMedia, sanitizeForFeed } from "../utils/postMedia/display";

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

function mergeLazyMedia(base: Post, media: Post["media"]): Post {
  return sanitizeForFeed({
    ...base,
    media,
    hasMedia: (media?.length ?? 0) > 0 || base.hasMedia === true,
  });
}

/** Hidrata sesión vinculada y media legacy bajo demanda. */
export function usePostMediaHydration(post: Post): Post {
  const [hydrated, setHydrated] = useState(() => sanitizeForFeed(post));
  const lazyMediaAttemptedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    setHydrated(sanitizeForFeed(post));
  }, [post]);

  useEffect(() => {
    lazyMediaAttemptedRef.current.delete(post.id);
  }, [post.id]);

  useEffect(() => {
    if (!needsLazyPostMedia(post)) return;
    if (lazyMediaAttemptedRef.current.has(post.id)) return;
    lazyMediaAttemptedRef.current.add(post.id);

    let cancelled = false;

    void (async () => {
      try {
        const media = await getPostMedia(post.id);
        if (cancelled || !media?.length) return;
        setHydrated((prev) =>
          prev.id === post.id ? mergeLazyMedia(prev, media) : prev
        );
      } catch {
        /* red / timeout */
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [post]);

  useEffect(() => {
    if (!needsSessionDetail(post)) return;

    let cancelled = false;

    void (async () => {
      try {
        const full = await getPostById(post.id);
        if (cancelled || !full) return;
        setHydrated((prev) =>
          prev.id === post.id ? sanitizeForFeed(mergeSessionDetail(prev, full)) : prev
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
