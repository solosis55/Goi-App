import type { ProfileUser } from "./auth";
import type { Post } from "./post";

export type ProfileRestrictionLevel = "none" | "partial" | "unavailable";

export type SocialUserPreview = {
  id: string;
  username: string;
  avatarUrl: string;
  isFollowing: boolean;
  followsYou: boolean;
};

export type PublicProfileSession = {
  id: string;
  userId: string;
  workoutId: string;
  performedAt: string;
  notes: string;
  createdAt: string;
  workoutTitle: string;
};

export type ProfileSectionAccess = {
  bio: boolean;
  stats: boolean;
  sessions: boolean;
  socialLists: boolean;
};

export type PublicProfilePreviewPost = Pick<
  Post,
  "id" | "userId" | "visibility" | "createdAt" | "media" | "content"
> & {
  authorUsername?: string;
  authorAvatarUrl?: string;
  previewOnly?: boolean;
};

export type PublicProfileOverview = {
  user: ProfileUser;
  restricted: boolean;
  restrictionLevel: ProfileRestrictionLevel;
  blocked: boolean;
  following: boolean;
  followPending: boolean;
  followsYou: boolean;
  followerCount: number;
  followingCount: number;
  mutualFollowers: SocialUserPreview[];
  posts: {
    posts: Post[];
    nextCursor: string | null;
    total: number;
  };
  previewPosts: PublicProfilePreviewPost[];
  postCountVisible: number;
  postCountTotal: number;
  postsHiddenByVisibility: boolean;
  sessions: PublicProfileSession[];
  workoutTitles: Record<string, string>;
  sectionAccess: ProfileSectionAccess;
};

export type ProfileSocialPage = {
  users: SocialUserPreview[];
  nextCursor: string | null;
  total: number;
};

export type FollowRequestPreview = {
  requesterId: string;
  username: string;
  avatarUrl: string;
  createdAt: string;
};

export type SentFollowRequestPreview = {
  targetUserId: string;
  username: string;
  avatarUrl: string;
  createdAt: string;
};
