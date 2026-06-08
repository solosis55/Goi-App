import type { Post } from "../../types/post";

export function thumbnailUrl(post: Post): string | null {
  const img = post.media?.find((m) => m.type === "image");
  return img?.url?.trim() || null;
}
