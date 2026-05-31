import type { DiscoverUser } from "./auth";
import type { FollowRequestPreview, SentFollowRequestPreview, SocialUserPreview } from "./publicProfile";

export type SocialWeeklyLeader = {
  userId: string;
  username: string;
  avatarUrl: string;
  sessionsThisWeek: number;
};

export type SocialHubResponse = {
  discoverUsers: DiscoverUser[];
  followingIds: string[];
  followerIds: string[];
  followRequests: FollowRequestPreview[];
  sentRequests: SentFollowRequestPreview[];
  followingPreviews: SocialUserPreview[];
  followersTotal: number;
  followingTotal: number;
  blockedIds: string[];
  followBackPreviews: SocialUserPreview[];
  weekly: {
    mySessionsWeek: number;
    followingActiveWeek: number;
    leaders: SocialWeeklyLeader[];
  };
};

export type NotificationPrefsDto = {
  mutedTypes: Array<"like" | "comment" | "follow">;
};
