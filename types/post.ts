/**
 * Contrato de publicaciones alineado con Goi Web (`src/types/post.ts`) y con
 * `mapPostWithInteractions` del servidor (`GET /api/posts`).
 */
import type { PostFormat } from "../constants/postFormat";

export type PostMediaItem = { type: "image"; url: string };

export type { PostFormat };

export type PostComment = {
  id: string;
  postId: string;
  userId: string;
  authorUsername: string;
  authorAvatarUrl?: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

export type Post = {
  id: string;
  userId: string;
  authorUsername: string;
  authorAvatarUrl: string;
  content: string;
  media?: PostMediaItem[];
  format?: PostFormat;
  sessionId: string | null;
  workoutId: string | null;
  visibility: "public" | "followers" | "private";
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  likedByMe?: boolean;
  comments: PostComment[];
  /** Enriquecido por API cuando hay sessionId (posts Training). */
  sessionWorkoutTitle?: string | null;
  sessionPerformedAt?: string | null;
  sessionCompletedSets?: number | null;
  sessionTotalSets?: number | null;
  sessionCompletedExercises?: number | null;
  sessionTotalExercises?: number | null;
  sessionExercisePreviews?: { exerciseName: string; summary: string }[];
  sessionMoreExercisesCount?: number;
};

export type CreatePostInput = {
  content: string;
  format?: PostFormat;
  sessionId?: string | null;
  visibility?: "public" | "followers" | "private";
  media?: PostMediaItem[];
};

export type CreateCommentInput = {
  content: string;
};

export type FeedNotification = {
  id: string;
  type: "like" | "comment" | "follow";
  actorUserId: string;
  actorUsername: string;
  actorAvatarUrl: string;
  postId?: string;
  postPreview?: string;
  commentPreview?: string;
  commentId?: string;
  createdAt: string;
  read?: boolean;
};

export type NotificationsResponse = {
  notifications: FeedNotification[];
  unreadCount: number;
};

export type FeedWorkoutEvent = {
  id: string;
  userId: string;
  authorUsername: string;
  authorAvatarUrl: string;
  workoutId: string;
  workoutTitle: string;
  performedAt: string;
};

export type FeedTimelineItemDto =
  | { kind: "post"; post: Post }
  | { kind: "workout"; event: FeedWorkoutEvent };

export type FeedPageResponse = {
  items: FeedTimelineItemDto[];
  nextCursor: string | null;
  hasMore: boolean;
};
