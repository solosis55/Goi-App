import type { Post } from "../types/post";

/** Post mínimo para menciones (sin media/base64 que bloquean el render). */
export function postForMentionCandidates(post: Post): Post {
  return {
    id: post.id,
    userId: post.userId,
    authorUsername: post.authorUsername,
    authorAvatarUrl: "",
    content: post.content ?? "",
    format: post.format,
    sessionId: null,
    workoutId: null,
    visibility: post.visibility ?? "public",
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    likesCount: 0,
    comments: (post.comments ?? []).map((c) => ({
      id: c.id,
      postId: c.postId,
      userId: c.userId,
      authorUsername: c.authorUsername,
      authorAvatarUrl: "",
      content: c.content ?? "",
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    })),
  };
}
