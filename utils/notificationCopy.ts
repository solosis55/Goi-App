import type { FeedNotification } from "../types/post";

export function notificationLine(n: FeedNotification): string {
  if (n.type === "follow") return "empezó a seguirte";
  if (n.type === "comment") {
    const preview = n.commentPreview?.trim();
    return preview
      ? `comentó: «${preview.slice(0, 80)}${preview.length > 80 ? "…" : ""}»`
      : "comentó tu publicación";
  }
  return "le gustó tu publicación";
}
