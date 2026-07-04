import * as Haptics from "expo-haptics";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Platform, View, useWindowDimensions } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { useMentionCandidates } from "../../hooks/useMentionCandidates";
import { usePostMediaHydration } from "../../hooks/usePostMediaHydration";
import { hasDisplayableMedia } from "../../utils/postMedia/display";
import { postForMentionCandidates } from "../../utils/postMentionLite";
import type { Post } from "../../types/post";
import { PostCardCommentComposer } from "./PostCardComments";
import { postCardPropsAreEqual } from "../../utils/postCardAreEqual";
import { PostCardHeader } from "./PostCardHeader";
import { PostActionBar } from "./PostActionBar";
import { useOptionalPressGuard } from "../../hooks/usePressGuard";
import { buildTrainingPreviewDraft } from "../../utils/postTrainingPreviewDraft";
import { resolveSessionExercisePreviews } from "../../utils/sessionExercisePreview";
import {
  trainingFeedInsetHeight,
  trainingFeedInsetWidth,
} from "../post/preview/postPreviewMediaLayout";
import { PostCardBody } from "./PostCardBody";
import { PostCardSheets } from "./PostCardSheets";
import { PostCardStandardMedia } from "./PostCardStandardMedia";
import { postCardStyles as styles } from "./postCardStyles";

type PostCardProps = {
  post: Post;
  currentUserId: string | undefined;
  sessionAvatarUrl?: string | null;
  commentValue: string;
  onChangeComment: (value: string) => void;
  onSubmitComment: () => void;
  onToggleLike: () => void;
  onDelete?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  deleting?: boolean;
  commenting: boolean;
  commentError?: string | null;
  saved?: boolean;
  onToggleSave?: () => void;
  pinnedPostId?: string | null;
  onSetPinned?: (postId: string | null) => void;
  onMuteAuthor?: (authorUserId: string) => void;
  onOpenAuthor?: (authorUserId: string, authorUsername: string) => void;
  onSharePost?: () => void;
  onReportPost?: () => void;
  workoutTitle?: string | null;
  onPressWorkout?: () => void;
  onPressSession?: () => void;
  highlighted?: boolean;
  initialCommentsOpen?: boolean;
  guardScrollPresses?: boolean;
};

function hapticLike() {
  if (Platform.OS === "web") return;
  try {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    /* sin módulo nativo */
  }
}

function PostCardInner({
  post,
  currentUserId,
  sessionAvatarUrl,
  commentValue,
  onChangeComment,
  onSubmitComment,
  onToggleLike,
  onDelete,
  onEdit,
  deleting,
  commenting,
  commentError,
  saved,
  onToggleSave,
  pinnedPostId,
  onSetPinned,
  onMuteAuthor,
  onOpenAuthor,
  onSharePost,
  onReportPost,
  workoutTitle,
  onPressSession,
  highlighted,
  initialCommentsOpen = false,
  guardScrollPresses = false,
}: PostCardProps) {
  const displayPost = usePostMediaHydration(post);
  const press = useOptionalPressGuard(guardScrollPresses);
  const { width: screenWidth } = useWindowDimensions();
  const feedCardWidth = Math.max(screenWidth, 280);
  const mediaSlideWidth = feedCardWidth;
  const trainingFeedMediaWidth = trainingFeedInsetWidth(mediaSlideWidth);
  const trainingFeedMediaHeight = trainingFeedInsetHeight(trainingFeedMediaWidth);
  const { showAlert } = useGoiAlert();
  const [commentsSectionOpen, setCommentsSectionOpen] = useState(initialCommentsOpen);
  const [likesSheetOpen, setLikesSheetOpen] = useState(false);
  const commentsKey = useMemo(
    () => displayPost.comments.map((c) => c.id).join(","),
    [displayPost.comments]
  );
  const mentionPosts = useMemo(
    () => [postForMentionCandidates(displayPost)],
    [displayPost.id, displayPost.userId, displayPost.authorUsername, displayPost.content, commentsKey]
  );
  const { candidates: mentionCandidates, mentionDirectory, recordMentionPick } =
    useMentionCandidates({ posts: mentionPosts });

  useEffect(() => {
    if (initialCommentsOpen) setCommentsSectionOpen(true);
  }, [initialCommentsOpen]);

  useEffect(() => {
    setSessionInlineOpen(false);
  }, [post.id]);

  const [menuOpen, setMenuOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const [sessionInlineOpen, setSessionInlineOpen] = useState(false);

  const commentsCount = displayPost.comments?.length ?? 0;
  const isOwner = currentUserId != null && displayPost.userId === currentUserId;
  const visibility = displayPost.visibility ?? "public";
  const postFormat = displayPost.format ?? "standard";
  const isTrainingPost = postFormat === "training";
  const hasMedia = hasDisplayableMedia(displayPost);
  const showStandardMedia = !isTrainingPost && hasMedia;
  const sessionExercisePreviews = useMemo(
    () =>
      resolveSessionExercisePreviews({
        previews: displayPost.sessionExercisePreviews,
      }),
    [displayPost.sessionExercisePreviews]
  );
  const canPreviewLinkedSession =
    !isTrainingPost &&
    Boolean(displayPost.sessionId) &&
    Boolean(
      displayPost.sessionWorkoutTitle ||
        sessionExercisePreviews.length ||
        displayPost.sessionTotalSets
    );
  const authorAvatarSrc =
    displayPost.authorAvatarUrl?.trim() ||
    (isOwner && sessionAvatarUrl?.trim() ? sessionAvatarUrl : "") ||
    "";
  const linkedSessionDraft = buildTrainingPreviewDraft(displayPost, {
    username: displayPost.authorUsername,
    avatarUrl: authorAvatarSrc,
  });
  const showComposer = commentsSectionOpen || commentValue.trim().length > 0;
  const canManage = isOwner && (!!onDelete || !!onEdit || !!onSetPinned);
  const canOverflow = !isOwner && (!!onMuteAuthor || !!onReportPost || !!onSharePost);
  const canOpenAuthor = !isOwner && !!onOpenAuthor;
  const isPinned = Boolean(pinnedPostId?.trim() && pinnedPostId === post.id);

  const openAuthor = useCallback(
    press(() => {
      if (canOpenAuthor && onOpenAuthor) onOpenAuthor(displayPost.userId, displayPost.authorUsername);
    }),
    [press, canOpenAuthor, onOpenAuthor, displayPost.userId, displayPost.authorUsername]
  );

  const openSessionBody = useCallback(
    press(() => {
      hapticLike();
      setSessionInlineOpen(true);
      setCommentsSectionOpen(false);
    }),
    [press]
  );

  const onPressComment = useCallback(() => {
    if (!isTrainingPost) setSessionInlineOpen(false);
    setCommentsSectionOpen((open) => !open);
  }, [isTrainingPost]);

  const commentsUiVisible = isTrainingPost || !sessionInlineOpen;
  const commentsExpanded = commentsSectionOpen && commentsUiVisible;

  const onDoubleTapLike = useCallback(() => {
    hapticLike();
    onToggleLike();
  }, [onToggleLike]);

  const confirmDelete = useCallback(() => {
    if (!onDelete) return;
    showAlert({
      title: "Eliminar publicación",
      message: "Esta acción no se puede deshacer.",
      buttons: [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => onDelete(post.id) },
      ],
    });
  }, [onDelete, post.id, showAlert]);

  const highlightOpacity = useSharedValue(0);

  useEffect(() => {
    if (highlighted) {
      highlightOpacity.value = withSequence(
        withTiming(1, { duration: 200 }),
        withTiming(1, { duration: 2400 }),
        withTiming(0, { duration: 900 })
      );
    } else {
      highlightOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [highlighted, highlightOpacity]);

  const highlightRingStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(212, 175, 55, ${0.35 + highlightOpacity.value * 0.45})`,
    borderWidth: 2 + highlightOpacity.value,
    opacity: 0.55 + highlightOpacity.value * 0.45,
  }));

  const openLikesSheet = useCallback(() => {
    if (displayPost.likesCount <= 0) return;
    setLikesSheetOpen(true);
  }, [displayPost.likesCount]);

  const openMentionProfile = useCallback(
    (userId: string) => {
      if (!onOpenAuthor) return;
      const match = mentionCandidates.find((c) => c.id === userId);
      onOpenAuthor(userId, match?.username ?? "usuario");
    },
    [mentionCandidates, onOpenAuthor]
  );

  return (
    <View style={styles.cardWrap}>
      <View
        style={[
          styles.card,
          styles.cardClip,
          !showStandardMedia && !isTrainingPost ? styles.cardTextOnly : null,
          isTrainingPost ? styles.cardTraining : null,
        ]}
      >
        <PostCardHeader
          authorUsername={displayPost.authorUsername}
          authorAvatarSrc={authorAvatarSrc}
          createdAt={displayPost.createdAt}
          isOwner={isOwner}
          isTrainingPost={isTrainingPost}
          visibility={visibility}
          canOpenAuthor={canOpenAuthor}
          canManage={canManage}
          canOverflow={canOverflow}
          deleting={deleting}
          guardScrollPresses={guardScrollPresses}
          onOpenAuthor={openAuthor}
          onOpenMenu={press(() => (canManage ? setMenuOpen(true) : setOverflowOpen(true)))}
          compact={!showStandardMedia && !isTrainingPost}
        />

        {showStandardMedia ? (
          <PostCardStandardMedia
            postId={post.id}
            media={displayPost.media}
            mediaKey={`media-${post.id}-${displayPost.media?.[0]?.url ?? ""}`}
            slideWidth={mediaSlideWidth}
            onDoubleTapLike={onDoubleTapLike}
          />
        ) : null}

        <View style={styles.actionBarPad}>
          <PostActionBar
            liked={!!displayPost.likedByMe}
            likesCount={displayPost.likesCount}
            commentsCount={commentsCount}
            onToggleLike={press(onToggleLike)}
            onPressComment={press(onPressComment)}
            commentsExpanded={commentsExpanded}
            onPressLikesCount={press(openLikesSheet)}
            onPressCommentsCount={press(onPressComment)}
            saved={saved}
            onToggleSave={onToggleSave ? press(onToggleSave) : undefined}
            onPressSessionPreview={canPreviewLinkedSession ? openSessionBody : undefined}
            sessionPreviewActive={!isTrainingPost && sessionInlineOpen}
            guardScrollPresses={guardScrollPresses}
          />
        </View>

        <PostCardCommentComposer
          visible={showComposer && commentsUiVisible}
          commentValue={commentValue}
          onChangeComment={onChangeComment}
          onSubmitComment={onSubmitComment}
          commenting={commenting}
          commentError={commentError}
          onFocusComposer={() => setCommentsSectionOpen(true)}
          guardScrollPresses={guardScrollPresses}
          wrapPress={press}
          mentionCandidates={mentionCandidates}
          onMentionPick={recordMentionPick}
        />

        <PostCardBody
          postId={post.id}
          displayPost={displayPost}
          isTrainingPost={isTrainingPost}
          showStandardMedia={showStandardMedia}
          hasMedia={hasMedia}
          sessionInlineOpen={sessionInlineOpen}
          canPreviewLinkedSession={canPreviewLinkedSession}
          linkedSessionDraft={linkedSessionDraft}
          sessionExercisePreviews={sessionExercisePreviews}
          workoutTitle={workoutTitle}
          commentsCount={commentsCount}
          commentsSectionOpen={commentsSectionOpen}
          commentsUiVisible={commentsUiVisible}
          currentUserId={currentUserId}
          canOpenAuthor={canOpenAuthor}
          mentionDirectory={mentionDirectory}
          trainingFeedMediaWidth={trainingFeedMediaWidth}
          trainingFeedMediaHeight={trainingFeedMediaHeight}
          onPressSession={onPressSession}
          onPressComment={onPressComment}
          onOpenAuthor={onOpenAuthor}
          onOpenMentionProfile={openMentionProfile}
          onDoubleTapLike={onDoubleTapLike}
          wrapPress={press}
        />

        <PostCardSheets
          postId={post.id}
          authorUsername={displayPost.authorUsername}
          likesCount={displayPost.likesCount}
          menuOpen={menuOpen}
          overflowOpen={overflowOpen}
          likesSheetOpen={likesSheetOpen}
          canOverflow={canOverflow}
          isPinned={isPinned}
          onCloseMenu={() => setMenuOpen(false)}
          onCloseOverflow={() => setOverflowOpen(false)}
          onCloseLikes={() => setLikesSheetOpen(false)}
          onEdit={onEdit ? () => onEdit(post.id) : undefined}
          onConfirmDelete={confirmDelete}
          onPin={onSetPinned ? () => onSetPinned(post.id) : undefined}
          onUnpin={onSetPinned ? () => onSetPinned(null) : undefined}
          onMuteAuthor={() => onMuteAuthor?.(displayPost.userId)}
          onReport={onReportPost}
          onShare={onSharePost}
        />
      </View>

      {highlighted ? (
        <Animated.View pointerEvents="none" style={[styles.highlightRing, highlightRingStyle]} />
      ) : null}
    </View>
  );
}

export const PostCard = memo(PostCardInner, postCardPropsAreEqual);
