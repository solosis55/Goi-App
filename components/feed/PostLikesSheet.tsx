import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getPostLikes } from "../../api/posts";
import { ApiError } from "../../api/client";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { PostLikeEntry } from "../../types/post";
import { formatPostRelative } from "../../utils/feedPostDate";
import { UserAvatar } from "../ui/UserAvatar";

type PostLikesSheetProps = {
  visible: boolean;
  postId: string;
  likesCount: number;
  onClose: () => void;
};

function PostLikeRow({ entry }: { entry: PostLikeEntry }) {
  const router = useRouter();
  const when = formatPostRelative(entry.likedAt);

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/usuario/[id]", params: { id: entry.id } })}
      style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}
      accessibilityRole="button"
      accessibilityLabel={`Ver perfil de ${entry.username}`}
    >
      <UserAvatar src={entry.avatarUrl} username={entry.username} size={46} />
      <View style={styles.rowBody}>
        <Text style={styles.username} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          @{entry.username}
        </Text>
        <Text style={styles.when} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {when}
        </Text>
      </View>
    </Pressable>
  );
}

export function PostLikesSheet({ visible, postId, likesCount, onClose }: PostLikesSheetProps) {
  const insets = useSafeAreaInsets();
  const [likes, setLikes] = useState<PostLikeEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getPostLikes(postId);
      setLikes(res.likes);
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : "No se pudo cargar la lista.";
      setError(msg);
      setLikes([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    if (!visible) return;
    void load();
  }, [visible, load]);

  const title =
    likesCount === 1 ? "1 me gusta" : `${Math.max(likesCount, likes.length)} me gusta`;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 8, maxHeight: "78%" }]}>
        <View style={styles.handle} />
        <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {title}
        </Text>

        {loading ? (
          <ActivityIndicator color={AUTH.gold} style={styles.loader} />
        ) : error ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              No se pudo cargar
            </Text>
            <Text style={styles.emptyBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {error}
            </Text>
            <Pressable onPress={() => void load()} style={styles.retryBtn}>
              <Text style={styles.retryText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : likes.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Aún no hay me gusta en esta publicación.
            </Text>
          </View>
        ) : (
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {likes.map((entry) => (
              <PostLikeRow key={entry.id} entry={entry} />
            ))}
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(38, 38, 38, 0.95)",
    backgroundColor: "rgba(10, 10, 12, 0.98)",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(115, 115, 115, 0.8)",
    marginBottom: 12,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  loader: {
    marginVertical: 28,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 10,
  },
  rowPressed: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  username: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "600",
  },
  when: {
    color: AUTH.muted,
    fontSize: 12,
  },
  emptyBox: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
    gap: 8,
  },
  emptyTitle: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "600",
  },
  emptyBody: {
    color: AUTH.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: AUTH.gold,
  },
  retryText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "800",
  },
});
