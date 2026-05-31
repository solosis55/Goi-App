import type {
  CreateCommentInput,
  CreatePostInput,
  FeedPageResponse,
  NotificationsResponse,
  Post,
  PostComment,
  PostLikesResponse,
} from "../types/post";

import { ApiError, apiFetch } from "./client";
import { getStoredUser } from "./session";
import { normalizeFeedPage, normalizePost } from "../utils/normalizePost";

export type PostsByUserPageResponse = {
  posts: Post[];
  nextCursor: string | null;
  total: number;
};

async function requireSessionUser() {
  const user = await getStoredUser();
  if (!user) {
    throw new ApiError("Debes iniciar sesión para esta acción.", 401, "AUTH_UNAUTHORIZED");
  }
  return user;
}

/** Lista todas las publicaciones (Goi Server). */
export async function getPosts() {
  const rows = await apiFetch<Post[]>("/posts");
  return rows.map(normalizePost);
}

export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const post = await apiFetch<Post>(`/posts/${encodeURIComponent(postId)}`);
    return normalizePost(post);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export async function getFeedPage(scope: "all" | "following", limit = 20, cursor?: string | null) {
  const sp = new URLSearchParams();
  sp.set("scope", scope);
  sp.set("limit", String(limit));
  if (cursor) sp.set("cursor", cursor);
  const page = await apiFetch<FeedPageResponse>(`/posts/feed?${sp.toString()}`);
  return normalizeFeedPage(page);
}

export function getPostsByUserPage(
  userId: string,
  opts: { limit: number; cursor?: string | null }
) {
  const sp = new URLSearchParams();
  sp.set("limit", String(opts.limit));
  if (opts.cursor) sp.set("cursor", opts.cursor);
  return apiFetch<PostsByUserPageResponse>(
    `/posts/by-user/${encodeURIComponent(userId)}?${sp.toString()}`
  ).then((page) => ({
    ...page,
    posts: page.posts.map(normalizePost),
  }));
}

export async function createPost(input: CreatePostInput) {
  const user = await requireSessionUser();
  return apiFetch<Post>("/posts", {
    method: "POST",
    body: JSON.stringify({
      userId: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      content: input.content,
      format: input.format ?? "standard",
      visibility: input.visibility ?? "public",
      sessionId: input.sessionId ?? null,
    }),
  }).then(normalizePost);
}

export function deletePost(id: string) {
  return apiFetch<{ message: string }>(`/posts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

export function updatePost(
  id: string,
  input: { content: string; visibility: "public" | "followers" | "private" }
) {
  return apiFetch<Post>(`/posts/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(input),
  }).then(normalizePost);
}

export function toggleLike(postId: string) {
  return apiFetch<{ liked: boolean }>(`/posts/${encodeURIComponent(postId)}/likes`, {
    method: "POST",
  });
}

export function getPostLikes(postId: string) {
  return apiFetch<PostLikesResponse>(`/posts/${encodeURIComponent(postId)}/likes`);
}

export async function createComment(postId: string, input: CreateCommentInput) {
  const user = await requireSessionUser();
  return apiFetch<PostComment>(`/posts/${encodeURIComponent(postId)}/comments`, {
    method: "POST",
    body: JSON.stringify({
      userId: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
      content: input.content,
    }),
  });
}

export function getNotifications() {
  return apiFetch<NotificationsResponse>("/posts/notifications");
}

export function markNotificationsRead(ids?: string[]) {
  return apiFetch<{ ok: boolean }>("/posts/notifications/read", {
    method: "POST",
    body: JSON.stringify(ids?.length ? { ids } : {}),
  });
}
