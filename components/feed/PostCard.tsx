import * as Haptics from "expo-haptics";
import { memo, useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useGoiAlert } from "../../context/GoiAlertContext";
import type { useGoiTheme } from "../../constants/theme";
import type { Post, PostComment } from "../../types/post";
import { formatPostRelative } from "../../utils/feedPostDate";
import { visibilityBadgeStyle, visibilityLabel } from "../../utils/visibilityStyles";
import { useFeedGoldBeam } from "../../context/FeedGoldBeamContext";
import { PostCardGoldBeam } from "./PostCardGoldBeam";
import { UserAvatar } from "../ui/UserAvatar";
import { TabDumbbellIcon } from "../navigation/TabBarIcons";
import { PostActionBar } from "./PostActionBar";
import { usePressGuard } from "../../hooks/usePressGuard";
import { TapSlopPressable } from "../ui/TapSlopPressable";
import { PostMediaCarousel } from "./PostMediaCarousel";
import { FeedPostOverflowSheet } from "./FeedPostOverflowSheet";
import { PostOwnerMenuSheet } from "./PostOwnerMenuSheet";

type ThemeSlice = {
  palette: ReturnType<typeof useGoiTheme>["palette"];
  typography: ReturnType<typeof useGoiTheme>["typography"];
};

type PostCardProps = ThemeSlice & {
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
  highlighted?: boolean;
  /** Tarjeta central del feed: muestra el brillo dorado al hacer scroll. */
  isBeamActive?: boolean;
  /** Dentro de un ScrollView con scroll vertical (detalle desde perfil). */
  guardScrollPresses?: boolean;
};

function CommentRow({
  comment,
  currentUserId,
  onOpenAuthor,
}: {
  comment: PostComment;
  currentUserId: string | undefined;
  onOpenAuthor?: (userId: string) => void;
}) {
  const isOwn = currentUserId != null && comment.userId === currentUserId;
  const canOpen = !isOwn && !!onOpenAuthor;

  return (
    <View style={styles.commentRow}>
      <Pressable
        onPress={canOpen ? () => onOpenAuthor?.(comment.userId) : undefined}
        disabled={!canOpen}
        accessibilityRole={canOpen ? "button" : undefined}
        accessibilityLabel={canOpen ? `Ver perfil de ${comment.authorUsername}` : undefined}
      >
        <UserAvatar src={comment.authorAvatarUrl} username={comment.authorUsername} size={32} />
      </Pressable>
      <Text style={styles.commentBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        <Text
          style={styles.commentAuthor}
          onPress={canOpen ? () => onOpenAuthor?.(comment.userId) : undefined}
          suppressHighlighting={!canOpen}
        >
          {comment.authorUsername}
          {isOwn ? <Text style={styles.commentOwn}> (tú)</Text> : null}
        </Text>
        <Text style={styles.commentMuted}> · </Text>
        {comment.content}
      </Text>
    </View>
  );
}

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
  palette,
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
  highlighted,
  isBeamActive = false,
  guardScrollPresses = false,
}: PostCardProps) {
  const press = usePressGuard(guardScrollPresses);
  const Touchable = guardScrollPresses ? TapSlopPressable : Pressable;
  const feedBeam = useFeedGoldBeam();
  const cardWrapRef = useRef<View>(null);
  const [cardSize, setCardSize] = useState({ w: 0, h: 0 });
  const { width: screenWidth } = useWindowDimensions();
  const mediaSlideWidth = Math.min(screenWidth, 672);
  const { showAlert } = useGoiAlert();
  const [commentsSectionOpen, setCommentsSectionOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const commentsCount = post.comments.length;
  const isOwner = currentUserId != null && post.userId === currentUserId;
  const visibility = post.visibility ?? "public";
  const visStyle = visibilityBadgeStyle(visibility);
  const hasMedia = (post.media?.length ?? 0) > 0;
  const authorAvatarSrc =
    post.authorAvatarUrl?.trim() || (isOwner && sessionAvatarUrl?.trim() ? sessionAvatarUrl : "") || "";
  const showComposer = commentsSectionOpen || commentValue.trim().length > 0;
  const canSubmitComment = commentValue.trim().length > 0 && !commenting;
  const canManage = isOwner && (!!onDelete || !!onEdit || !!onSetPinned);
  const canOverflow = !isOwner && (!!onMuteAuthor || !!onReportPost || !!onSharePost);
  const commentPreview = post.comments.slice(-2);
  const canOpenAuthor = !isOwner && !!onOpenAuthor;
  const isPinned = Boolean(pinnedPostId?.trim() && pinnedPostId === post.id);

  const openAuthor = useCallback(
    press(() => {
      if (canOpenAuthor && onOpenAuthor) onOpenAuthor(post.userId, post.authorUsername);
    }),
    [press, canOpenAuthor, onOpenAuthor, post.userId, post.authorUsername]
  );

  const toggleCommentsSection = useCallback(
    press(() => {
      setCommentsSectionOpen((open) => !open);
    }),
    [press]
  );

  const onDoubleTapLike = useCallback(
    press(() => {
      hapticLike();
      onToggleLike();
    }),
    [press, onToggleLike]
  );

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

  const showLikesModal = useCallback(() => {
    showAlert({
      title: "Próximamente",
      message: "La lista de me gusta estará disponible pronto.",
      buttons: [{ text: "Entendido", style: "default" }],
    });
  }, [showAlert]);

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
          highlightBorderStyle,
        ]}
      >
      <View style={[styles.headerPad, !hasMedia ? styles.headerPadCompact : null]}>
        <View style={styles.headerRow}>
          <Touchable
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
          </Touchable>
          <Touchable
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
              {showVisBadge ? (
                <View style={[styles.visBadge, { borderColor: visStyle.borderColor, backgroundColor: visStyle.backgroundColor }]}>
                  <Text style={[styles.visText, { color: visStyle.color }]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    {visibilityLabel(visibility)}
                  </Text>
                </View>
              ) : null}
            </View>
          </Touchable>
          {canManage || canOverflow ? (
            <Touchable
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
            </Touchable>
          ) : (
            <View style={styles.menuSpacer} />
          )}
        </View>
      </View>

      {hasMedia ? (
        <View style={styles.mediaBleed}>
          <PostMediaCarousel
            media={post.media ?? []}
            onDoubleTapLike={onDoubleTapLike}
            slideWidth={mediaSlideWidth}
            guardScrollPresses={guardScrollPresses}
          />
        </View>
      ) : null}

      {workoutTitle?.trim() ? (
        <View style={styles.workoutChipWrap}>
          <View style={styles.workoutChip}>
            <TabDumbbellIcon size={14} color={AUTH.gold} filled />
            <Text style={styles.workoutChipText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {workoutTitle.trim()}
            </Text>
          </View>
        </View>
      ) : null}

      <View style={styles.actionBarPad}>
        <PostActionBar
          liked={!!post.likedByMe}
          likesCount={post.likesCount}
          commentsCount={commentsCount}
          onToggleLike={press(onToggleLike)}
          onPressComment={toggleCommentsSection}
          commentsExpanded={commentsSectionOpen}
          onPressShare={onSharePost ? press(onSharePost) : undefined}
          onPressLikesCount={press(showLikesModal)}
          onPressCommentsCount={toggleCommentsSection}
          saved={saved}
          onToggleSave={onToggleSave ? press(onToggleSave) : undefined}
          guardScrollPresses={guardScrollPresses}
        />
      </View>

      <View style={[styles.bodyPad, !hasMedia ? styles.bodyPadCompact : null]}>
        {post.content ? (
          <Text
            style={[styles.content, !hasMedia ? styles.contentTextOnly : null]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {post.content}
          </Text>
        ) : null}

        {commentsCount > 0 && !commentsSectionOpen ? (
          <View style={styles.commentPreview}>
            {commentPreview.map((c) => (
              <CommentRow
                key={c.id}
                comment={c}
                currentUserId={currentUserId}
                onOpenAuthor={
                  canOpenAuthor && onOpenAuthor
                    ? (id) => onOpenAuthor(id, c.authorUsername)
                    : undefined
                }
              />
            ))}
          </View>
        ) : null}

        {commentsCount > 0 ? (
          <Touchable
            onPress={toggleCommentsSection}
            accessibilityRole="button"
            accessibilityState={{ expanded: commentsSectionOpen }}
            hitSlop={6}
            style={styles.commentsToggle}
          >
            <Text style={styles.statsComments} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {commentsSectionOpen
                ? "Ocultar comentarios"
                : `Ver ${commentsCount} ${commentsCount === 1 ? "comentario" : "comentarios"}`}
            </Text>
          </Touchable>
        ) : null}

        {commentsCount > 0 && commentsSectionOpen ? (
          <View style={styles.commentsList}>
            {post.comments.map((c) => (
              <CommentRow
                key={c.id}
                comment={c}
                currentUserId={currentUserId}
                onOpenAuthor={
                  canOpenAuthor && onOpenAuthor
                    ? (id) => onOpenAuthor(id, c.authorUsername)
                    : undefined
                }
              />
            ))}
          </View>
        ) : null}

        {showComposer ? (
          <View style={styles.composer}>
            <TextInput
              value={commentValue}
              onChangeText={onChangeComment}
              placeholder="Escribe un comentario…"
              placeholderTextColor={palette.textMuted}
              multiline
              maxLength={180}
              editable={!commenting}
              style={[styles.commentInput, { color: palette.textSteel, borderColor: palette.border, backgroundColor: palette.fieldBg }]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              selectionColor={palette.primary}
              onFocus={() => setCommentsSectionOpen(true)}
            />
            <View style={styles.composerFooter}>
              <Text style={styles.charCount} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {commentValue.trim().length}/180
              </Text>
              <Touchable
                onPress={press(onSubmitComment)}
                disabled={!canSubmitComment}
                accessibilityRole="button"
                accessibilityLabel="Publicar comentario"
                style={({ pressed }) => [
                  styles.sendBtn,
                  !canSubmitComment ? styles.sendBtnDisabled : null,
                  pressed && canSubmitComment ? styles.hitPressed : null,
                ]}
              >
                {commenting ? (
                  <ActivityIndicator size="small" color={AUTH.gold} />
                ) : (
                  <Text
                    style={[styles.sendBtnText, !canSubmitComment ? styles.sendBtnTextDisabled : null]}
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  >
                    Enviar
                  </Text>
                )}
              </Touchable>
            </View>
            {commentError ? (
              <Text style={styles.commentError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {commentError}
              </Text>
            ) : null}
          </View>
        ) : null}
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

      {isBeamActive && feedBeam && cardSize.w > 0 && cardSize.h > 0 ? (
        <PostCardGoldBeam hostRef={cardWrapRef} width={cardSize.w} height={cardSize.h} />
      ) : null}
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
  actionBarPad: {
    paddingHorizontal: 14,
    paddingTop: 4,
    paddingBottom: 2,
  },
  workoutChipWrap: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    paddingTop: 2,
  },
  workoutChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.28)",
    backgroundColor: "rgba(28, 26, 18, 0.75)",
  },
  workoutChipText: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "600",
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
  commentPreview: {
    gap: 8,
    marginTop: 2,
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
  commentsToggle: {
    alignSelf: "flex-start",
  },
  statsComments: {
    color: AUTH.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  commentsList: {
    borderLeftWidth: 2,
    borderLeftColor: "rgba(212, 175, 55, 0.2)",
    paddingLeft: 12,
    gap: 10,
  },
  commentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  commentBody: {
    flex: 1,
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  commentAuthor: {
    color: "#d4d4d4",
    fontWeight: "500",
  },
  commentOwn: {
    color: AUTH.faint,
    fontWeight: "400",
  },
  commentMuted: {
    color: AUTH.faint,
  },
  composer: {
    marginTop: 4,
    gap: 8,
  },
  commentInput: {
    minHeight: 44,
    maxHeight: 100,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    textAlignVertical: "top",
  },
  composerFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  charCount: {
    color: AUTH.muted,
    fontSize: 12,
  },
  sendBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.48)",
    backgroundColor: "rgba(35, 32, 22, 0.96)",
    minWidth: 80,
    alignItems: "center",
  },
  sendBtnDisabled: {
    borderColor: AUTH.fieldBorder,
    backgroundColor: "#141416",
  },
  sendBtnText: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  sendBtnTextDisabled: {
    color: AUTH.faint,
  },
  commentError: {
    color: AUTH.danger,
    fontSize: 12,
  },
  hitPressed: {
    opacity: 0.85,
  },
});

export const PostCard = memo(PostCardInner);
