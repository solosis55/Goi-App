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
    profileVisibility: user.profileVisibility === "followers" ? "followers" : "public",
    pinnedPostId: user.pinnedPostId ?? "",
  };
}
