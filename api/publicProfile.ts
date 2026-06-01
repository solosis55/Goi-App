import type { ProfileSocialPage, PublicProfileOverview } from "../types/publicProfile";
import { apiFetch } from "./client";

export function getPublicProfileOverview(userId: string) {
  return apiFetch<PublicProfileOverview>(`/auth/profile/${encodeURIComponent(userId)}/public`);
}

export function getProfileSocialPage(
  userId: string,
  kind: "followers" | "following",
  opts: { limit?: number; cursor?: string | null } = {}
) {
  const sp = new URLSearchParams();
  if (opts.limit) sp.set("limit", String(opts.limit));
  if (opts.cursor) sp.set("cursor", opts.cursor);
  const q = sp.toString();
  return apiFetch<ProfileSocialPage>(
    `/auth/profile/${encodeURIComponent(userId)}/social/${kind}${q ? `?${q}` : ""}`
  );
}
