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

export function getDiscover(limit = 24) {
  return apiFetch<{ users: DiscoverUser[] }>(`/auth/discover?limit=${limit}`);
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
