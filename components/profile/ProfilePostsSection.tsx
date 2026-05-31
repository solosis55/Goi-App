import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { createComment, deletePost, toggleLike } from "../../api/posts";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { commentFormSchema } from "../../constants/commentSchema";
import { useAuth } from "../../context/AuthContext";
import { useProfilePosts } from "../../hooks/useProfilePosts";
import { useFeedPrefsStore } from "../../stores/useFeedPrefsStore";
import type { Post } from "../../types/post";
import { getErrorMessage } from "../../utils/errorMessages";
import { useSyncProfilePostFromDetail } from "../../hooks/useSyncProfilePostFromDetail";
import {
  openProfilePostDetail,
  usesProfilePostDetailScreen,
} from "../../utils/openProfilePostDetail";
import { ProfilePostDetailModal } from "./ProfilePostDetailModal";
import { ProfilePostsGrid } from "./ProfilePostsGrid";
import { ProfilePostsGridSkeleton } from "./ProfilePostsGridSkeleton";
import { ProfilePinnedPostBanner } from "./ProfilePinnedPostBanner";
import { ProfilePostsToolbar } from "./ProfilePostsToolbar";

type ProfilePostsSectionProps = {
  userId: string | undefined;
  pinnedPostId?: string | null;
  onSetPinned: (postId: string | null) => Promise<void>;
  onBindRefresh?: (refresh: () => Promise<void>) => void;
  onPostsTotalChange?: (total: number) => void;
};

export function ProfilePostsSection({
  userId,
  pinnedPostId,
  onSetPinned,
  onBindRefresh,
  onPostsTotalChange,
}: ProfilePostsSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const useDetailScreen = usesProfilePostDetailScreen();
  const postsState = useProfilePosts(userId, pinnedPostId);
  const savedPostIds = useFeedPrefsStore((s) => s.savedPostIds);
  const toggleSavedPostForUser = useFeedPrefsStore((s) => s.toggleSavedPostForUser);
  const savedIdSet = useMemo(() => new Set(savedPostIds), [savedPostIds]);

  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [modalPost, setModalPost] = useState<Post | null>(null);
  const [gridThumbKey, setGridThumbKey] = useState(0);
  const [commentByPostId, setCommentByPostId] = useState<Record<string, string>>({});
  const [commentErrorsByPostId, setCommentErrorsByPostId] = useState<Record<string, string | null>>({});
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const likeInFlightRef = useRef(new Set<string>());

  useEffect(() => {
    onBindRefresh?.(postsState.refreshAll);
  }, [onBindRefresh, postsState.refreshAll]);

  useEffect(() => {
    onPostsTotalChange?.(postsState.total);
  }, [onPostsTotalChange, postsState.total]);

  useEffect(() => {
    postsState.refreshSavedLocal();
  }, [savedPostIds, postsState.refreshSavedLocal]);

  const selectedPost = useMemo(() => {
    if (!selectedPostId) return null;
    return (
      postsState.displayedPosts.find((p) => p.id === selectedPostId) ??
      postsState.myPosts.find((p) => p.id === selectedPostId) ??
      postsState.savedPosts.find((p) => p.id === selectedPostId) ??
      null
    );
  }, [selectedPostId, postsState.displayedPosts, postsState.myPosts, postsState.savedPosts]);

  useEffect(() => {
    if (selectedPost) setModalPost(selectedPost);
  }, [selectedPost]);

  const detailPost = modalPost ?? selectedPost;

  const closePostDetail = useCallback(() => {
    setGridThumbKey((k) => k + 1);
    setSelectedPostId(null);
  }, []);

  const patchPostInLists = useCallback(
    (postId: string, updater: (p: Post) => Post) => {
      postsState.setMyPosts((prev) => prev.map((p) => (p.id === postId ? updater(p) : p)));
    },
    [postsState]
  );

  const applyPostSync = useCallback(
    (sync: { post: Post | null; deleted?: boolean }) => {
      if (sync.deleted && sync.post) {
        postsState.removePost(sync.post.id);
        if (pinnedPostId === sync.post.id) void onSetPinned(null);
        return;
      }
      if (sync.post) {
        patchPostInLists(sync.post.id, () => sync.post!);
      }
    },
    [postsState, pinnedPostId, onSetPinned, patchPostInLists]
  );

  useSyncProfilePostFromDetail(applyPostSync);

  const openPost = useCallback(
    (id: string) => {
      const p =
        postsState.displayedPosts.find((x) => x.id === id) ??
        postsState.myPosts.find((x) => x.id === id) ??
        postsState.savedPosts.find((x) => x.id === id);
      if (!p) return;
      openProfilePostDetail({
        router,
        post: p,
        ownProfile: true,
        openingMeta: { pinnedPostId, onSetPinned },
        onOpenModal: () => {
          setModalPost(p);
          setSelectedPostId(id);
        },
      });
    },
    [postsState.displayedPosts, postsState.myPosts, postsState.savedPosts, router, pinnedPostId, onSetPinned]
  );

  const handleToggleLike = useCallback(async () => {
    if (!selectedPostId || !user?.id || likeInFlightRef.current.has(selectedPostId)) return;

    const snapshot =
      postsState.displayedPosts.find((p) => p.id === selectedPostId) ??
      postsState.myPosts.find((p) => p.id === selectedPostId);
    if (!snapshot) return;

    const wasLiked = !!snapshot.likedByMe;
    const optimisticLiked = !wasLiked;

    patchPostInLists(selectedPostId, (p) => {
      let nextCount = p.likesCount;
      if (optimisticLiked && !wasLiked) nextCount += 1;
      else if (!optimisticLiked && wasLiked) nextCount = Math.max(0, nextCount - 1);
      return { ...p, likedByMe: optimisticLiked, likesCount: nextCount };
    });

    likeInFlightRef.current.add(selectedPostId);
    try {
      const { liked } = await toggleLike(selectedPostId);
      patchPostInLists(selectedPostId, (p) => {
        let nextCount = snapshot.likesCount;
        if (liked && !snapshot.likedByMe) nextCount += 1;
        else if (!liked && snapshot.likedByMe) nextCount = Math.max(0, snapshot.likesCount - 1);
        return { ...p, likedByMe: liked, likesCount: nextCount };
      });
    } catch (e) {
      patchPostInLists(selectedPostId, () => snapshot);
      setActionMessage(getErrorMessage(e, "No se pudo actualizar el me gusta."));
    } finally {
      likeInFlightRef.current.delete(selectedPostId);
    }
  }, [selectedPostId, user?.id, postsState.displayedPosts, postsState.myPosts, patchPostInLists]);

  const handleCreateComment = useCallback(async () => {
    if (!selectedPostId || !user?.id || commentingPostId) return;
    const raw = commentByPostId[selectedPostId] ?? "";
    const parsed = commentFormSchema.safeParse({ content: raw });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Comentario no válido";
      setCommentErrorsByPostId((prev) => ({ ...prev, [selectedPostId]: msg }));
      return;
    }

    setCommentErrorsByPostId((prev) => ({ ...prev, [selectedPostId]: null }));
    setCommentingPostId(selectedPostId);
    try {
      const newComment = await createComment(selectedPostId, { content: parsed.data.content });
      setCommentByPostId((prev) => ({ ...prev, [selectedPostId]: "" }));
      patchPostInLists(selectedPostId, (p) => ({
        ...p,
        comments: [...p.comments, newComment].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1)),
      }));
    } catch (e) {
      setCommentErrorsByPostId((prev) => ({
        ...prev,
        [selectedPostId]: getErrorMessage(e, "No se pudo publicar el comentario."),
      }));
    } finally {
      setCommentingPostId(null);
    }
  }, [selectedPostId, user?.id, commentingPostId, commentByPostId, patchPostInLists]);

  const handleDeletePost = useCallback(
    async (postId: string) => {
      if (!user?.id || deletingPostId) return;
      setDeletingPostId(postId);
      try {
        await deletePost(postId);
        if (pinnedPostId === postId) {
          await onSetPinned(null);
        }
        postsState.removePost(postId);
        postsState.refreshSavedLocal();
        setSelectedPostId((id) => (id === postId ? null : id));
        setCommentByPostId((prev) => {
          const next = { ...prev };
          delete next[postId];
          return next;
        });
      } catch (e) {
        setActionMessage(getErrorMessage(e, "No se pudo eliminar la publicación."));
      } finally {
        setDeletingPostId(null);
      }
    },
    [user?.id, deletingPostId, postsState, pinnedPostId, onSetPinned]
  );

  const handleEdit = useCallback(
    (postId: string) => {
      setSelectedPostId(null);
      router.push({ pathname: "/editar-publicacion", params: { id: postId } });
    },
    [router]
  );

  const handleToggleSave = useCallback(
    (postId: string) => {
      if (!userId) return;
      toggleSavedPostForUser(userId, postId);
      postsState.refreshSavedLocal();
    },
    [userId, toggleSavedPostForUser, postsState]
  );

  const handlePin = useCallback(
    async (postId: string | null) => {
      try {
        await onSetPinned(postId);
        setActionMessage(postId ? "Publicación destacada en tu perfil." : "Destacado quitado.");
      } catch (e) {
        setActionMessage(getErrorMessage(e, "No se pudo actualizar el destacado."));
      }
    },
    [onSetPinned]
  );

  const emptyMessage =
    postsState.sourceTab === "mine"
      ? "Aún no tienes publicaciones. Crea la primera desde el botón + del feed."
      : "No tienes publicaciones guardadas. En Inicio, toca el icono de guardar en una tarjeta.";

  const filteredEmpty =
    postsState.sourceTab === "mine" &&
    postsState.myPosts.length > 0 &&
    postsState.displayedPosts.length === 0
      ? "Ninguna publicación coincide con el filtro «Con foto»."
      : postsState.sourceTab === "saved" &&
          postsState.savedPosts.length > 0 &&
          postsState.displayedPosts.length === 0
        ? "Ningún guardado coincide con el filtro «Con foto»."
        : null;

  const showPinnedBanner =
    postsState.sourceTab === "mine" &&
    Boolean(pinnedPostId?.trim()) &&
    postsState.displayedPosts.some((p) => p.id === pinnedPostId?.trim());

  return (
    <View style={styles.wrap}>
      <ProfilePostsToolbar
        sourceTab={postsState.sourceTab}
        onSourceTabChange={postsState.setSourceTab}
        filter={postsState.filter}
        onFilterChange={postsState.setFilter}
      />

      {actionMessage ? (
        <Text style={styles.banner} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {actionMessage}
        </Text>
      ) : null}

      {postsState.sourceTab === "saved" && postsState.savedOrphansCount > 0 ? (
        <View style={styles.orphanBanner}>
          <Text style={styles.orphanText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Hay {postsState.savedOrphansCount} guardado{postsState.savedOrphansCount === 1 ? "" : "s"} que ya no
            aparecen en el feed.
          </Text>
          <Pressable onPress={() => void postsState.pruneSavedOrphans()} style={styles.orphanBtn}>
            <Text style={styles.orphanBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Limpiar lista
            </Text>
          </Pressable>
        </View>
      ) : null}

      {postsState.error ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.errorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {postsState.error}
          </Text>
          <Pressable onPress={() => void postsState.refreshAll()}>
            <Text style={styles.retry} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Reintentar
            </Text>
          </Pressable>
        </View>
      ) : postsState.loading ? (
        <ProfilePostsGridSkeleton />
      ) : postsState.displayedPosts.length === 0 ? (
        <View style={styles.emptyBlock}>
          <Text style={styles.emptyText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {filteredEmpty ?? emptyMessage}
          </Text>
        </View>
      ) : (
        <>
          {showPinnedBanner ? <ProfilePinnedPostBanner /> : null}
          <ProfilePostsGrid
            posts={postsState.displayedPosts}
            pinnedPostId={pinnedPostId}
            selectedId={selectedPostId}
            thumbRemountKey={gridThumbKey}
            openPostId={useDetailScreen ? null : selectedPostId}
            onSelect={openPost}
          />
          {postsState.hasMore ? (
            <Pressable
              onPress={postsState.loadMore}
              disabled={postsState.loadingMore}
              style={({ pressed }) => [styles.loadMore, pressed ? styles.loadMorePressed : null]}
            >
              {postsState.loadingMore ? (
                <ActivityIndicator color={AUTH.gold} size="small" />
              ) : (
                <Text style={styles.loadMoreText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Cargar más
                </Text>
              )}
            </Pressable>
          ) : null}
          <Text style={styles.hint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Toca una miniatura para ver la publicación completa.
          </Text>
        </>
      )}

      {!useDetailScreen ? (
        <ProfilePostDetailModal
          visible={selectedPostId != null}
          post={detailPost}
          currentUserId={user?.id}
          sessionAvatarUrl={user?.avatarUrl}
          commentValue={detailPost ? commentByPostId[detailPost.id] ?? "" : ""}
          onChangeComment={(value) => {
            if (!detailPost) return;
            setCommentByPostId((prev) => ({ ...prev, [detailPost.id]: value }));
          }}
          onSubmitComment={() => void handleCreateComment()}
          onToggleLike={() => void handleToggleLike()}
          onDelete={(id) => void handleDeletePost(id)}
          onEdit={handleEdit}
          deleting={deletingPostId === selectedPostId}
          commenting={commentingPostId === selectedPostId}
          commentError={selectedPostId ? commentErrorsByPostId[selectedPostId] : null}
          onClose={closePostDetail}
          onAfterClose={() => setModalPost(null)}
          saved={selectedPostId ? savedIdSet.has(selectedPostId) : false}
          onToggleSave={
            selectedPostId ? () => void handleToggleSave(selectedPostId) : undefined
          }
          pinnedPostId={pinnedPostId}
          onSetPinned={(id) => void handlePin(id)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
  },
  banner: {
    fontSize: 13,
    marginBottom: 8,
    marginHorizontal: 16,
    color: AUTH.success,
  },
  orphanBanner: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(251, 191, 36, 0.35)",
    backgroundColor: "rgba(40, 32, 16, 0.45)",
    gap: 8,
  },
  orphanText: {
    color: AUTH.steel,
    fontSize: 12,
    lineHeight: 18,
  },
  orphanBtn: {
    alignSelf: "flex-start",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  orphanBtnText: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyBlock: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: "center",
    gap: 10,
  },
  emptyText: {
    color: AUTH.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  errorText: {
    color: AUTH.danger,
    fontSize: 14,
    textAlign: "center",
  },
  retry: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "600",
  },
  loadMore: {
    marginTop: 14,
    marginHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.8)",
  },
  loadMorePressed: {
    opacity: 0.88,
  },
  loadMoreText: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  hint: {
    color: AUTH.faint,
    fontSize: 12,
    marginTop: 10,
    marginHorizontal: 16,
    textAlign: "center",
  },
});
