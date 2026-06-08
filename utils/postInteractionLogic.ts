import type { Post, PostComment } from "../types/post";

export type LikeBaseline = Pick<Post, "likedByMe" | "likesCount">;

/** Estado optimista o reconciliado tras respuesta del servidor. */
export function applyLikeToggle(
  baseline: LikeBaseline,
  targetLiked: boolean
): LikeBaseline {
  const wasLiked = !!baseline.likedByMe;
  let nextCount = baseline.likesCount;
  if (targetLiked && !wasLiked) nextCount += 1;
  else if (!targetLiked && wasLiked) nextCount = Math.max(0, baseline.likesCount - 1);
  return { likedByMe: targetLiked, likesCount: nextCount };
}

export function reconcileLikeFromServer(snapshot: LikeBaseline, serverLiked: boolean): LikeBaseline {
  return applyLikeToggle(snapshot, serverLiked);
}

export function sortPostComments(comments: PostComment[]): PostComment[] {
  return [...comments].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
}

export function buildOptimisticComment(input: {
  tempId: string;
  postId: string;
  userId: string;
  username: string;
  avatarUrl?: string;
  content: string;
}): PostComment {
  const now = new Date().toISOString();
  return {
    id: input.tempId,
    postId: input.postId,
    userId: input.userId,
    authorUsername: input.username,
    authorAvatarUrl: input.avatarUrl ?? "",
    content: input.content,
    createdAt: now,
    updatedAt: now,
  };
}
