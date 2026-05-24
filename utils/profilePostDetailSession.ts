import type { Post } from "../types/post";

export type ProfilePostOpeningMeta = {
  pinnedPostId?: string | null;
  onSetPinned?: (postId: string | null) => Promise<void>;
};

/** Post pasado al abrir la pantalla de detalle (p. ej. desde rejilla de perfil en Android). */
let openingPost: Post | null = null;
let openingMeta: ProfilePostOpeningMeta | null = null;

/** Cambios al volver atrás (me gusta, comentarios, borrado). */
let pendingSync: { post: Post | null; deleted?: boolean } | null = null;

export function setOpeningProfilePost(post: Post, meta?: ProfilePostOpeningMeta): void {
  openingPost = post;
  openingMeta = meta ?? null;
}

export function consumeOpeningProfileMeta(): ProfilePostOpeningMeta | null {
  const meta = openingMeta;
  openingMeta = null;
  return meta;
}

export function consumeOpeningProfilePost(expectedId: string): Post | null {
  if (openingPost?.id === expectedId) {
    const post = openingPost;
    openingPost = null;
    return post;
  }
  return null;
}

export function commitProfilePostDetailSync(post: Post | null, deleted = false): void {
  pendingSync = { post, deleted };
}

export function consumeProfilePostDetailSync(): { post: Post | null; deleted?: boolean } | null {
  const sync = pendingSync;
  pendingSync = null;
  return sync;
}
