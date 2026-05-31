import { memo, useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { useFeedPostActions } from "../../context/FeedPostActionsContext";
import { useFeedPrefsStore } from "../../stores/useFeedPrefsStore";
import { useFeedInteractionStore } from "../../stores/useFeedInteractionStore";
import type { Post } from "../../types/post";
import { sharePost } from "../../utils/sharePost";
import { PostCard } from "./PostCard";

export type FeedPostCardRowProps = {
  post: Post;
  currentUserId: string | undefined;
  sessionAvatarUrl?: string | null;
  isBeamActive: boolean;
  highlighted: boolean;
  initialCommentsOpen: boolean;
  workoutTitle: string | null | undefined;
};

function FeedPostCardRowInner({
  post,
  currentUserId,
  sessionAvatarUrl,
  isBeamActive,
  highlighted,
  initialCommentsOpen,
  workoutTitle,
}: FeedPostCardRowProps) {
  const router = useRouter();
  const { invoke } = useFeedPostActions();
  const saved = useFeedPrefsStore((s) => s.savedPostIds.includes(post.id));
  const commenting = useFeedInteractionStore((s) => s.commentingPostId === post.id);
  const deleting = useFeedInteractionStore((s) => s.deletingPostId === post.id);
  const commentError = useFeedInteractionStore((s) =>
    s.commentFieldError?.postId === post.id ? s.commentFieldError.message : undefined
  );
  const [commentValue, setCommentValue] = useState("");

  useEffect(() => {
    setCommentValue("");
  }, [post.id]);

  const handleChangeComment = useCallback(
    (value: string) => {
      setCommentValue(value);
      if (commentError && value.length > 0) invoke.clearCommentError();
    },
    [commentError, invoke]
  );

  const handleSubmitComment = useCallback(() => {
    invoke.submitComment(post.id, commentValue);
  }, [invoke, post.id, commentValue]);

  const onPressWorkout =
    !post.sessionId && post.workoutId ? () => invoke.openWorkoutForPost(post) : undefined;

  const onPressSession = post.sessionId
    ? () => invoke.openSession(post.sessionId as string, post.id)
    : undefined;

  return (
    <PostCard
      post={post}
      isBeamActive={isBeamActive}
      initialCommentsOpen={initialCommentsOpen}
      onPressWorkout={onPressWorkout}
      onPressSession={onPressSession}
      currentUserId={currentUserId}
      sessionAvatarUrl={sessionAvatarUrl}
      highlighted={highlighted}
      workoutTitle={workoutTitle}
      commentValue={commentValue}
      onChangeComment={handleChangeComment}
      onSubmitComment={handleSubmitComment}
      onToggleLike={() => invoke.toggleLike(post.id)}
      onDelete={() => invoke.deletePost(post.id)}
      onEdit={(postId) => router.push({ pathname: "/editar-publicacion", params: { id: postId } })}
      deleting={deleting}
      commenting={commenting}
      commentError={commentError}
      saved={saved}
      onToggleSave={() => invoke.toggleSave(post.id)}
      onMuteAuthor={(authorId) => invoke.muteAuthor(authorId)}
      onOpenAuthor={(userId, username) => invoke.openAuthor(userId, username)}
      onSharePost={() => void sharePost(post.id, post.authorUsername, post.content)}
      onReportPost={() => invoke.reportPost(post)}
    />
  );
}

function feedPostCardRowAreEqual(prev: FeedPostCardRowProps, next: FeedPostCardRowProps): boolean {
  return (
    prev.post === next.post &&
    prev.currentUserId === next.currentUserId &&
    prev.sessionAvatarUrl === next.sessionAvatarUrl &&
    prev.isBeamActive === next.isBeamActive &&
    prev.highlighted === next.highlighted &&
    prev.initialCommentsOpen === next.initialCommentsOpen &&
    prev.workoutTitle === next.workoutTitle
  );
}

export const FeedPostCardRow = memo(FeedPostCardRowInner, feedPostCardRowAreEqual);
