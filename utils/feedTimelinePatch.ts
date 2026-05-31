import type { FeedTimelineItemDto, Post } from "../types/post";

/** Actualiza un post en el timeline; devuelve la misma referencia si no hay cambios. */
export function patchTimelinePost(
  timeline: FeedTimelineItemDto[],
  postId: string,
  updater: (post: Post) => Post
): FeedTimelineItemDto[] {
  let index = -1;
  for (let i = 0; i < timeline.length; i++) {
    const entry = timeline[i];
    if (entry.kind === "post" && entry.post.id === postId) {
      index = i;
      break;
    }
  }
  if (index < 0) return timeline;

  const entry = timeline[index];
  if (entry.kind !== "post") return timeline;

  const nextPost = updater(entry.post);
  if (nextPost === entry.post) return timeline;

  const next = timeline.slice();
  next[index] = { kind: "post", post: nextPost };
  return next;
}
