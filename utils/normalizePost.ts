import type { Post, PostComment } from "../types/post";

/** Asegura campos que la UI del feed exige (p. ej. respuesta parcial de Goi Server). */
export function normalizePost(raw: Post): Post {
  return {
    ...raw,
    authorUsername: raw.authorUsername?.trim() || "Usuario",
    authorAvatarUrl: raw.authorAvatarUrl?.trim() || "",
    workoutId: raw.workoutId ?? null,
    sessionId: raw.sessionId ?? null,
    visibility: raw.visibility ?? "public",
    format: raw.format ?? "standard",
    likesCount: typeof raw.likesCount === "number" ? raw.likesCount : 0,
    likedByMe: raw.likedByMe ?? false,
    comments: Array.isArray(raw.comments) ? raw.comments.map(normalizeComment) : [],
    media: Array.isArray(raw.media) ? raw.media : undefined,
  };
}

function normalizeComment(raw: PostComment): PostComment {
  return {
    ...raw,
    authorUsername: raw.authorUsername?.trim() || "Usuario",
    authorAvatarUrl: raw.authorAvatarUrl?.trim() || "",
  };
}

export function normalizeFeedPage(page: import("../types/post").FeedPageResponse) {
  return {
    ...page,
    items: page.items.map((item) =>
      item.kind === "post" ? { ...item, post: normalizePost(item.post) } : item
    ),
  };
}
