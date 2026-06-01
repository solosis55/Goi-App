import type { Post } from "../types/post";
import { isPostMediaDataUrl, resolveFeedPostMediaUrl } from "./feedPostMediaUrl";

/** Quita data URLs y entradas sin URL usable en el feed. */
export function sanitizePostMedia(post: Post): Post {
  const media = (post.media ?? []).filter(
    (m) =>
      m?.type === "image" &&
      typeof m.url === "string" &&
      m.url.trim().length > 0 &&
      !isPostMediaDataUrl(m.url)
  );
  return media.length > 0 ? { ...post, media } : { ...post, media: undefined };
}

/** Imágenes que el carrusel del feed puede mostrar. */
export function postHasDisplayableMedia(post: Pick<Post, "media">): boolean {
  return (post.media ?? []).some(
    (m) => m.type === "image" && Boolean(m.url?.trim()) && Boolean(resolveFeedPostMediaUrl(m.url))
  );
}
