/** Tamaño de página para publicaciones en perfil (alineado con Goi Web). */
export const PROFILE_POSTS_PAGE_SIZE = 24;

export type ProfilePostsSourceTab = "mine" | "saved";

export type ProfilePostsFilter = "all" | "photos";

export const PROFILE_POSTS_SOURCE_TABS: ReadonlyArray<{
  id: ProfilePostsSourceTab;
  label: string;
}> = [
  { id: "mine", label: "Mías" },
  { id: "saved", label: "Guardados" },
] as const;

export const PROFILE_POSTS_FILTERS: ReadonlyArray<{
  id: ProfilePostsFilter;
  label: string;
}> = [
  { id: "all", label: "Todas" },
  { id: "photos", label: "Con foto" },
] as const;
