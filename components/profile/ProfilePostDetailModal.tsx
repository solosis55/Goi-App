import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
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
  saved,
  onToggleSave,
  pinnedPostId,
  onSetPinned,
}: ProfilePostDetailModalProps) {
  const insets = useSafeAreaInsets();
  const { palette, typography } = useGoiTheme();

  if (!post) return null;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Pressable onPress={onClose} hitSlop={12} accessibilityRole="button" accessibilityLabel="Cerrar">
            <Text style={styles.closeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Cerrar
            </Text>
          </Pressable>
          <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Publicación
          </Text>
          <View style={styles.headerSide} />
        </View>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: insets.bottom + 24, paddingHorizontal: 16 }}
        >
          <PostCard
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
        </ScrollView>
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
