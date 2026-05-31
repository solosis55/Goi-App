import * as Haptics from "expo-haptics";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { useMentionCandidates } from "../../hooks/useMentionCandidates";
import type { Post } from "../../types/post";
import { MentionHighlightedText } from "../post/MentionHighlightedText";
import { PostCardCommentComposer, PostCardCommentsBody } from "./PostCardComments";
import { postCardPropsAreEqual } from "../../utils/postCardAreEqual";
import { formatPostRelative } from "../../utils/feedPostDate";
import { visibilityBadgeStyle, visibilityLabel } from "../../utils/visibilityStyles";
import { useFeedGoldBeam } from "../../context/FeedGoldBeamContext";
import { PostCardGoldBeam } from "./PostCardGoldBeam";
import { UserAvatar } from "../ui/UserAvatar";
import { PostActionBar } from "./PostActionBar";
import { PostLikesSheet } from "./PostLikesSheet";
import { useOptionalPressGuard } from "../../hooks/usePressGuard";
import { ScrollAwarePressable } from "../ui/ScrollAwarePressable";
import { PostMediaCarousel } from "./PostMediaCarousel";
import { PublicationLinkedSessionBody } from "../post/PublicationLinkedSessionBody";
import { PostSessionAttachment } from "../post/PostSessionAttachment";
import { buildTrainingPreviewDraft } from "../../utils/postTrainingPreviewDraft";
import {
  trainingFeedInsetHeight,
  trainingFeedInsetWidth,
} from "../post/preview/postPreviewMediaLayout";
import { FeedPostOverflowSheet } from "./FeedPostOverflowSheet";
import { PostOwnerMenuSheet } from "./PostOwnerMenuSheet";

type PostCardProps = {
  post: Post;
  currentUserId: string | undefined;
  /** Avatar del usuario en sesión (fallback en posts propios si la API no lo envía). */
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
  /** Tarjeta central del feed: muestra el brillo dorado al hacer scroll. */
  isBeamActive?: boolean;
  /** Dentro de un ScrollView con scroll vertical (detalle desde perfil). */
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
  onPressWorkout,
  onPressSession,
  highlighted,
  initialCommentsOpen = false,
  isBeamActive = false,
  guardScrollPresses = false,
}: PostCardProps) {
  const press = useOptionalPressGuard(guardScrollPresses);
  const feedBeam = useFeedGoldBeam();
  const cardWrapRef = useRef<View>(null);
  const [cardSize, setCardSize] = useState({ w: 0, h: 0 });
  const { width: screenWidth } = useWindowDimensions();
  const mediaSlideWidth = Math.min(screenWidth, 672);
  const trainingFeedMediaWidth = trainingFeedInsetWidth(mediaSlideWidth);
  const trainingFeedMediaHeight = trainingFeedInsetHeight(trainingFeedMediaWidth);
  const { showAlert } = useGoiAlert();
  const [commentsSectionOpen, setCommentsSectionOpen] = useState(initialCommentsOpen);
  const [likesSheetOpen, setLikesSheetOpen] = useState(false);
  const mentionPosts = useMemo(() => [post], [post]);
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
  const commentsCount = post.comments.length;
  const isOwner = currentUserId != null && post.userId === currentUserId;
  const visibility = post.visibility ?? "public";
  const visStyle = visibilityBadgeStyle(visibility);
  const postFormat = post.format ?? "standard";
  const isTrainingPost = postFormat === "training";
  const hasMedia = (post.media?.length ?? 0) > 0;
  const canPreviewLinkedSession =
    !isTrainingPost &&
    Boolean(post.sessionId) &&
    Boolean(post.sessionWorkoutTitle || post.sessionExercisePreviews?.length || post.sessionTotalSets);
  const authorAvatarSrc =
    post.authorAvatarUrl?.trim() || (isOwner && sessionAvatarUrl?.trim() ? sessionAvatarUrl : "") || "";
  const linkedSessionDraft = buildTrainingPreviewDraft(post, {
    username: post.authorUsername,
    avatarUrl: authorAvatarSrc,
  });
  const showComposer = commentsSectionOpen || commentValue.trim().length > 0;
  const canManage = isOwner && (!!onDelete || !!onEdit || !!onSetPinned);
  const canOverflow = !isOwner && (!!onMuteAuthor || !!onReportPost || !!onSharePost);
  const canOpenAuthor = !isOwner && !!onOpenAuthor;
  const isPinned = Boolean(pinnedPostId?.trim() && pinnedPostId === post.id);

  const openAuthor = useCallback(
    press(() => {
      if (canOpenAuthor && onOpenAuthor) onOpenAuthor(post.userId, post.authorUsername);
    }),
    [press, canOpenAuthor, onOpenAuthor, post.userId, post.authorUsername]
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

  const showVisBadge = visibility !== "public";
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

  const highlightBorderStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(212, 175, 55, ${0.15 + highlightOpacity.value * 0.45})`,
    borderWidth: 1 + highlightOpacity.value,
  }));

  const openLikesSheet = useCallback(() => {
    if (post.likesCount <= 0) return;
    setLikesSheetOpen(true);
  }, [post.likesCount]);

  const openMentionProfile = useCallback(
    (userId: string) => {
      if (!onOpenAuthor) return;
      const match = mentionCandidates.find((c) => c.id === userId);
      onOpenAuthor(userId, match?.username ?? "usuario");
    },
    [mentionCandidates, onOpenAuthor]
  );

  return (
    <View
      ref={cardWrapRef}
      collapsable={false}
      style={styles.cardWrap}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        if (width > 0 && height > 0) setCardSize({ w: width, h: height });
      }}
    >
      <Animated.View
        style={[
          styles.card,
          styles.cardClip,
          !hasMedia ? styles.cardTextOnly : null,
          isTrainingPost ? styles.cardTraining : null,
          highlightBorderStyle,
        ]}
      >
      <View style={[styles.headerPad, !hasMedia ? styles.headerPadCompact : null]}>
        <View style={styles.headerRow}>
          <ScrollAwarePressable
            scrollGuarded={guardScrollPresses}
            onPress={openAuthor}
            disabled={!canOpenAuthor}
            style={({ pressed }) => [styles.authorTap, pressed && canOpenAuthor ? styles.hitPressed : null]}
            accessibilityRole={canOpenAuthor ? "button" : undefined}
            accessibilityLabel={
              canOpenAuthor ? `Ver perfil de ${post.authorUsername}` : undefined
            }
          >
            <View style={styles.avatarSlot}>
              <UserAvatar src={authorAvatarSrc} username={post.authorUsername} size={46} />
            </View>
          </ScrollAwarePressable>
          <ScrollAwarePressable
            scrollGuarded={guardScrollPresses}
            onPress={openAuthor}
            disabled={!canOpenAuthor}
            style={({ pressed }) => [
              styles.metaCol,
              pressed && canOpenAuthor ? styles.hitPressed : null,
            ]}
          >
            <View style={styles.metaBorder}>
              <View style={styles.metaTop}>
                <Text style={styles.username} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {post.authorUsername}
                  {isOwner ? <Text style={styles.ownerHint}> (tu)</Text> : null}
                </Text>
                <Text style={styles.dot} aria-hidden>
                  ·
                </Text>
                <Text style={styles.time} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {formatPostRelative(post.createdAt)}
                </Text>
              </View>
              {isTrainingPost ? (
                <Text style={styles.trainingTag} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Training
                </Text>
              ) : null}
              {showVisBadge ? (
                <View style={[styles.visBadge, { borderColor: visStyle.borderColor, backgroundColor: visStyle.backgroundColor }]}>
                  <Text style={[styles.visText, { color: visStyle.color }]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {visibilityLabel(visibility)}
                  </Text>
                </View>
              ) : null}
            </View>
          </ScrollAwarePressable>
          {canManage || canOverflow ? (
            <ScrollAwarePressable
              scrollGuarded={guardScrollPresses}
              onPress={press(() => (canManage ? setMenuOpen(true) : setOverflowOpen(true)))}
              disabled={deleting}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={canManage ? "Opciones de tu publicación" : `Opciones de la publicación de ${post.authorUsername}`}
              style={({ pressed }) => [styles.menuBtn, pressed ? styles.hitPressed : null, deleting ? styles.menuDisabled : null]}
            >
              {deleting ? (
                <ActivityIndicator size="small" color={AUTH.muted} />
              ) : (
                <Text style={styles.menuIcon}>⋯</Text>
              )}
            </ScrollAwarePressable>
          ) : (
            <View style={styles.menuSpacer} />
          )}
        </View>
      </View>

      {hasMedia && !isTrainingPost ? (
        <View style={styles.mediaBleed}>
          <PostMediaCarousel
            media={post.media ?? []}
            onDoubleTapLike={onDoubleTapLike}
            slideWidth={mediaSlideWidth}
            mediaAspect="square"
            layout="bleed"
          />
        </View>
      ) : null}

      <View style={styles.actionBarPad}>
        <PostActionBar
          liked={!!post.likedByMe}
          likesCount={post.likesCount}
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

      <View style={[styles.bodyPad, !hasMedia ? styles.bodyPadCompact : null]}>
        {!isTrainingPost && sessionInlineOpen && canPreviewLinkedSession ? (
          <PublicationLinkedSessionBody
            draft={linkedSessionDraft}
            onPressViewSession={post.sessionId && onPressSession ? press(onPressSession) : undefined}
          />
        ) : post.content ? (
          <MentionHighlightedText
            text={post.content}
            userDirectory={mentionDirectory}
            onOpenProfile={canOpenAuthor ? openMentionProfile : undefined}
            style={[styles.content, !hasMedia ? styles.contentTextOnly : null]}
          />
        ) : null}

        {isTrainingPost && (post.sessionId || post.sessionWorkoutTitle) ? (
          <PostSessionAttachment
            workoutTitle={post.sessionWorkoutTitle ?? workoutTitle}
            performedAt={post.sessionPerformedAt}
            metrics={{
              completedSets: post.sessionCompletedSets,
              totalSets: post.sessionTotalSets,
              completedExercises: post.sessionCompletedExercises,
              totalExercises: post.sessionTotalExercises,
            }}
            exercisePreviews={post.sessionExercisePreviews}
            moreExercisesCount={post.sessionMoreExercisesCount ?? 0}
            onPress={post.sessionId && onPressSession ? press(onPressSession) : undefined}
            showViewFullCta={Boolean(post.sessionId && onPressSession)}
          />
        ) : null}

        {hasMedia && isTrainingPost ? (
          <View style={styles.mediaInsetPad}>
            <Text style={styles.mediaInsetLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Foto del entreno
            </Text>
            <PostMediaCarousel
              media={post.media ?? []}
              onDoubleTapLike={onDoubleTapLike}
              slideWidth={trainingFeedMediaWidth}
              slideHeight={trainingFeedMediaHeight}
              layout="inset"
            />
          </View>
        ) : null}

        <PostCardCommentsBody
          comments={post.comments}
          commentsCount={commentsCount}
          commentsSectionOpen={commentsSectionOpen}
          commentsUiVisible={commentsUiVisible}
          currentUserId={currentUserId}
          canOpenAuthor={canOpenAuthor}
          onOpenAuthor={onOpenAuthor}
          onToggleComments={onPressComment}
          mentionDirectory={mentionDirectory}
        />

      </View>

      <PostOwnerMenuSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        onEdit={onEdit ? () => onEdit(post.id) : undefined}
        onDelete={confirmDelete}
        isPinned={isPinned}
        onPin={onSetPinned ? () => onSetPinned(post.id) : undefined}
        onUnpin={onSetPinned ? () => onSetPinned(null) : undefined}
      />

      {canOverflow ? (
        <FeedPostOverflowSheet
          visible={overflowOpen}
          authorUsername={post.authorUsername}
          onClose={() => setOverflowOpen(false)}
          onMuteAuthor={() => onMuteAuthor?.(post.userId)}
          onReport={onReportPost}
          onShare={onSharePost}
        />
      ) : null}

      </Animated.View>

      {isBeamActive && feedBeam?.enabled && cardSize.w > 0 && cardSize.h > 0 ? (
        <PostCardGoldBeam width={cardSize.w} height={cardSize.h} />
      ) : null}

      <PostLikesSheet
        visible={likesSheetOpen}
        postId={post.id}
        likesCount={post.likesCount}
        onClose={() => setLikesSheetOpen(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    position: "relative",
    overflow: "visible",
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.14)",
    backgroundColor: "#0a0a0c",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.42,
        shadowRadius: 18,
      },
      android: { elevation: 6 },
      default: {},
    }),
  },
  cardClip: {
    overflow: "hidden",
    borderRadius: 16,
  },
  cardTextOnly: {
    backgroundColor: "rgba(22, 20, 14, 0.72)",
    borderLeftWidth: 3,
    borderLeftColor: "rgba(212, 175, 55, 0.42)",
  },
  cardTraining: {
    borderLeftWidth: 3,
    borderLeftColor: "rgba(212, 175, 55, 0.55)",
  },
  headerPad: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerPadCompact: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  mediaBleed: {
    marginHorizontal: -16,
  },
  mediaInsetPad: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 8,
    gap: 6,
    alignItems: "center",
  },
  mediaInsetLabel: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "600",
  },
  actionBarPad: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 2,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  authorTap: {
    flexShrink: 0,
  },
  avatarSlot: {
    marginTop: 2,
    flexShrink: 0,
  },
  metaCol: {
    flex: 1,
    minWidth: 0,
  },
  metaBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(38, 38, 38, 0.55)",
    paddingBottom: 10,
  },
  metaTop: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  username: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  ownerHint: {
    color: AUTH.muted,
    fontWeight: "400",
  },
  dot: {
    color: AUTH.faint,
    fontSize: 13,
  },
  time: {
    color: AUTH.muted,
    fontSize: 13,
  },
  trainingTag: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  visBadge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  visText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  menuBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    marginTop: 2,
  },
  menuSpacer: {
    width: 36,
  },
  menuIcon: {
    color: AUTH.neutral100,
    fontSize: 22,
    lineHeight: 24,
    marginTop: -4,
    fontWeight: "600",
  },
  menuDisabled: {
    opacity: 0.5,
  },
  bodyPad: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    gap: 12,
  },
  bodyPadCompact: {
    paddingTop: 8,
  },
  content: {
    color: AUTH.neutral100,
    fontSize: 16,
    lineHeight: 24,
  },
  contentTextOnly: {
    fontSize: 17,
    lineHeight: 26,
  },
  hitPressed: {
    opacity: 0.85,
  },
});

export const PostCard = memo(PostCardInner, postCardPropsAreEqual);
