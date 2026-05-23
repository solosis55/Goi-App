import * as Haptics from "expo-haptics";
import { memo, useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { useGoiTheme } from "../../constants/theme";
import type { Post, PostComment } from "../../types/post";
import { formatPostRelative } from "../../utils/feedPostDate";
import { visibilityBadgeStyle, visibilityLabel } from "../../utils/visibilityStyles";
import { UserAvatar } from "../ui/UserAvatar";
import { PostActionBar } from "./PostActionBar";
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
};

function CommentRow({
  comment,
  currentUserId,
}: {
  comment: PostComment;
  currentUserId: string | undefined;
}) {
  const avatarUri = comment.authorAvatarUrl ? resolveMediaUrl(comment.authorAvatarUrl) : "";
  const isOwn = currentUserId != null && comment.userId === currentUserId;

  return (
    <View style={styles.commentRow}>
      <UserAvatar
        src={comment.authorAvatarUrl}
        username={comment.authorUsername}
        size={32}
      />
      <Text style={styles.commentBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        <Text style={styles.commentAuthor}>
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
}: PostCardProps) {
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [composerExpanded, setComposerExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [overflowOpen, setOverflowOpen] = useState(false);
  const commentsCount = post.comments.length;
  const isOwner = currentUserId != null && post.userId === currentUserId;
  const visibility = post.visibility ?? "public";
  const visStyle = visibilityBadgeStyle(visibility);
  const hasMedia = (post.media?.length ?? 0) > 0;
  const authorAvatarSrc =
    post.authorAvatarUrl?.trim() || (isOwner && sessionAvatarUrl?.trim() ? sessionAvatarUrl : "") || "";
  const showComposer = composerExpanded || commentValue.trim().length > 0;
  const canSubmitComment = commentValue.trim().length > 0 && !commenting;
  const canManage = isOwner && (!!onDelete || !!onEdit || !!onSetPinned);
  const canOverflow = !isOwner && !!onMuteAuthor;
  const canOpenAuthor = !isOwner && !!onOpenAuthor;
  const isPinned = Boolean(pinnedPostId?.trim() && pinnedPostId === post.id);

  const openAuthor = useCallback(() => {
    if (canOpenAuthor && onOpenAuthor) onOpenAuthor(post.userId, post.authorUsername);
  }, [canOpenAuthor, onOpenAuthor, post.userId, post.authorUsername]);

  const openCommentComposer = useCallback(() => {
    if (commentsCount > 0) setCommentsOpen(true);
    setComposerExpanded(true);
  }, [commentsCount]);

  const onDoubleTapLike = useCallback(() => {
    hapticLike();
    onToggleLike();
  }, [onToggleLike]);

  const confirmDelete = useCallback(() => {
    if (!onDelete) return;
    const run = () => onDelete(post.id);

    if (Platform.OS === "web") {
      if (typeof globalThis.confirm === "function" && globalThis.confirm("¿Eliminar esta publicación?")) {
        run();
      }
      return;
    }

    Alert.alert("Eliminar publicación", "Esta acción no se puede deshacer.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: run },
    ]);
  }, [onDelete, post.id]);

  return (
    <View style={styles.card}>
      <View style={styles.headerPad}>
        <View style={styles.headerRow}>
          <Pressable
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
          </Pressable>
          <Pressable
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
              <View style={[styles.visBadge, { borderColor: visStyle.borderColor, backgroundColor: visStyle.backgroundColor }]}>
                <Text style={[styles.visText, { color: visStyle.color }]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {visibilityLabel(visibility)}
                </Text>
              </View>
            </View>
          </Pressable>
          {canManage || canOverflow ? (
            <Pressable
              onPress={() => (canManage ? setMenuOpen(true) : setOverflowOpen(true))}
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
            </Pressable>
          ) : (
            <View style={styles.menuSpacer} />
          )}
        </View>
      </View>

      {hasMedia ? <PostMediaCarousel media={post.media ?? []} onDoubleTapLike={onDoubleTapLike} /> : null}

      <PostActionBar
        liked={!!post.likedByMe}
        likesCount={post.likesCount}
        onToggleLike={onToggleLike}
        onPressComment={openCommentComposer}
        saved={saved}
        onToggleSave={onToggleSave}
      />

      <View style={styles.bodyPad}>
        {post.content ? (
          <Text style={styles.content} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {post.content}
          </Text>
        ) : null}

        {commentsCount > 0 ? (
          <Pressable
            onPress={() => setCommentsOpen((o) => !o)}
            accessibilityRole="button"
            accessibilityState={{ expanded: commentsOpen }}
            hitSlop={6}
            style={styles.commentsToggle}
          >
            <Text style={styles.statsComments} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {commentsOpen
                ? "Ocultar comentarios"
                : `Ver ${commentsCount} ${commentsCount === 1 ? "comentario" : "comentarios"}`}
            </Text>
          </Pressable>
        ) : null}

        {commentsCount > 0 && commentsOpen ? (
          <View style={styles.commentsList}>
            {post.comments.map((c) => (
              <CommentRow key={c.id} comment={c} currentUserId={currentUserId} />
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
              onFocus={() => setComposerExpanded(true)}
            />
            <View style={styles.composerFooter}>
              <Text style={styles.charCount} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {commentValue.trim().length}/180
              </Text>
              <Pressable
                onPress={onSubmitComment}
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
              </Pressable>
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
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(38, 38, 38, 0.9)",
    backgroundColor: "rgba(9, 9, 11, 0.82)",
    overflow: "hidden",
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
  headerPad: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
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
  content: {
    color: AUTH.neutral100,
    fontSize: 16,
    lineHeight: 24,
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
