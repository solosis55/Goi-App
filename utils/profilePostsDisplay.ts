import type { ProfilePostsFilter } from "../constants/profilePosts";
import type { Post } from "../types/post";

/** Ordena y filtra publicaciones del perfil (destacada primero en «Mías»). */
export function applyProfilePostsFilter(
  posts: Post[],
  filter: ProfilePostsFilter,
  pinnedPostId?: string | null
): Post[] {
  let list = [...posts];
  if (filter === "photos") {
    list = list.filter((p) => (p.media?.length ?? 0) > 0);
  }
  const pin = pinnedPostId?.trim() ?? "";
  list.sort((a, b) => {
    if (pin) {
      if (a.id === pin) return -1;
      if (b.id === pin) return 1;
    }
    return a.createdAt < b.createdAt ? 1 : -1;
  });
  return list;
}
