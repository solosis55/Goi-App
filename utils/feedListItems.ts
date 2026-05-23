import type { Post } from "../types/post";
import { feedDayKey, formatFeedDayLabel } from "./feedPostDate";

export type FeedListItem =
  | { kind: "day"; key: string; label: string }
  | { kind: "post"; key: string; post: Post };

export function buildFeedListItems(posts: Post[]): FeedListItem[] {
  const items: FeedListItem[] = [];
  let lastDay = "";

  for (const post of posts) {
    const dk = feedDayKey(post.createdAt);
    if (dk && dk !== lastDay) {
      lastDay = dk;
      const label = formatFeedDayLabel(post.createdAt);
      if (label) items.push({ kind: "day", key: `day-${dk}`, label });
    }
    items.push({ kind: "post", key: post.id, post });
  }

  return items;
}

export function feedListIndexForPostId(items: FeedListItem[], postId: string): number {
  return items.findIndex((item) => item.kind === "post" && item.post.id === postId);
}
