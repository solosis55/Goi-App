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
  profileVisibility: "public" | "followers";
  pinnedPostId: string;
  createdAt: string;
  updatedAt: string;
};

export type ProfileUser = Omit<SafeUser, "email"> & {
  email?: string;
  restrictedToFollowers?: boolean;
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
  profileVisibility: "public" | "followers";
  pinnedPostId: string | null;
}>;

export type DiscoverUser = ProfileUser & {
  isFollowing: boolean;
};
