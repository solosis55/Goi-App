import { useCallback, useEffect, useRef, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { GuardedScrollView } from "../../context/ScrollInteractionGuard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useGoiTheme } from "../../constants/theme";
import type { Post } from "../../types/post";
import { PostCard } from "../feed/PostCard";

type ProfilePostDetailModalProps = {
  visible: boolean;
  post: Post | null;
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
  onClose: () => void;
  /** Tras cerrar el modal (tras la animación); útil para liberar el post y refrescar miniaturas. */
  onAfterClose?: () => void;
  saved?: boolean;
  onToggleSave?: () => void;
  pinnedPostId?: string | null;
  onSetPinned?: (postId: string | null) => void;
};

export function ProfilePostDetailModal({
  visible,
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
  onClose,
  onAfterClose,
  saved,
  onToggleSave,
  pinnedPostId,
  onSetPinned,
}: ProfilePostDetailModalProps) {
  const insets = useSafeAreaInsets();
  const { palette, typography } = useGoiTheme();
  const [contentMounted, setContentMounted] = useState(false);
  const wasVisibleRef = useRef(false);
  const afterCloseFiredRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const notifyAfterClose = useCallback(() => {
    if (afterCloseFiredRef.current) return;
    afterCloseFiredRef.current = true;
    onAfterClose?.();
  }, [onAfterClose]);

  useEffect(() => {
    if (visible && post) {
      setContentMounted(true);
      afterCloseFiredRef.current = false;
      wasVisibleRef.current = true;
      return;
    }
    if (!visible) {
      setContentMounted(false);
    }
    if (!wasVisibleRef.current) return;
    wasVisibleRef.current = false;
    const timer = setTimeout(notifyAfterClose, 400);
    return () => clearTimeout(timer);
  }, [visible, post, notifyAfterClose]);

  const requestClose = useCallback(() => {
    setContentMounted(false);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      onClose();
    }, 120);
  }, [onClose]);

  useEffect(
    () => () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    },
    []
  );

  if (!visible && !post) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={requestClose}
      onDismiss={notifyAfterClose}
    >
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={requestClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cerrar">
            <Text style={styles.closeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Cerrar
            </Text>
          </Pressable>
          <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Publicación
          </Text>
          <View style={styles.headerSide} />
        </View>
        <GuardedScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }}
        >
          {post && contentMounted ? (
            <PostCard
              guardScrollPresses
              post={post}
              currentUserId={currentUserId}
              sessionAvatarUrl={sessionAvatarUrl}
              commentValue={commentValue}
              onChangeComment={onChangeComment}
              onSubmitComment={onSubmitComment}
              onToggleLike={onToggleLike}
              onDelete={onDelete}
              onEdit={onEdit}
              deleting={deleting}
              commenting={commenting}
              commentError={commentError}
              saved={saved}
              onToggleSave={onToggleSave}
              pinnedPostId={pinnedPostId}
              onSetPinned={onSetPinned}
              palette={palette}
              typography={typography}
            />
          ) : null}
        </GuardedScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.bg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
  },
  headerSide: {
    minWidth: 56,
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "600",
  },
  closeText: {
    color: AUTH.gold,
    fontSize: 16,
    fontWeight: "600",
  },
});
