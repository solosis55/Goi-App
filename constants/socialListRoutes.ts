export type SocialListKind = "followers" | "following";

export function socialListHref(
  userId: string,
  kind: SocialListKind,
  username?: string
): { pathname: "/lista-social"; params: { userId: string; kind: SocialListKind; username?: string } } {
  return {
    pathname: "/lista-social",
    params: { userId, kind, ...(username ? { username } : {}) },
  };
}

export function socialListScreenTitle(kind: SocialListKind, username?: string): string {
  const handle = username?.trim();
  if (kind === "followers") {
    return handle ? `Seguidores · @${handle}` : "Seguidores";
  }
  return handle ? `Siguiendo · @${handle}` : "Siguiendo";
}
