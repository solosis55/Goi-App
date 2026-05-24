export type ProfileVisibilityMode = "public" | "followers" | "private" | "request";

export type SectionVisibility = "public" | "followers" | "private";

export type StatsSectionVisibility = "public" | "followers" | "hidden";

export type ProfileSectionSettings = {
  bio: SectionVisibility;
  stats: StatsSectionVisibility;
  sessions: SectionVisibility;
  socialLists: StatsSectionVisibility;
};

export type SafeUser = {
  id: string;
  username: string;
  email: string;
  bio: string;
  goal: string;
  avatarUrl: string;
  bannerUrl: string;
  bannerShowInFeed: boolean;
  websiteUrl: string;
  instagramUrl: string;
  stravaUrl: string;
  location: string;
  profileVisibility: ProfileVisibilityMode;
  profileSections: ProfileSectionSettings;
  discoverable: boolean;
  requireAuthToView: boolean;
  defaultPostVisibility: "public" | "followers" | "private";
  pinnedPostId: string;
  createdAt: string;
  updatedAt: string;
};

export type ProfileUser = Omit<SafeUser, "email"> & {
  email?: string;
  restrictedToFollowers?: boolean;
  profileUnavailable?: boolean;
};

export type AuthResponse = {
  message: string;
  user: SafeUser;
  token?: string;
};

export type RegisterInput = {
  username: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type ForgotPasswordResponse = {
  message: string;
  devResetToken?: string;
};

export type ResetPasswordInput = {
  token: string;
  password: string;
};

export type UpdateProfileInput = Partial<{
  username: string;
  bio: string;
  goal: string;
  avatarUrl: string;
  bannerUrl: string;
  bannerShowInFeed: boolean;
  websiteUrl: string;
  instagramUrl: string;
  stravaUrl: string;
  location: string;
  profileVisibility: ProfileVisibilityMode;
  profileSections: ProfileSectionSettings;
  discoverable: boolean;
  requireAuthToView: boolean;
  defaultPostVisibility: "public" | "followers" | "private";
  pinnedPostId: string | null;
}>;

export type DiscoverMutualPreview = {
  id: string;
  username: string;
  avatarUrl: string;
};

export type DiscoverUser = ProfileUser & {
  isFollowing: boolean;
  mutualCount?: number;
  mutualPreview?: DiscoverMutualPreview[];
  reason?: string;
  activeThisWeek?: boolean;
};
