import type { CreatePostInput, Post } from "../types/post";
import { apiFetch } from "./client";

/** Misma ruta que `getPosts` en Goi Web (`src/api/postsApi.ts`). */
export function getPosts() {
  return apiFetch<Post[]>("/posts");
}

export function createPost(input: CreatePostInput) {
  return apiFetch<Post>("/posts", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
