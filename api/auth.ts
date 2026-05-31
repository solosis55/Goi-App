import type {
  AuthResponse,
  DiscoverUser,
  ForgotPasswordResponse,
  LoginInput,
  ProfileUser,
  RegisterInput,
  ResetPasswordInput,
  SafeUser,
  UpdateProfileInput,
} from "../types/auth";
import { apiFetch } from "./client";

export function register(input: RegisterInput) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function login(input: LoginInput) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function requestPasswordReset(email: string) {
  return apiFetch<ForgotPasswordResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPasswordWithToken(input: ResetPasswordInput) {
  return apiFetch<{ message: string }>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getProfile(userId: string) {
  return apiFetch<{ user: ProfileUser }>(`/auth/profile/${encodeURIComponent(userId)}`);
}

export function updateProfile(userId: string, input: UpdateProfileInput) {
  return apiFetch<{ message: string; user: SafeUser }>(`/auth/profile/${encodeURIComponent(userId)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}

type ProfileImageUploadResponse = { url: string };

function profileImageFormData(uri: string, filename: string, mimeType: string): FormData {
  const form = new FormData();
  form.append("file", { uri, name: filename, type: mimeType } as unknown as Blob);
  return form;
}

export function uploadProfileAvatar(userId: string, uri: string, mimeType = "image/jpeg") {
  return apiFetch<ProfileImageUploadResponse>(
    `/auth/profile/${encodeURIComponent(userId)}/avatar`,
    {
      method: "POST",
      body: profileImageFormData(uri, "avatar.jpg", mimeType),
    }
  );
}

export function getFollowing(userId: string) {
  return apiFetch<{ followingIds: string[] }>(`/auth/following/${encodeURIComponent(userId)}`);
}

export function getFollowers(userId: string) {
  return apiFetch<{ followerIds: string[] }>(`/auth/followers/${encodeURIComponent(userId)}`);
}

export function getUsers() {
  return apiFetch<{ users: DiscoverUser[] }>("/auth/users");
}

export function getDiscover(
  limit = 24,
  offset = 0,
  facet: import("../types/auth").DiscoverFacetParam = "all"
) {
  const sp = new URLSearchParams();
  sp.set("limit", String(limit));
  sp.set("offset", String(offset));
  if (facet !== "all") sp.set("facet", facet);
  return apiFetch<import("../types/auth").DiscoverPageResponse>(`/auth/discover?${sp.toString()}`);
}

export function getSocialHub(opts?: { lite?: boolean }) {
  const q = opts?.lite ? "?lite=1" : "";
  return apiFetch<import("../types/socialHub").SocialHubResponse>(`/auth/social/hub${q}`);
}

export function getUsersPreviews(ids: string[]) {
  if (ids.length === 0) return Promise.resolve({ users: [] as { id: string; username: string; avatarUrl: string }[] });
  const sp = new URLSearchParams();
  sp.set("ids", ids.slice(0, 64).join(","));
  return apiFetch<{ users: { id: string; username: string; avatarUrl: string }[] }>(
    `/auth/users/previews?${sp.toString()}`
  );
}

export function searchUsers(q: string, limit = 24) {
  const sp = new URLSearchParams();
  sp.set("q", q);
  sp.set("limit", String(limit));
  return apiFetch<{ users: DiscoverUser[] }>(`/auth/users/search?${sp.toString()}`);
}

export function getNotificationPrefsRemote() {
  return apiFetch<{ prefs: import("../types/socialHub").NotificationPrefsDto }>(
    "/auth/notification-prefs"
  );
}

export function putNotificationPrefsRemote(prefs: import("../types/socialHub").NotificationPrefsDto) {
  return apiFetch<{ prefs: import("../types/socialHub").NotificationPrefsDto }>(
    "/auth/notification-prefs",
    { method: "PUT", body: JSON.stringify(prefs) }
  );
}

export function getBlockedUsersPreviews() {
  return apiFetch<{ users: { id: string; username: string; avatarUrl: string }[] }>(
    "/auth/blocks/previews"
  );
}

export type ToggleFollowResponse = {
  following: boolean;
  pending?: boolean;
  status?: "none" | "pending" | "active";
};

export function toggleFollow(targetUserId: string) {
  return apiFetch<ToggleFollowResponse>(`/auth/follow/${encodeURIComponent(targetUserId)}`, {
    method: "POST",
  });
}

export function respondFollowRequest(requesterId: string, action: "accept" | "reject") {
  return apiFetch<{ ok: boolean; action: string }>(
    `/auth/follow-requests/${encodeURIComponent(requesterId)}`,
    {
      method: "POST",
      body: JSON.stringify({ action }),
    }
  );
}

export function getPendingFollowRequests() {
  return apiFetch<{ requests: import("../types/publicProfile").FollowRequestPreview[] }>(
    "/auth/follow-requests"
  );
}

export function getSentFollowRequests() {
  return apiFetch<{ requests: import("../types/publicProfile").SentFollowRequestPreview[] }>(
    "/auth/follow-requests/sent"
  );
}

export function toggleBlockUser(targetUserId: string) {
  return apiFetch<{ blocked: boolean }>(`/auth/block/${encodeURIComponent(targetUserId)}`, {
    method: "POST",
  });
}

export function getBlockedUserIds() {
  return apiFetch<{ blockedIds: string[] }>("/auth/blocks");
}

export function uploadProfileBanner(userId: string, uri: string, mimeType = "image/jpeg") {
  return apiFetch<ProfileImageUploadResponse>(
    `/auth/profile/${encodeURIComponent(userId)}/banner`,
    {
      method: "POST",
      body: profileImageFormData(uri, "banner.jpg", mimeType),
    }
  );
}
