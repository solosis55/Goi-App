import type { ProfileSectionSettings, ProfileVisibilityMode } from "../types/auth";
import type { Post } from "../types/post";

export const PROFILE_VISIBILITY_OPTIONS: { value: ProfileVisibilityMode; label: string; hint: string }[] = [
  { value: "public", label: "Todos", hint: "Cualquier usuario puede ver tu perfil (según secciones)." },
  { value: "followers", label: "Seguidores", hint: "Solo quien te sigue ve el contenido completo." },
  { value: "request", label: "Solicitud", hint: "Debes aprobar cada solicitud de seguimiento." },
  { value: "private", label: "Solo yo", hint: "Tu perfil no aparece en descubrir ni en búsquedas." },
];

export const SECTION_VISIBILITY_OPTIONS = [
  { value: "public" as const, label: "Todos" },
  { value: "followers" as const, label: "Seguidores" },
  { value: "private" as const, label: "Solo yo" },
];

export const STATS_VISIBILITY_OPTIONS = [
  { value: "public" as const, label: "Todos" },
  { value: "followers" as const, label: "Seguidores" },
  { value: "hidden" as const, label: "Oculto" },
];

export const DEFAULT_POST_VISIBILITY_OPTIONS: { value: Post["visibility"]; label: string }[] = [
  { value: "public", label: "Público" },
  { value: "followers", label: "Seguidores" },
  { value: "private", label: "Solo yo" },
];

export const DEFAULT_PROFILE_SECTIONS: ProfileSectionSettings = {
  bio: "public",
  stats: "public",
  sessions: "followers",
  socialLists: "followers",
};

export function normalizeProfileVisibility(raw: unknown): ProfileVisibilityMode {
  if (raw === "followers" || raw === "private" || raw === "request") return raw;
  return "public";
}

export function normalizeProfileSections(raw?: ProfileSectionSettings): ProfileSectionSettings {
  if (!raw) return { ...DEFAULT_PROFILE_SECTIONS };
  return {
    bio: raw.bio ?? "public",
    stats: raw.stats ?? "public",
    sessions: raw.sessions ?? "followers",
    socialLists: raw.socialLists ?? "followers",
  };
}
