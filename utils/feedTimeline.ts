import type { FeedScope } from "../constants/feed";
import type { Post } from "../types/post";

export function filterFeedPosts(
  posts: Post[],
  scope: FeedScope,
  opts: {
    userId: string | undefined;
    followingIds: string[];
    mutedUserIds: Set<string>;
  }
): Post[] {
  let list = posts.filter((p) => !opts.mutedUserIds.has(p.userId));

  if (scope === "following" && opts.userId) {
    const allowed = new Set([...opts.followingIds, opts.userId]);
    list = list.filter((p) => allowed.has(p.userId));
  }

  return list;
}

export function feedScopeEmptyMessage(scope: FeedScope): { title: string; body: string } {
  if (scope === "following") {
    return {
      title: "Nada de quien sigues",
      body: "Sigue a alguien de las sugerencias o cambia a «Todos» para ver toda la comunidad.",
    };
  }
  return {
    title: "Aún no hay publicaciones",
    body: "Pulsa el + del menú inferior para publicar, o tira hacia abajo para actualizar.",
  };
}
