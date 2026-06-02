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
import { normalizeFeedPage, normalizePost } from "../utils/normalizePost";
import type { PostImageUploadFile } from "../utils/postImage";

export type PostsByUserPageResponse = {
  posts: Post[];
  nextCursor: string | null;
  total: number;
};

export type CreatePostPayload = CreatePostInput & {
  /** Archivos locales (multipart); preferido frente a `media` en base64. */
  uploadFiles?: PostImageUploadFile[];
};

export async function getPostsByIds(ids: string[]): Promise<Post[]> {
  if (ids.length === 0) return [];
  const sp = new URLSearchParams();
  sp.set("ids", ids.slice(0, 50).join(","));
  const res = await apiFetch<{ posts: Post[] }>(`/posts/by-ids?${sp.toString()}`);
  return Array.isArray(res.posts) ? res.posts.map(normalizePost) : [];
}

export function getLinkedSessionIds() {
  return apiFetch<{ sessionIds: string[] }>("/posts/linked-session-ids").then(
    (r) => r.sessionIds ?? []
  );
}

export async function getPostById(postId: string): Promise<Post | null> {
  try {
    const post = await apiFetch<Post>(`/posts/${encodeURIComponent(postId)}`, {
      timeoutMs: 60_000,
    });
    return normalizePost(post);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

/** Solo imágenes (posts legacy con data URL grande en Neon). */
export async function getPostMedia(postId: string): Promise<Post["media"]> {
  const res = await apiFetch<{ media: Post["media"] }>(
    `/posts/${encodeURIComponent(postId)}/media`,
    { timeoutMs: 60_000 }
  );
  return Array.isArray(res.media) ? res.media : [];
}

export async function getFeedPage(scope: "all" | "following", limit = 20, cursor?: string | null) {
  const sp = new URLSearchParams();
  sp.set("scope", scope);
  sp.set("limit", String(limit));
  if (cursor) sp.set("cursor", cursor);
  const page = await apiFetch<FeedPageResponse>(`/posts/feed?${sp.toString()}`, {
    timeoutMs: 30_000,
  });
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

function appendCreatePostFields(form: FormData, input: CreatePostInput) {
  form.append("content", input.content);
  form.append("format", input.format ?? "standard");
  form.append("visibility", input.visibility ?? "public");
  form.append("sessionId", input.sessionId ?? "");
}

export function createPost(input: CreatePostPayload) {
  if (input.uploadFiles && input.uploadFiles.length > 0) {
    const form = new FormData();
    appendCreatePostFields(form, input);
    for (const file of input.uploadFiles) {
      form.append("files", { uri: file.uri, name: file.name, type: file.type } as unknown as Blob);
    }
    return apiFetch<Post>("/posts", {
      method: "POST",
      body: form,
      timeoutMs: 120_000,
    }).then(normalizePost);
  }

  return apiFetch<Post>("/posts", {
    method: "POST",
    body: JSON.stringify({
      content: input.content,
      format: input.format ?? "standard",
      visibility: input.visibility ?? "public",
      sessionId: input.sessionId ?? null,
      ...(input.media?.length ? { media: input.media } : {}),
    }),
    timeoutMs: 120_000,
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

export function createComment(postId: string, input: CreateCommentInput) {
  return apiFetch<PostComment>(`/posts/${encodeURIComponent(postId)}/comments`, {
    method: "POST",
    body: JSON.stringify({ content: input.content }),
  });
}

export function getNotifications() {
  return apiFetch<NotificationsResponse>("/posts/notifications");
}

export function markNotificationsRead(ids?: string[]) {
  return apiFetch<{ ok: boolean; marked?: number }>("/posts/notifications/read", {
    method: "POST",
    body: JSON.stringify(ids?.length ? { keys: ids } : {}),
  });
}
