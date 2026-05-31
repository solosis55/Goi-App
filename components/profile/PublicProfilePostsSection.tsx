import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { createComment, toggleLike } from "../../api/posts";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { commentFormSchema } from "../../constants/commentSchema";
import { PROFILE_POSTS_FILTERS, type ProfilePostsFilter } from "../../constants/profilePosts";
import { useAuth } from "../../context/AuthContext";
import type { Post } from "../../types/post";
import { applyProfilePostsFilter } from "../../utils/profilePostsDisplay";
import { getErrorMessage } from "../../utils/errorMessages";
import { useSyncProfilePostFromDetail } from "../../hooks/useSyncProfilePostFromDetail";
import {
  openProfilePostDetail,
  usesProfilePostDetailScreen,
} from "../../utils/openProfilePostDetail";
import { ProfilePinnedPostPreview } from "./ProfilePinnedPostPreview";
import { ProfilePostDetailModal } from "./ProfilePostDetailModal";
import { ProfilePostsGrid } from "./ProfilePostsGrid";
import { ProfilePostsGridSkeleton } from "./ProfilePostsGridSkeleton";

type PublicProfilePostsSectionProps = {
  posts: Post[];
  postsTotal: number;
  pinnedPostId?: string | null;
  loading: boolean;
  loadingMore: boolean;
  showRestricted: boolean;
  hasMore: boolean;
  postsHiddenByVisibility?: boolean;
  onLoadMore: () => void;
  workoutLabelByPostId?: Record<string, string>;
};

export function PublicProfilePostsSection({
  posts,
  postsTotal,
  pinnedPostId,
  loading,
  loadingMore,
  showRestricted,
  hasMore,
  postsHiddenByVisibility,
  onLoadMore,
  workoutLabelByPostId,
}: PublicProfilePostsSectionProps) {
  const router = useRouter();
  const { user } = useAuth();
  const useDetailScreen = usesProfilePostDetailScreen();
  const [filter, setFilter] = useState<ProfilePostsFilter>("all");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [modalPost, setModalPost] = useState<Post | null>(null);
  const [gridThumbKey, setGridThumbKey] = useState(0);
  const [commentByPostId, setCommentByPostId] = useState<Record<string, string>>({});
  const [commentErrorsByPostId, setCommentErrorsByPostId] = useState<Record<string, string | null>>({});
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [localPosts, setLocalPosts] = useState(posts);
  const likeInFlightRef = useRef(new Set<string>());

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const displayedPosts = useMemo(
    () => applyProfilePostsFilter(localPosts, filter, pinnedPostId),
    [localPosts, filter, pinnedPostId]
  );

  const selectedPost = useMemo(() => {
    if (!selectedPostId) return null;
    return localPosts.find((p) => p.id === selectedPostId) ?? null;
  }, [selectedPostId, localPosts]);

  useEffect(() => {
    if (selectedPost) setModalPost(selectedPost);
  }, [selectedPost]);

  const applyPostSync = useCallback((sync: { post: Post | null; deleted?: boolean }) => {
      if (sync.deleted && sync.post) {
        setLocalPosts((prev) => prev.filter((p) => p.id !== sync.post!.id));
        return;
      }
      if (sync.post) {
        setLocalPosts((prev) => prev.map((p) => (p.id === sync.post!.id ? sync.post! : p)));
      }
    },
    []
  );

  useSyncProfilePostFromDetail(applyPostSync);

  const openPost = useCallback(
    (id: string) => {
      const p = localPosts.find((x) => x.id === id);
      if (!p) return;
      openProfilePostDetail({
        router,
        post: p,
        onOpenModal: () => {
          setModalPost(p);
          setSelectedPostId(id);
        },
      });
    },
    [localPosts, router]
  );

  const closePostDetail = useCallback(() => {
    setGridThumbKey((k) => k + 1);
    setSelectedPostId(null);
  }, []);

  const pinnedPost = useMemo(() => {
    const pin = pinnedPostId?.trim();
    if (!pin) return null;
    return localPosts.find((p) => p.id === pin) ?? null;
  }, [localPosts, pinnedPostId]);

  const handleToggleLike = useCallback(async (post: Post) => {
    if (likeInFlightRef.current.has(post.id)) return;
    likeInFlightRef.current.add(post.id);
    const liked = !post.likedByMe;
    const delta = liked ? 1 : -1;
    setLocalPosts((prev) =>
      prev.map((p) =>
        p.id === post.id ? { ...p, likedByMe: liked, likesCount: Math.max(0, p.likesCount + delta) } : p
      )
    );
    try {
      await toggleLike(post.id);
    } catch {
      setLocalPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, likedByMe: post.likedByMe, likesCount: post.likesCount } : p
        )
      );
    } finally {
      likeInFlightRef.current.delete(post.id);
    }
  }, []);

  const detailPost = modalPost ?? selectedPost;

  const handleSubmitComment = useCallback(async () => {
    if (!detailPost || !user?.id) return;
    const raw = commentByPostId[detailPost.id] ?? "";
    const parsed = commentFormSchema.safeParse({ content: raw });
    if (!parsed.success) {
      setCommentErrorsByPostId((prev) => ({
        ...prev,
        [detailPost.id]: parsed.error.issues[0]?.message ?? "Comentario no válido",
      }));
      return;
    }
    setCommentErrorsByPostId((prev) => ({ ...prev, [detailPost.id]: null }));
    const tempId = `temp-comment-${Date.now()}`;
    const optimisticComment = {
      id: tempId,
      postId: detailPost.id,
      userId: user.id,
      authorUsername: user.username,
      authorAvatarUrl: user.avatarUrl ?? "",
      content: parsed.data.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setLocalPosts((prev) =>
      prev.map((p) =>
        p.id === detailPost.id
          ? {
              ...p,
              comments: [...p.comments, optimisticComment].sort((a, b) =>
                a.createdAt < b.createdAt ? -1 : 1
              ),
            }
          : p
      )
    );
    setCommentByPostId((prev) => ({ ...prev, [detailPost.id]: "" }));
    setCommentingPostId(detailPost.id);
    try {
      const newComment = await createComment(detailPost.id, { content: parsed.data.content });
      setLocalPosts((prev) =>
        prev.map((p) => {
          if (p.id !== detailPost.id) return p;
          const comments = p.comments
            .filter((c) => c.id !== tempId)
            .concat(newComment)
            .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
          return { ...p, comments };
        })
      );
    } catch (e) {
      setLocalPosts((prev) =>
        prev.map((p) =>
          p.id === detailPost.id
            ? { ...p, comments: p.comments.filter((c) => c.id !== tempId) }
            : p
        )
      );
      setCommentErrorsByPostId((prev) => ({
        ...prev,
        [detailPost.id]: getErrorMessage(e, "No se pudo publicar el comentario"),
      }));
    } finally {
      setCommentingPostId(null);
    }
  }, [detailPost, commentByPostId, user?.id, user?.username, user?.avatarUrl]);

  if (showRestricted) {
    return (
      <View style={styles.restricted}>
        <Text style={styles.restrictedTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Publicaciones privadas
        </Text>
        <Text style={styles.restrictedBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Sigue a esta cuenta para ver su cuadrícula.
        </Text>
      </View>
    );
  }

  return (
    <View>
      {postsHiddenByVisibility ? (
        <Text style={styles.visHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Parte de las publicaciones son solo para seguidores.
        </Text>
      ) : null}
      <View style={styles.toolbar}>
        <Text style={styles.count} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {postsTotal} publicaciones
        </Text>
        <View style={styles.filters}>
          {PROFILE_POSTS_FILTERS.map((f) => {
            const active = filter === f.id;
            return (
              <Pressable
                key={f.id}
                onPress={() => setFilter(f.id)}
                style={({ pressed }) => [
                  styles.filterChip,
                  active ? styles.filterChipActive : null,
                  pressed ? styles.pressed : null,
                ]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text
                  style={[styles.filterText, active ? styles.filterTextActive : null]}
                  maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {pinnedPost ? (
        <ProfilePinnedPostPreview post={pinnedPost} onPress={() => openPost(pinnedPost.id)} />
      ) : null}

      {loading && posts.length === 0 ? <ProfilePostsGridSkeleton /> : null}

      {!loading && displayedPosts.length === 0 ? (
        <Text style={styles.empty} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Sin publicaciones que mostrar.
        </Text>
      ) : (
        <ProfilePostsGrid
          posts={displayedPosts}
          pinnedPostId={pinnedPostId}
          selectedId={selectedPostId}
          thumbRemountKey={gridThumbKey}
          openPostId={useDetailScreen ? null : selectedPostId}
          workoutLabelByPostId={workoutLabelByPostId}
          onSelect={openPost}
        />
      )}

      {hasMore && posts.length > 0 && !loading ? (
        <View style={styles.moreWrap}>
          {loadingMore ? (
            <ActivityIndicator color={AUTH.gold} />
          ) : (
            <Pressable
              onPress={onLoadMore}
              style={({ pressed }) => [styles.moreBtn, pressed ? styles.pressed : null]}
              accessibilityRole="button"
              accessibilityLabel="Cargar más publicaciones"
            >
              <Text style={styles.moreText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Cargar más
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}

      {!useDetailScreen ? (
        <ProfilePostDetailModal
          visible={selectedPostId != null}
          post={detailPost}
          currentUserId={user?.id}
          sessionAvatarUrl={user?.avatarUrl}
          commentValue={detailPost ? commentByPostId[detailPost.id] ?? "" : ""}
          onChangeComment={(v) => {
            if (!detailPost) return;
            setCommentByPostId((prev) => ({ ...prev, [detailPost.id]: v }));
          }}
          onSubmitComment={() => void handleSubmitComment()}
          onToggleLike={() => {
            if (detailPost) void handleToggleLike(detailPost);
          }}
          commenting={detailPost != null && commentingPostId === detailPost.id}
          commentError={detailPost ? commentErrorsByPostId[detailPost.id] : null}
          onClose={closePostDetail}
          onAfterClose={() => setModalPost(null)}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  visHint: {
    marginHorizontal: 16,
    marginTop: 8,
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  count: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  filters: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.18)",
    backgroundColor: "rgba(23, 23, 23, 0.5)",
  },
  filterChipActive: {
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  filterText: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  filterTextActive: {
    color: AUTH.gold,
  },
  empty: {
    color: AUTH.muted,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  restricted: {
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  restrictedTitle: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "600",
  },
  restrictedBody: {
    color: AUTH.muted,
    fontSize: 14,
    textAlign: "center",
  },
  moreWrap: {
    paddingVertical: 16,
    alignItems: "center",
  },
  moreBtn: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  moreText: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
