export type FeedScope = "all" | "following";

export const FEED_SCOPES: ReadonlyArray<{ id: FeedScope; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "following", label: "Seguidos" },
] as const;

export const FEED_SCOPE_STORAGE_KEY = "goi:feedScope";
/** Tamaño de página al pedir `GET /posts/feed`. */
export const FEED_PAGE_SIZE = 20;
