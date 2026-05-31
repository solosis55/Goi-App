import type { FeedScope } from "../constants/feed";
import type { FeedWorkoutEvent, Post } from "../types/post";

export function filterMutedTimeline<T extends { kind: "post"; post: Post } | { kind: "workout"; event: FeedWorkoutEvent }>(
  timeline: T[],
  mutedUserIds: Set<string>
): T[] {
  return timeline.filter((entry) => {
    const uid = entry.kind === "post" ? entry.post.userId : entry.event.userId;
    return !mutedUserIds.has(uid);
  });
}

export function countFeedPosts(
  timeline: Array<{ kind: "post"; post: Post } | { kind: "workout"; event: FeedWorkoutEvent }>
): number {
  return timeline.filter((e) => e.kind === "post").length;
}

export function feedScopeEmptyMessage(scope: FeedScope): { title: string; body: string } {
  if (scope === "following") {
    return {
      title: "Tu red aún no publica",
      body: "Sigue atletas en Social o entrena y comparte tu primera sesión.",
    };
  }
  return {
    title: "Aún no hay publicaciones",
    body: "Sé el primero en publicar o explora la comunidad en Social.",
  };
}

export function postEligibleForGoldBeam(post: Post): boolean {
  return Boolean(post.workoutId) || (post.media?.length ?? 0) > 0;
}
