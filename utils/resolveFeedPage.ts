import type { FeedPageResponse, Post } from "../types/post";
import { encodePostCursor } from "./postCursor";

/**
 * Si la API devuelve una página llena sin `hasMore`/`nextCursor` (Render sin desplegar),
 * infiere cursor desde el último post para que el cliente pueda pedir la página siguiente.
 */
export function resolveFeedPagePagination(page: FeedPageResponse, limit: number): FeedPageResponse {
  if (page.hasMore && page.nextCursor) return page;

  const postItems = page.items.filter(
    (item): item is { kind: "post"; post: Post } => item.kind === "post"
  );
  const lastPost = postItems[postItems.length - 1]?.post;
  if (!lastPost || postItems.length < limit) return page;

  return {
    ...page,
    hasMore: true,
    nextCursor: encodePostCursor(lastPost),
  };
}
