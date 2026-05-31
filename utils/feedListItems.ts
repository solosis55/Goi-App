import type { FeedWorkoutEvent } from "../types/post";
import type { Post } from "../types/post";
import { feedDayKey, formatFeedDayLabel } from "./feedPostDate";

export type FeedListItem =
  | { kind: "day"; key: string; label: string }
  | { kind: "post"; key: string; post: Post }
  | { kind: "workout"; key: string; event: FeedWorkoutEvent }
  | { kind: "suggestions"; key: string };

export type BuildFeedListItemsOptions = {
  insertSuggestions?: boolean;
  suggestionsAfterPostCount?: number;
};

export function postsFromTimeline(
  items: Array<{ kind: "post"; post: Post } | { kind: "workout"; event: FeedWorkoutEvent }>
): Post[] {
  return items.filter((i): i is { kind: "post"; post: Post } => i.kind === "post").map((i) => i.post);
}

export function buildFeedListItems(
  timeline: Array<{ kind: "post"; post: Post } | { kind: "workout"; event: FeedWorkoutEvent }>,
  options?: BuildFeedListItemsOptions
): FeedListItem[] {
  const items: FeedListItem[] = [];
  let lastDay = "";
  let postCount = 0;
  const insertAfter = options?.insertSuggestions
    ? Math.max(1, options.suggestionsAfterPostCount ?? 2)
    : null;

  for (const entry of timeline) {
    const at = entry.kind === "post" ? entry.post.createdAt : entry.event.performedAt;
    const dk = feedDayKey(at);
    if (dk && dk !== lastDay) {
      lastDay = dk;
      const label = formatFeedDayLabel(at);
      if (label) items.push({ kind: "day", key: `day-${dk}`, label });
    }

    if (entry.kind === "post") {
      items.push({ kind: "post", key: entry.post.id, post: entry.post });
      postCount += 1;
      if (insertAfter != null && postCount === insertAfter) {
        items.push({ kind: "suggestions", key: "feed-suggestions-inline" });
      }
    } else {
      items.push({ kind: "workout", key: `workout-${entry.event.id}`, event: entry.event });
    }
  }

  return items;
}

export function feedListIndexForPostId(items: FeedListItem[], postId: string): number {
  return items.findIndex((item) => item.kind === "post" && item.post.id === postId);
}

export function countPostsInList(items: FeedListItem[]): number {
  return items.filter((i) => i.kind === "post").length;
}

/** Reutiliza ítems de lista cuyo contenido no cambió (misma ref de post/evento). */
export function reuseFeedListItems(next: FeedListItem[], prev: FeedListItem[] | null): FeedListItem[] {
  if (!prev || prev.length !== next.length) return next;
  let same = true;
  const merged = next.map((item, i) => {
    const old = prev[i];
    if (!old || old.kind !== item.kind || old.key !== item.key) {
      same = false;
      return item;
    }
    if (item.kind === "post" && old.kind === "post" && item.post === old.post) return old;
    if (item.kind === "workout" && old.kind === "workout" && item.event === old.event) return old;
    if (item.kind === "day" && old.kind === "day" && item.label === old.label) return old;
    if (item.kind === "suggestions" && old.kind === "suggestions") return old;
    same = false;
    return item;
  });
  return same ? prev : merged;
}
