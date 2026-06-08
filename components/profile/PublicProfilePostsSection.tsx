import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { PROFILE_POSTS_FILTERS, type ProfilePostsFilter } from "../../constants/profilePosts";
import { useProfilePostDetailState } from "../../hooks/useProfilePostDetailState";
import type { Post } from "../../types/post";
import { applyProfilePostsFilter } from "../../utils/profilePostsDisplay";
import { ProfilePinnedPostPreview } from "./ProfilePinnedPostPreview";
import { ProfilePostsShell } from "./ProfilePostsShell";

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
  const [filter, setFilter] = useState<ProfilePostsFilter>("all");
  const [localPosts, setLocalPosts] = useState(posts);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const patchLocalPost = useCallback((postId: string, updater: (post: Post) => Post) => {
    setLocalPosts((prev) => prev.map((p) => (p.id === postId ? updater(p) : p)));
  }, []);

  const resolvePost = useCallback(
    (postId: string) => localPosts.find((p) => p.id === postId),
    [localPosts]
  );

  const detail = useProfilePostDetailState({
    resolvePost,
    patchPost: patchLocalPost,
    onPostSync: (sync) => {
      if (sync.deleted && sync.post) {
        setLocalPosts((prev) => prev.filter((p) => p.id !== sync.post!.id));
        return;
      }
      if (sync.post) {
        setLocalPosts((prev) => prev.map((p) => (p.id === sync.post!.id ? sync.post! : p)));
      }
    },
  });

  const displayedPosts = useMemo(
    () => applyProfilePostsFilter(localPosts, filter, pinnedPostId),
    [localPosts, filter, pinnedPostId]
  );

  const pinnedPost = useMemo(() => {
    const pin = pinnedPostId?.trim();
    if (!pin) return null;
    return localPosts.find((p) => p.id === pin) ?? null;
  }, [localPosts, pinnedPostId]);

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

  const header = (
    <>
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
    </>
  );

  const emptyContent = (
    <Text style={styles.empty} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
      Sin publicaciones que mostrar.
    </Text>
  );

  return (
    <ProfilePostsShell
      displayedPosts={displayedPosts}
      pinnedPostId={pinnedPostId}
      showSkeleton={loading && posts.length === 0}
      emptyContent={emptyContent}
      hasMore={hasMore && posts.length > 0 && !loading}
      loadingMore={loadingMore}
      onLoadMore={onLoadMore}
      workoutLabelByPostId={workoutLabelByPostId}
      detail={detail}
      header={header}
      beforeGrid={
        pinnedPost ? (
          <ProfilePinnedPostPreview post={pinnedPost} onPress={() => detail.openPost(pinnedPost.id)} />
        ) : null
      }
    />
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
  pressed: {
    opacity: 0.88,
  },
});
