export type PublicProfileTab = "posts" | "sessions";

export const PUBLIC_PROFILE_TABS: ReadonlyArray<{ id: PublicProfileTab; label: string }> = [
  { id: "posts", label: "Publicaciones" },
  { id: "sessions", label: "Sesiones" },
] as const;
