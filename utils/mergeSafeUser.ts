import {
  DEFAULT_PROFILE_SECTIONS,
  normalizeProfileSections,
  normalizeProfileVisibility,
} from "../constants/profileVisibility";
import type { SafeUser } from "../types/auth";

/** Alineado con Goi Web: completa campos opcionales del perfil en sesiones guardadas. */
export function mergeSafeUser(user: SafeUser): SafeUser {
  return {
    ...user,
    bannerUrl: user.bannerUrl ?? "",
    bannerShowInFeed: user.bannerShowInFeed !== false,
    websiteUrl: user.websiteUrl ?? "",
    instagramUrl: user.instagramUrl ?? "",
    stravaUrl: user.stravaUrl ?? "",
    location: user.location ?? "",
    profileVisibility: normalizeProfileVisibility(user.profileVisibility),
    profileSections: normalizeProfileSections(user.profileSections),
    discoverable: user.discoverable !== false,
    requireAuthToView: user.requireAuthToView === true,
    defaultPostVisibility:
      user.defaultPostVisibility === "followers" || user.defaultPostVisibility === "private"
        ? user.defaultPostVisibility
        : "public",
    pinnedPostId: user.pinnedPostId ?? "",
  };
}

export { DEFAULT_PROFILE_SECTIONS };
