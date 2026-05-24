import type { Post } from "../types/post";
import { feedDayKey, formatFeedDayLabel } from "./feedPostDate";

export type FeedListItem =
  | { kind: "day"; key: string; label: string }
  | { kind: "post"; key: string; post: Post }
  | { kind: "suggestions"; key: string };

export type BuildFeedListItemsOptions = {
  insertSuggestions?: boolean;
  /** Insertar tras el post número N (1-based). */
  suggestionsAfterPostCount?: number;
};

export function buildFeedListItems(
  posts: Post[],
  options?: BuildFeedListItemsOptions
): FeedListItem[] {
  const items: FeedListItem[] = [];
  let lastDay = "";
  let postCount = 0;
  const insertAfter = options?.insertSuggestions
    ? Math.max(1, options.suggestionsAfterPostCount ?? 3)
    : null;

  for (const post of posts) {
    const dk = feedDayKey(post.createdAt);
    if (dk && dk !== lastDay) {
      lastDay = dk;
      const label = formatFeedDayLabel(post.createdAt);
      if (label) items.push({ kind: "day", key: `day-${dk}`, label });
    }
    items.push({ kind: "post", key: post.id, post });
    postCount += 1;
    if (insertAfter != null && postCount === insertAfter) {
      items.push({ kind: "suggestions", key: "feed-suggestions-inline" });
    }
  }

  return items;
}

export function feedListIndexForPostId(items: FeedListItem[], postId: string): number {
  return items.findIndex((item) => item.kind === "post" && item.post.id === postId);
}
