/** Margen lateral del header del feed (historias, filtros). Las publicaciones van a ancho completo. */
export const FEED_HEADER_INSET = 16;

export type FeedScope = "all" | "following";

export const FEED_SCOPES: ReadonlyArray<{ id: FeedScope; label: string }> = [
  { id: "all", label: "Todos" },
  { id: "following", label: "Seguidos" },
] as const;

export const FEED_SCOPE_STORAGE_KEY = "goi:feedScope";
/** Tamaño de página al pedir `GET /posts/feed`. */
export const FEED_PAGE_SIZE = 20;
/** TTL de caché del timeline al volver al feed. */
export const FEED_STALE_MS = 30_000;
/** TTL de refresco auxiliar (stories, discover, following) en foco del feed. */
export const FEED_AUX_REFRESH_STALE_MS = 45_000;
