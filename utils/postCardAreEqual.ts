import type { Post } from "../types/post";

type PostCardComparable = {
  post: Post;
  currentUserId: string | undefined;
  sessionAvatarUrl?: string | null;
  commentValue: string;
  commenting: boolean;
  commentError?: string | null;
  deleting?: boolean;
  saved?: boolean;
  workoutTitle?: string | null;
  highlighted?: boolean;
  initialCommentsOpen?: boolean;
  isBeamActive?: boolean;
  guardScrollPresses?: boolean;
  pinnedPostId?: string | null;
};

export function postCardPropsAreEqual(prev: PostCardComparable, next: PostCardComparable): boolean {
  if (prev.post !== next.post) return false;
  if (prev.currentUserId !== next.currentUserId) return false;
  if (prev.sessionAvatarUrl !== next.sessionAvatarUrl) return false;
  if (prev.commentValue !== next.commentValue) return false;
  if (prev.commenting !== next.commenting) return false;
  if (prev.commentError !== next.commentError) return false;
  if (prev.deleting !== next.deleting) return false;
  if (prev.saved !== next.saved) return false;
  if (prev.workoutTitle !== next.workoutTitle) return false;
  if (prev.highlighted !== next.highlighted) return false;
  if (prev.initialCommentsOpen !== next.initialCommentsOpen) return false;
  if (prev.isBeamActive !== next.isBeamActive) return false;
  if (prev.guardScrollPresses !== next.guardScrollPresses) return false;
  if (prev.pinnedPostId !== next.pinnedPostId) return false;
  return true;
}
