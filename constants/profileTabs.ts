export type ProfileSectionTab = "posts" | "profile" | "workouts";

export const PROFILE_SECTION_TABS: ReadonlyArray<{
  id: ProfileSectionTab;
  label: string;
}> = [
  { id: "posts", label: "Publicaciones" },
  { id: "profile", label: "Perfil" },
  { id: "workouts", label: "Entrenamientos" },
] as const;

export const DEFAULT_PROFILE_SECTION_TAB: ProfileSectionTab = "posts";
