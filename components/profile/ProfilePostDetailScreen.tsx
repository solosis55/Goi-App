import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { GuardedScrollView } from "../../context/ScrollInteractionGuard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createComment, deletePost, toggleLike } from "../../api/posts";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { commentFormSchema } from "../../constants/commentSchema";
import { useAuth } from "../../context/AuthContext";
import type { Post } from "../../types/post";
import { getErrorMessage } from "../../utils/errorMessages";
import {
  commitProfilePostDetailSync,
  consumeOpeningProfileMeta,
  consumeOpeningProfilePost,
} from "../../utils/profilePostDetailSession";
import { PostCard } from "../feed/PostCard";

type ProfilePostDetailScreenProps = {
  postId: string;
  ownProfile?: boolean;
};

export function ProfilePostDetailScreen({ postId, ownProfile }: ProfilePostDetailScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const likeInFlightRef = useRef(new Set<string>());

  const [openingMeta] = useState(() => consumeOpeningProfileMeta());
  const [post, setPost] = useState<Post | null>(() => consumeOpeningProfilePost(postId));
  const [commentValue, setCommentValue] = useState("");
  const [commentError, setCommentError] = useState<string | null>(null);
  const [commenting, setCommenting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const syncedRef = useRef(false);

  const pinnedPostId = openingMeta?.pinnedPostId;
  const onSetPinned = openingMeta?.onSetPinned;

  const goBack = useCallback(
    (syncPost: Post | null, deleted = false) => {
      if (!syncedRef.current) {
        syncedRef.current = true;
        commitProfilePostDetailSync(syncPost, deleted);
      }
      if (router.canGoBack()) router.back();
      else router.replace("/(tabs)/perfil");
    },
    [router]
  );

  useEffect(() => {
    if (!post) goBack(null);
  }, [post, goBack]);

  const handleToggleLike = useCallback(async () => {
    if (!post || likeInFlightRef.current.has(post.id)) return;
    likeInFlightRef.current.add(post.id);
    const liked = !post.likedByMe;
    const delta = liked ? 1 : -1;
    setPost((p) =>
      p
        ? { ...p, likedByMe: liked, likesCount: Math.max(0, p.likesCount + delta) }
        : p
    );
    try {
      await toggleLike(post.id);
    } catch {
      setPost((p) =>
        p ? { ...p, likedByMe: post.likedByMe, likesCount: post.likesCount } : p
      );
    } finally {
      likeInFlightRef.current.delete(post.id);
    }
  }, [post]);

  const handleSubmitComment = useCallback(async () => {
    if (!post || commenting) return;
    const parsed = commentFormSchema.safeParse({ content: commentValue });
    if (!parsed.success) {
      setCommentError(parsed.error.issues[0]?.message ?? "Comentario no válido");
      return;
    }
    setCommentError(null);
    setCommenting(true);
    try {
      const newComment = await createComment(post.id, { content: parsed.data.content });
      setCommentValue("");
      setPost((p) =>
        p
          ? {
              ...p,
              comments: [...p.comments, newComment].sort((a, b) =>
                a.createdAt < b.createdAt ? -1 : 1
              ),
            }
          : p
      );
    } catch (e) {
      setCommentError(getErrorMessage(e, "No se pudo publicar el comentario"));
    } finally {
      setCommenting(false);
    }
  }, [post, commentValue, commenting]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!user?.id || deleting) return;
      setDeleting(true);
      try {
        await deletePost(id);
        if (pinnedPostId === id) await onSetPinned?.(null);
        if (!syncedRef.current) {
          syncedRef.current = true;
          commitProfilePostDetailSync(post, true);
        }
        if (router.canGoBack()) router.back();
        else router.replace("/(tabs)/perfil");
      } catch {
        setDeleting(false);
      }
    },
    [user?.id, deleting, pinnedPostId, onSetPinned, goBack]
  );

  const handleEdit = useCallback(
    (id: string) => {
      commitProfilePostDetailSync(post, false);
      router.push({ pathname: "/editar-publicacion", params: { id } });
    },
    [router, post]
  );

  if (!post) return null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => goBack(post)}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Cerrar"
        >
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
        <PostCard
          guardScrollPresses
          post={post}
          currentUserId={user?.id}
          sessionAvatarUrl={user?.avatarUrl}
          onPressSession={
            post.sessionId
              ? () =>
                  router.push({
                    pathname: "/sesion/[id]",
                    params: { id: post.sessionId as string, postId: post.id },
                  })
              : undefined
          }
          workoutTitle={post.sessionWorkoutTitle ?? undefined}
          commentValue={commentValue}
          onChangeComment={setCommentValue}
          onSubmitComment={() => void handleSubmitComment()}
          onToggleLike={() => void handleToggleLike()}
          onDelete={ownProfile ? handleDelete : undefined}
          onEdit={ownProfile ? handleEdit : undefined}
          deleting={deleting}
          commenting={commenting}
          commentError={commentError}
          pinnedPostId={ownProfile ? pinnedPostId : undefined}
          onSetPinned={ownProfile ? onSetPinned : undefined}
        />
      </GuardedScrollView>
    </View>
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
