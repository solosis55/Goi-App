import { DEFAULT_PROFILE_SECTIONS } from "../constants/profileVisibility";
import type { DiscoverUser } from "../types/auth";
import type { SocialUserPreview } from "../types/publicProfile";

const DISCOVER_STUB: Omit<DiscoverUser, "id" | "username" | "isFollowing"> = {
  bio: "",
  goal: "",
  location: "",
  avatarUrl: "",
  bannerUrl: "",
  bannerShowInFeed: true,
  websiteUrl: "",
  instagramUrl: "",
  stravaUrl: "",
  profileVisibility: "public",
  profileSections: DEFAULT_PROFILE_SECTIONS,
  discoverable: true,
  requireAuthToView: false,
  defaultPostVisibility: "public",
  pinnedPostId: "",
  createdAt: "",
  updatedAt: "",
  followPending: false,
};

export function minimalDiscoverUser(
  partial: Pick<DiscoverUser, "id" | "username"> & Partial<DiscoverUser>
): DiscoverUser {
  return {
    ...DISCOVER_STUB,
    ...partial,
    isFollowing: partial.isFollowing ?? false,
    followPending: partial.followPending ?? false,
  };
}

export function socialPreviewToDiscover(u: SocialUserPreview): DiscoverUser {
  return minimalDiscoverUser({
    id: u.id,
    username: u.username,
    avatarUrl: u.avatarUrl,
    isFollowing: u.isFollowing,
    followPending: false,
  });
}
