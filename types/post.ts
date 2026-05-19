/**
 * Contrato de publicaciones alineado con Goi Web (`src/types/post.ts`) y con
 * `mapPostWithInteractions` del servidor (`GET /api/posts`).
 */
export type PostMediaItem = { type: "image"; url: string };

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
  workoutId: string | null;
  visibility: "public" | "followers" | "private";
  createdAt: string;
  updatedAt: string;
  likesCount: number;
  likedByMe?: boolean;
  comments: PostComment[];
};

export type CreatePostInput = {
  content: string;
  workoutId: string | null;
  visibility?: "public" | "followers" | "private";
  media?: PostMediaItem[];
};

export type CreateCommentInput = {
  content: string;
};
