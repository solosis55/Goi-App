import type { Post } from "../../types/post";
import { isDataUrl, resolveUrl } from "./url";

/** Quita data URLs y entradas sin URL usable en el feed. */
export function sanitizeForFeed(post: Post): Post {
  const media = (post.media ?? []).filter(
    (m) =>
      m?.type === "image" &&
      typeof m.url === "string" &&
      m.url.trim().length > 0 &&
      !isDataUrl(m.url)
  );
  return media.length > 0 ? { ...post, media } : { ...post, media: undefined };
}

export function hasDisplayableMedia(post: Pick<Post, "media">): boolean {
  return (post.media ?? []).some(
    (m) => m.type === "image" && Boolean(m.url?.trim()) && Boolean(resolveUrl(m.url))
  );
}

/** Post con fotos en servidor pero sin URL usable en el payload del feed. */
export function needsLazyPostMedia(post: Pick<Post, "hasMedia" | "media">): boolean {
  if (hasDisplayableMedia(post)) return false;
  if (post.hasMedia === true) return true;
  return (post.media ?? []).some((m) => typeof m?.url === "string" && m.url.trim().length > 0);
}
