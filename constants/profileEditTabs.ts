export type ProfileEditSubTab = "public" | "private";

export const PROFILE_EDIT_SUB_TABS: ReadonlyArray<{
  id: ProfileEditSubTab;
  label: string;
}> = [
  { id: "public", label: "Público" },
  { id: "private", label: "Privado" },
] as const;

export const DEFAULT_PROFILE_EDIT_SUB_TAB: ProfileEditSubTab = "public";
