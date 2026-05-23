import type { CreateCommentInput, CreatePostInput, Post, PostComment } from "../types/post";

import { apiFetch } from "./client";



/** Misma ruta que `getPosts` en Goi Web (`src/api/postsApi.ts`). */

export function getPosts() {

  return apiFetch<Post[]>("/posts");

}

export type PostsByUserPageResponse = {
  posts: Post[];
  nextCursor: string | null;
  total: number;
};

export function getPostsByUserPage(
  userId: string,
  opts: { limit: number; cursor?: string | null }
) {
  const sp = new URLSearchParams();
  sp.set("limit", String(opts.limit));
  if (opts.cursor) sp.set("cursor", opts.cursor);
  return apiFetch<PostsByUserPageResponse>(
    `/posts/by-user/${encodeURIComponent(userId)}?${sp.toString()}`
  );
}



export function createPost(input: CreatePostInput) {

  return apiFetch<Post>("/posts", {

    method: "POST",

    body: JSON.stringify(input),

  });

}



export function deletePost(id: string) {

  return apiFetch<{ message: string }>(`/posts/${id}`, {

    method: "DELETE",

  });

}



export function updatePost(
  id: string,
  input: { content: string; visibility: "public" | "followers" | "private" }
) {
  return apiFetch<Post>(`/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
}



export function toggleLike(postId: string) {

  return apiFetch<{ liked: boolean }>(`/posts/${postId}/likes`, {

    method: "POST",

  });

}



export function createComment(postId: string, input: CreateCommentInput) {

  return apiFetch<PostComment>(`/posts/${postId}/comments`, {

    method: "POST",

    body: JSON.stringify(input),

  });

}


