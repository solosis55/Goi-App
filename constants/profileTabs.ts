export type ProfileSectionTab = "posts" | "profile" | "workouts";

export const PROFILE_SECTION_TABS: ReadonlyArray<{
  id: ProfileSectionTab;
  label: string;
  shortLabel: string;
}> = [
  { id: "posts", label: "Publicaciones", shortLabel: "Posts" },
  { id: "profile", label: "Perfil", shortLabel: "Perfil" },
  { id: "workouts", label: "Entrenamientos", shortLabel: "Entreno" },
] as const;

export const DEFAULT_PROFILE_SECTION_TAB: ProfileSectionTab = "posts";
