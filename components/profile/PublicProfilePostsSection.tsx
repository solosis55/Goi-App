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
  onLoadMore,
  workoutLabelByPostId,
}: PublicProfilePostsSectionProps) {
  const { user } = useAuth();
  const [filter, setFilter] = useState<ProfilePostsFilter>("all");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
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

  const handleSubmitComment = useCallback(async () => {
    if (!selectedPost) return;
    const raw = commentByPostId[selectedPost.id] ?? "";
    const parsed = commentFormSchema.safeParse({ content: raw });
    if (!parsed.success) {
      setCommentErrorsByPostId((prev) => ({
        ...prev,
        [selectedPost.id]: parsed.error.issues[0]?.message ?? "Comentario no válido",
      }));
      return;
    }
    setCommentingPostId(selectedPost.id);
    setCommentErrorsByPostId((prev) => ({ ...prev, [selectedPost.id]: null }));
    try {
      await createComment(selectedPost.id, { content: parsed.data.content });
      setCommentByPostId((prev) => ({ ...prev, [selectedPost.id]: "" }));
    } catch (e) {
      setCommentErrorsByPostId((prev) => ({
        ...prev,
        [selectedPost.id]: getErrorMessage(e, "No se pudo publicar el comentario"),
      }));
    } finally {
      setCommentingPostId(null);
    }
  }, [selectedPost, commentByPostId]);

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
        <ProfilePinnedPostPreview post={pinnedPost} onPress={() => setSelectedPostId(pinnedPost.id)} />
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
          workoutLabelByPostId={workoutLabelByPostId}
          onSelect={setSelectedPostId}
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

      <ProfilePostDetailModal
        visible={selectedPost != null}
        post={selectedPost}
        currentUserId={user?.id}
        sessionAvatarUrl={user?.avatarUrl}
        commentValue={selectedPost ? commentByPostId[selectedPost.id] ?? "" : ""}
        onChangeComment={(v) => {
          if (!selectedPost) return;
          setCommentByPostId((prev) => ({ ...prev, [selectedPost.id]: v }));
        }}
        onSubmitComment={() => void handleSubmitComment()}
        onToggleLike={() => {
          if (selectedPost) void handleToggleLike(selectedPost);
        }}
        commenting={selectedPost != null && commentingPostId === selectedPost.id}
        commentError={selectedPost ? commentErrorsByPostId[selectedPost.id] : null}
        onClose={() => setSelectedPostId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  count: {
    color: AUTH.muted,
    fontSize: 13,
  },
  filters: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.9)",
  },
  filterChipActive: {
    borderColor: "rgba(212, 175, 55, 0.55)",
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  filterText: {
    color: AUTH.muted,
    fontSize: 13,
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
