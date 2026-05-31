import type { FeedNotification } from "../types/post";

export function commentIdFromNotification(n: FeedNotification): string | undefined {
  if (n.commentId) return n.commentId;
  if (n.type !== "comment") return undefined;
  const prefix = "comment:";
  if (n.id.startsWith(prefix)) return n.id.slice(prefix.length);
  return undefined;
}
