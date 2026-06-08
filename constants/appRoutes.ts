/** Ruta principal autenticada (tab bar: inicio, crear, perfil, entrenamientos). */
export const MAIN_TABS_HREF = "/(tabs)" as const;

export const PROFILE_TAB_HREF = "/(tabs)/perfil" as const;

export const SOCIAL_DISCOVER_HREF = {
  pathname: "/(tabs)/social",
  params: { discover: "1" },
} as const;

export const SOCIAL_ACTIVITY_HREF = {
  pathname: "/(tabs)/social",
  params: { activity: "1" },
} as const;
