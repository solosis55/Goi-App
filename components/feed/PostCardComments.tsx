import { memo, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { POST_CARD_COMPOSER_THEME } from "../../constants/postCardComposerTheme";
import type { PostComment } from "../../types/post";
import type { MentionPickUser } from "../../utils/mentionAutocomplete";
import { MentionableTextInput } from "../post/MentionableTextInput";
import { MentionHighlightedText } from "../post/MentionHighlightedText";
import { UserAvatar } from "../ui/UserAvatar";
import { ScrollAwarePressable } from "../ui/ScrollAwarePressable";

function CommentRowInner({
  comment,
  currentUserId,
  onOpenAuthor,
  mentionDirectory,
}: {
  comment: PostComment;
  currentUserId: string | undefined;
  onOpenAuthor?: (userId: string) => void;
  mentionDirectory: Map<string, string>;
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
        <MentionHighlightedText
          text={comment.content}
          userDirectory={mentionDirectory}
          onOpenProfile={canOpen ? onOpenAuthor : undefined}
          style={styles.commentContent}
        />
      </Text>
    </View>
  );
}

const CommentRow = memo(CommentRowInner);

export type PostCardCommentComposerProps = {
  visible: boolean;
  commentValue: string;
  onChangeComment: (value: string) => void;
  onSubmitComment: () => void;
  commenting: boolean;
  commentError?: string | null;
  onFocusComposer?: () => void;
  guardScrollPresses: boolean;
  wrapPress: (fn: () => void) => () => void;
  mentionCandidates?: MentionPickUser[];
  onMentionPick?: (picked: MentionPickUser) => void;
};

function PostCardCommentComposerInner({
  visible,
  commentValue,
  onChangeComment,
  onSubmitComment,
  commenting,
  commentError,
  onFocusComposer,
  guardScrollPresses,
  wrapPress,
  mentionCandidates = [],
  onMentionPick,
}: PostCardCommentComposerProps) {
  const theme = POST_CARD_COMPOSER_THEME;
  const canSubmit = commentValue.trim().length > 0 && !commenting;

  if (!visible) return null;

  return (
    <View style={styles.composerPad}>
      <View style={styles.composer}>
        <MentionableTextInput
          value={commentValue}
          onChangeText={onChangeComment}
          candidates={mentionCandidates}
          onMentionPick={onMentionPick}
          listPlacement="above"
          placeholder="Escribe un comentario…"
          placeholderTextColor={theme.textMuted}
          multiline
          maxLength={180}
          editable={!commenting}
          style={[
            styles.commentInput,
            {
              color: theme.textSteel,
              borderColor: theme.border,
              backgroundColor: theme.fieldBg,
            },
          ]}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          selectionColor={theme.primary}
          onFocus={onFocusComposer}
        />
        <View style={styles.composerFooter}>
          <Text style={styles.charCount} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {commentValue.trim().length}/180
          </Text>
          <ScrollAwarePressable
            scrollGuarded={guardScrollPresses}
            onPress={wrapPress(onSubmitComment)}
            disabled={!canSubmit}
            accessibilityRole="button"
            accessibilityLabel="Publicar comentario"
            style={({ pressed }) => [
              styles.sendBtn,
              !canSubmit ? styles.sendBtnDisabled : null,
              pressed && canSubmit ? styles.hitPressed : null,
            ]}
          >
            {commenting ? (
              <ActivityIndicator size="small" color={AUTH.gold} />
            ) : (
              <Text
                style={[styles.sendBtnText, !canSubmit ? styles.sendBtnTextDisabled : null]}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                Enviar
              </Text>
            )}
          </ScrollAwarePressable>
        </View>
        {commentError ? (
          <Text style={styles.commentError} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {commentError}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

export const PostCardCommentComposer = memo(PostCardCommentComposerInner);

export type PostCardCommentsBodyProps = {
  comments: PostComment[];
  commentsCount: number;
  commentsSectionOpen: boolean;
  commentsUiVisible: boolean;
  currentUserId: string | undefined;
  canOpenAuthor: boolean;
  onOpenAuthor?: (authorUserId: string, authorUsername: string) => void;
  onToggleComments: () => void;
  mentionDirectory: Map<string, string>;
};

function PostCardCommentsBodyInner({
  comments,
  commentsCount,
  commentsSectionOpen,
  commentsUiVisible,
  currentUserId,
  canOpenAuthor,
  onOpenAuthor,
  onToggleComments,
  mentionDirectory,
}: PostCardCommentsBodyProps) {
  const commentPreview = comments.slice(-2);

  const openAuthorFor = useCallback(
    (comment: PostComment) => {
      if (!canOpenAuthor || !onOpenAuthor) return undefined;
      return (userId: string) => onOpenAuthor(userId, comment.authorUsername);
    },
    [canOpenAuthor, onOpenAuthor]
  );

  if (!commentsUiVisible || commentsCount === 0) return null;

  return (
    <>
      {commentsCount > 0 && !commentsSectionOpen ? (
        <View style={styles.commentPreview}>
          {commentPreview.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              currentUserId={currentUserId}
              onOpenAuthor={openAuthorFor(c)}
              mentionDirectory={mentionDirectory}
            />
          ))}
        </View>
      ) : null}

      <Pressable
        onPress={onToggleComments}
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
      </Pressable>

      {commentsSectionOpen ? (
        <View style={styles.commentsList}>
          {comments.map((c) => (
            <CommentRow
              key={c.id}
              comment={c}
              currentUserId={currentUserId}
              onOpenAuthor={openAuthorFor(c)}
              mentionDirectory={mentionDirectory}
            />
          ))}
        </View>
      ) : null}
    </>
  );
}

export const PostCardCommentsBody = memo(PostCardCommentsBodyInner);

const styles = StyleSheet.create({
  composerPad: {
    paddingHorizontal: 14,
    paddingBottom: 8,
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
  hitPressed: {
    opacity: 0.85,
  },
  commentError: {
    color: AUTH.danger,
    fontSize: 12,
  },
  commentPreview: {
    gap: 8,
    marginTop: 2,
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
  commentContent: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 19,
  },
});
