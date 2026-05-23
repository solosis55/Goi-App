import { Box, Text } from "@gluestack-ui/themed";
import { useFocusEffect } from "@react-navigation/native";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  type FlatList as FlatListType,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import Animated, { runOnJS, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { getFollowing, getUsers } from "../../api/auth";
import { createComment, deletePost, getPosts, toggleLike } from "../../api/posts";
import { getStories } from "../../api/stories";
import { getWorkouts } from "../../api/workouts";
import { ApiError } from "../../api/client";
import { AppScreenShell } from "../../components/AppScreenShell";
import { FeedDaySeparator } from "../../components/feed/FeedDaySeparator";
import { FeedEmptyState } from "../../components/feed/FeedEmptyState";
import { FeedErrorBanner } from "../../components/feed/FeedErrorBanner";
import { FeedLoadMoreFooter } from "../../components/feed/FeedLoadMoreFooter";
import { FeedPostCardSkeleton } from "../../components/feed/FeedPostCardSkeleton";
import { FeedStickyScopeHeader } from "../../components/feed/FeedStickyScopeHeader";
import { FeedReportModal } from "../../components/feed/FeedReportModal";
import { FeedScrollToTopFab } from "../../components/feed/FeedScrollToTopFab";
import { FeedStoriesSection } from "../../components/feed/FeedStoriesSection";
import { FeedSuggestionsRow } from "../../components/feed/FeedSuggestionsRow";
import { FeedTopBar } from "../../components/feed/FeedTopBar";
import { PostCard } from "../../components/feed/PostCard";
import { StoryViewerModal } from "../../components/stories/StoryViewerModal";
import { AUTH } from "../../constants/authUi";
import { camaraHistoriaHref } from "../../constants/storyRoutes";
import { FEED_PAGE_SIZE, type FeedScope } from "../../constants/feed";
import { commentFormSchema } from "../../constants/commentSchema";
import { useGoiTheme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { goiToast } from "../../context/GoiToastContext";
import type { DiscoverUser } from "../../types/auth";
import { getErrorMessage } from "../../utils/errorMessages";
import {
  appendLocalReport,
  loadMutedUserIds,
  loadSavedPostIds,
  loadSuggestionsDismissed,
  muteUser,
  setSuggestionsDismissed as persistSuggestionsDismissed,
  toggleSavedPost,
} from "../../utils/feedLocalPrefs";
import { buildFeedListItems, feedListIndexForPostId, type FeedListItem } from "../../utils/feedListItems";
import { filterFeedPosts } from "../../utils/feedTimeline";
import { readStoredFeedScope, writeStoredFeedScope } from "../../utils/feedScopeStorage";
import { sharePost } from "../../utils/sharePost";
import type { Post } from "../../types/post";
import type { FeedStoryAuthor } from "../../types/story";

const FEED_MAX_WIDTH = 672;
const LIST_BOTTOM_PAD = 24;
const SCROLL_TOP_FAB_THRESHOLD = 380;

function FeedListSeparator() {
  return <View style={styles.listGap} />;
}

export default function HomeFeedScreen() {
  const router = useRouter();
  const { focusPostId: focusPostIdParam } = useLocalSearchParams<{ focusPostId?: string }>();
  const { palette, typography } = useGoiTheme();
  const { isHydrated, isAuthenticated, user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [storyAuthorsFromApi, setStoryAuthorsFromApi] = useState<FeedStoryAuthor[]>([]);
  const [storySeenRevision, setStorySeenRevision] = useState(0);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyViewerAuthorIdx, setStoryViewerAuthorIdx] = useState(0);
  const [storyViewerSlideIdx, setStoryViewerSlideIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<{ message: string; detail?: string } | null>(null);
  const [commentByPostId, setCommentByPostId] = useState<Record<string, string>>({});
  const [commentErrorsByPostId, setCommentErrorsByPostId] = useState<Record<string, string | null>>({});
  const [commentingPostId, setCommentingPostId] = useState<string | null>(null);
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [savedPostIdSet, setSavedPostIdSet] = useState<Set<string>>(() => new Set());
  const [mutedUserIdSet, setMutedUserIdSet] = useState<Set<string>>(() => new Set());
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [feedScope, setFeedScope] = useState<FeedScope>("all");
  const [feedScopeReady, setFeedScopeReady] = useState(false);
  const [visibleCount, setVisibleCount] = useState(FEED_PAGE_SIZE);
  const [workoutTitles, setWorkoutTitles] = useState<Record<string, string>>({});
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [reportTarget, setReportTarget] = useState<Post | null>(null);
  const [suggestionsDismissed, setSuggestionsDismissed] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const feedFocusCountRef = useRef(0);
  const listRef = useRef<FlatListType<FeedListItem>>(null);
  const scrollY = useSharedValue(0);
  const likeInFlightRef = useRef(new Set<string>());
  const focusHandledRef = useRef<string | null>(null);

  useEffect(() => {
    void readStoredFeedScope().then((scope) => {
      setFeedScope(scope);
      setFeedScopeReady(true);
    });
  }, []);

  const setFeedScopePersisted = useCallback((scope: FeedScope) => {
    setFeedScope(scope);
    void writeStoredFeedScope(scope);
    setVisibleCount(FEED_PAGE_SIZE);
  }, []);

  const scrollFeedToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const storyStripAuthors = useMemo((): FeedStoryAuthor[] => {
    if (!user) return [];
    const withoutSelf = storyAuthorsFromApi.filter((a) => a.userId !== user.id);
    const mine = storyAuthorsFromApi.find((a) => a.userId === user.id);
    const selfRow: FeedStoryAuthor =
      mine ?? {
        userId: user.id,
        authorUsername: user.username,
        authorAvatarUrl: user.avatarUrl ?? "",
        slides: [],
      };
    return [selfRow, ...withoutSelf];
  }, [storyAuthorsFromApi, user]);

  const storyViewerAuthors = useMemo(
    () => storyStripAuthors.filter((a) => a.slides.length > 0),
    [storyStripAuthors]
  );

  const filteredPosts = useMemo(
    () =>
      filterFeedPosts(posts, feedScope, {
        userId: user?.id,
        followingIds,
        mutedUserIds: mutedUserIdSet,
      }),
    [posts, feedScope, user?.id, followingIds, mutedUserIdSet]
  );

  const visiblePosts = useMemo(
    () => filteredPosts.slice(0, visibleCount),
    [filteredPosts, visibleCount]
  );

  const feedListItems = useMemo(() => buildFeedListItems(visiblePosts), [visiblePosts]);

  const hasMoreToShow = visibleCount < filteredPosts.length;

  const showFollowingHint =
    feedScope === "following" && filteredPosts.length === 0 && !loading && !error;

  const refreshStories = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getStories();
      setStoryAuthorsFromApi(data.authors ?? []);
    } catch {
      /* no bloquea el feed */
    }
  }, [user]);

  const refreshFollowing = useCallback(async () => {
    if (!user?.id) {
      setFollowingIds([]);
      return;
    }
    try {
      const res = await getFollowing(user.id);
      setFollowingIds(res.followingIds ?? []);
    } catch {
      setFollowingIds([]);
    }
  }, [user?.id]);

  const refreshDiscover = useCallback(async () => {
    setDiscoverLoading(true);
    try {
      const res = await getUsers();
      setDiscoverUsers(res.users ?? []);
    } catch {
      setDiscoverUsers([]);
    } finally {
      setDiscoverLoading(false);
    }
  }, []);

  const refreshWorkoutTitles = useCallback(async () => {
    if (!user?.id) return;
    try {
      const all = await getWorkouts();
      const map: Record<string, string> = {};
      for (const w of all) {
        if (w.userId === user.id) map[w.id] = w.title;
      }
      setWorkoutTitles(map);
    } catch {
      /* opcional */
    }
  }, [user?.id]);

  const handleStoryCellClick = useCallback(
    (clickedUserId: string) => {
      if (!user) return;
      const row = storyStripAuthors.find((a) => a.userId === clickedUserId);
      if (!row) return;
      if (clickedUserId === user.id && row.slides.length === 0) {
        router.push(camaraHistoriaHref());
        return;
      }
      const idx = storyViewerAuthors.findIndex((a) => a.userId === clickedUserId);
      if (idx === -1) return;
      setStoryViewerAuthorIdx(idx);
      setStoryViewerSlideIdx(0);
      setStoryViewerOpen(true);
    },
    [router, storyStripAuthors, storyViewerAuthors, user]
  );

  const refreshSavedIds = useCallback(async () => {
    if (!user?.id) {
      setSavedPostIdSet(new Set());
      return;
    }
    const ids = await loadSavedPostIds(user.id);
    setSavedPostIdSet(new Set(ids));
  }, [user?.id]);

  const refreshMutedIds = useCallback(async () => {
    if (!user?.id) {
      setMutedUserIdSet(new Set());
      return;
    }
    const ids = await loadMutedUserIds(user.id);
    setMutedUserIdSet(new Set(ids));
  }, [user?.id]);

  const handleOpenAuthor = useCallback(
    (authorUserId: string) => {
      if (!authorUserId || authorUserId === user?.id) return;
      router.push({ pathname: "/usuario/[id]", params: { id: authorUserId } });
    },
    [router, user?.id]
  );

  const handleMuteAuthor = useCallback(
    async (authorUserId: string) => {
      if (!user?.id || authorUserId === user.id) return;
      await muteUser(user.id, authorUserId);
      await refreshMutedIds();
      setPosts((prev) => prev.filter((p) => p.userId !== authorUserId));
      goiToast("Usuario silenciado");
    },
    [user?.id, refreshMutedIds]
  );

  const handleToggleSave = useCallback(
    async (postId: string) => {
      if (!user?.id) return;
      const nowSaved = await toggleSavedPost(user.id, postId);
      setSavedPostIdSet((prev) => {
        const next = new Set(prev);
        if (nowSaved) next.add(postId);
        else next.delete(postId);
        return next;
      });
      goiToast(nowSaved ? "Guardado en tu perfil" : "Quitado de guardados");
    },
    [user?.id]
  );

  const handleReportSubmit = useCallback(
    async (reason: string) => {
      if (!user?.id || !reportTarget) return;
      await appendLocalReport(user.id, {
        postId: reportTarget.id,
        authorId: reportTarget.userId,
        reason,
      });
      goiToast("Informe registrado en este dispositivo");
      setReportTarget(null);
    },
    [user?.id, reportTarget]
  );

  const fetchPosts = useCallback(async (mode: "initial" | "refresh") => {
    if (mode === "initial") setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      const data = await getPosts();
      setPosts(Array.isArray(data) ? data : []);
      setVisibleCount(FEED_PAGE_SIZE);
    } catch (e) {
      if (e instanceof ApiError) {
        setError({
          message: e.message,
          detail: `Código ${e.code} · HTTP ${e.status}`,
        });
      } else {
        setError({ message: "No se pudo cargar el feed." });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const loadMoreVisible = useCallback(() => {
    if (!hasMoreToShow || loadingMore) return;
    setLoadingMore(true);
    requestAnimationFrame(() => {
      setVisibleCount((n) => Math.min(n + FEED_PAGE_SIZE, filteredPosts.length));
      setLoadingMore(false);
    });
  }, [hasMoreToShow, filteredPosts.length, loadingMore]);

  const refreshSuggestionsDismissed = useCallback(async () => {
    if (!user?.id) {
      setSuggestionsDismissed(false);
      return;
    }
    const dismissed = await loadSuggestionsDismissed(user.id);
    setSuggestionsDismissed(dismissed);
  }, [user?.id]);

  const handleDismissSuggestions = useCallback(() => {
    if (!user?.id) return;
    setSuggestionsDismissed(true);
    void persistSuggestionsDismissed(user.id, true);
  }, [user?.id]);

  const scrollToSuggestions = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, []);

  const updateScrollFab = useCallback((y: number) => {
    setShowScrollFab(y > SCROLL_TOP_FAB_THRESHOLD);
  }, []);

  const onListScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
      runOnJS(updateScrollFab)(e.contentOffset.y);
    },
  });

  const handleToggleLike = useCallback(
    async (postId: string) => {
      if (!user?.id || likeInFlightRef.current.has(postId)) return;

      const snapshot = posts.find((p) => p.id === postId);
      if (!snapshot) return;

      const wasLiked = !!snapshot.likedByMe;
      const optimisticLiked = !wasLiked;

      setPosts((prev) =>
        prev.map((p) => {
          if (p.id !== postId) return p;
          let nextCount = p.likesCount;
          if (optimisticLiked && !wasLiked) nextCount += 1;
          else if (!optimisticLiked && wasLiked) nextCount = Math.max(0, nextCount - 1);
          return { ...p, likedByMe: optimisticLiked, likesCount: nextCount };
        })
      );

      likeInFlightRef.current.add(postId);
      try {
        const { liked } = await toggleLike(postId);
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            let nextCount = snapshot.likesCount;
            if (liked && !snapshot.likedByMe) nextCount += 1;
            else if (!liked && snapshot.likedByMe) nextCount = Math.max(0, snapshot.likesCount - 1);
            return { ...p, likedByMe: liked, likesCount: nextCount };
          })
        );
      } catch (e) {
        setPosts((prev) => prev.map((p) => (p.id === postId ? snapshot : p)));
        goiToast(getErrorMessage(e, "No se pudo actualizar el me gusta."));
      } finally {
        likeInFlightRef.current.delete(postId);
      }
    },
    [posts, user?.id]
  );

  const handleCreateComment = useCallback(
    async (postId: string) => {
      if (!user?.id || commentingPostId) return;
      const raw = commentByPostId[postId] ?? "";
      const parsed = commentFormSchema.safeParse({ content: raw });
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? "Comentario no válido";
        setCommentErrorsByPostId((prev) => ({ ...prev, [postId]: msg }));
        return;
      }

      setCommentErrorsByPostId((prev) => ({ ...prev, [postId]: null }));
      setCommentingPostId(postId);
      try {
        const newComment = await createComment(postId, { content: parsed.data.content });
        setCommentByPostId((prev) => ({ ...prev, [postId]: "" }));
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== postId) return p;
            const comments = [...p.comments, newComment].sort((a, b) =>
              a.createdAt < b.createdAt ? -1 : 1
            );
            return { ...p, comments };
          })
        );
        goiToast("Comentario publicado");
      } catch (e) {
        setCommentErrorsByPostId((prev) => ({
          ...prev,
          [postId]: getErrorMessage(e, "No se pudo publicar el comentario."),
        }));
      } finally {
        setCommentingPostId(null);
      }
    },
    [commentByPostId, commentingPostId, user?.id]
  );

  const handleDeletePost = useCallback(
    async (postId: string) => {
      if (!user?.id || deletingPostId) return;
      setDeletingPostId(postId);
      try {
        await deletePost(postId);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        setCommentByPostId((prev) => {
          const next = { ...prev };
          delete next[postId];
          return next;
        });
        setCommentErrorsByPostId((prev) => {
          const next = { ...prev };
          delete next[postId];
          return next;
        });
        goiToast("Publicación eliminada");
      } catch (e) {
        goiToast(getErrorMessage(e, "No se pudo eliminar la publicación."));
      } finally {
        setDeletingPostId(null);
      }
    },
    [deletingPostId, user?.id]
  );

  const focusPostId = typeof focusPostIdParam === "string" ? focusPostIdParam : undefined;

  useEffect(() => {
    if (!focusPostId || loading || focusHandledRef.current === focusPostId) return;
    const idx = feedListIndexForPostId(feedListItems, focusPostId);
    if (idx < 0) {
      if (hasMoreToShow) {
        setVisibleCount(filteredPosts.length);
      }
      return;
    }
    focusHandledRef.current = focusPostId;
    setHighlightedPostId(focusPostId);
    requestAnimationFrame(() => {
      listRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.3 });
    });
    const t = setTimeout(() => setHighlightedPostId(null), 3500);
    return () => clearTimeout(t);
  }, [focusPostId, loading, feedListItems, hasMoreToShow, filteredPosts.length]);

  useFocusEffect(
    useCallback(() => {
      if (!isHydrated || !isAuthenticated) return;
      feedFocusCountRef.current += 1;
      const mode = feedFocusCountRef.current === 1 ? "initial" : "refresh";
      void fetchPosts(mode);
      void refreshStories();
      void refreshSavedIds();
      void refreshMutedIds();
      void refreshFollowing();
      void refreshDiscover();
      void refreshWorkoutTitles();
      void refreshSuggestionsDismissed();
    }, [
      isHydrated,
      isAuthenticated,
      fetchPosts,
      refreshStories,
      refreshSavedIds,
      refreshMutedIds,
      refreshFollowing,
      refreshDiscover,
      refreshWorkoutTitles,
      refreshSuggestionsDismissed,
    ])
  );

  const renderFeedItem = useCallback(
    ({ item }: { item: FeedListItem }) => {
      if (item.kind === "day") {
        return <FeedDaySeparator label={item.label} />;
      }
      const post = item.post;
      return (
        <PostCard
          post={post}
          palette={palette}
          typography={typography}
          currentUserId={user?.id}
          sessionAvatarUrl={user?.avatarUrl}
          highlighted={highlightedPostId === post.id}
          workoutTitle={post.workoutId ? workoutTitles[post.workoutId] ?? "Rutina vinculada" : null}
          commentValue={commentByPostId[post.id] ?? ""}
          onChangeComment={(value) => {
            setCommentByPostId((prev) => ({ ...prev, [post.id]: value }));
            if (commentErrorsByPostId[post.id]) {
              setCommentErrorsByPostId((prev) => ({ ...prev, [post.id]: null }));
            }
          }}
          onSubmitComment={() => void handleCreateComment(post.id)}
          onToggleLike={() => void handleToggleLike(post.id)}
          onDelete={(postId) => void handleDeletePost(postId)}
          onEdit={(postId) => router.push({ pathname: "/editar-publicacion", params: { id: postId } })}
          deleting={deletingPostId === post.id}
          commenting={commentingPostId === post.id}
          commentError={commentErrorsByPostId[post.id]}
          saved={savedPostIdSet.has(post.id)}
          onToggleSave={() => void handleToggleSave(post.id)}
          onMuteAuthor={(authorId) => void handleMuteAuthor(authorId)}
          onOpenAuthor={handleOpenAuthor}
          onSharePost={() => void sharePost(post.id, post.authorUsername, post.content)}
          onReportPost={() => setReportTarget(post)}
        />
      );
    },
    [
      feedScope,
      setFeedScopePersisted,
      showFollowingHint,
      palette,
      typography,
      user?.id,
      user?.avatarUrl,
      highlightedPostId,
      workoutTitles,
      commentByPostId,
      commentErrorsByPostId,
      commentingPostId,
      deletingPostId,
      savedPostIdSet,
      router,
      handleCreateComment,
      handleToggleLike,
      handleDeletePost,
      handleToggleSave,
      handleMuteAuthor,
      handleOpenAuthor,
    ]
  );

  if (!isHydrated) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" style={{ backgroundColor: palette.background }}>
        <ActivityIndicator color={palette.primary} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  const listHeader = (
    <View style={styles.headerBlock}>
      {user ? (
        <FeedStoriesSection
          authors={storyStripAuthors}
          currentUserId={user.id}
          seenRevision={storySeenRevision}
          onSelectAuthor={handleStoryCellClick}
        />
      ) : null}

      <FeedSuggestionsRow
        users={discoverUsers}
        followingIds={followingIds}
        currentUserId={user?.id}
        loading={discoverLoading}
        dismissed={suggestionsDismissed}
        onDismiss={handleDismissSuggestions}
        onFollowingChanged={(targetId, following) => {
          setFollowingIds((prev) =>
            following ? (prev.includes(targetId) ? prev : [...prev, targetId]) : prev.filter((id) => id !== targetId)
          );
        }}
      />

      {feedScopeReady ? (
        <FeedStickyScopeHeader
          mode={feedScope}
          onChangeMode={setFeedScopePersisted}
          showFollowingHint={showFollowingHint}
        />
      ) : null}

      <FeedErrorBanner
        errorMessage={error?.message}
        errorDetail={error?.detail}
        onRetry={error ? () => void fetchPosts("initial") : undefined}
      />

      {loading && posts.length === 0 ? <FeedPostCardSkeleton count={3} /> : null}
    </View>
  );

  const listFooter = (
    <View>
      {!loading && !error && filteredPosts.length === 0 ? (
        <FeedEmptyState scope={feedScope} onScrollToSuggestions={scrollToSuggestions} />
      ) : null}
      <FeedLoadMoreFooter
        hasMore={hasMoreToShow && visiblePosts.length > 0}
        loadingMore={loadingMore}
        onLoadMore={loadMoreVisible}
      />
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppScreenShell>
        <View style={styles.screen}>
          <FeedTopBar user={user} onBrandPress={scrollFeedToTop} scrollY={scrollY} />
          <Animated.FlatList
            ref={listRef}
            style={styles.list}
            data={feedListItems}
            keyExtractor={(item) => item.key}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
            windowSize={7}
            maxToRenderPerBatch={6}
            initialNumToRender={5}
            onScroll={onListScroll}
            scrollEventThrottle={16}
            onEndReached={loadMoreVisible}
            onEndReachedThreshold={0.4}
            onScrollToIndexFailed={(info) => {
              listRef.current?.scrollToOffset({
                offset: info.averageItemLength * info.index,
                animated: true,
              });
            }}
            extraData={{
              commentByPostId,
              commentErrorsByPostId,
              commentingPostId,
              deletingPostId,
              savedPostIdSet,
              highlightedPostId,
              feedScope,
              showFollowingHint,
            }}
            ItemSeparatorComponent={FeedListSeparator}
            renderItem={renderFeedItem}
            ListHeaderComponent={listHeader}
            ListFooterComponent={listFooter}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  void fetchPosts("refresh");
                  void refreshStories();
                  void refreshFollowing();
                }}
                tintColor={AUTH.gold}
                colors={[AUTH.gold]}
                progressBackgroundColor="#141416"
              />
            }
          />
          <FeedScrollToTopFab visible={showScrollFab} onPress={scrollFeedToTop} />
        </View>
      </AppScreenShell>

      <StoryViewerModal
        visible={storyViewerOpen}
        authors={storyViewerAuthors}
        startAuthorIdx={storyViewerAuthorIdx}
        startSlideIdx={storyViewerSlideIdx}
        onClose={() => setStoryViewerOpen(false)}
        onStoriesUiRefresh={() => setStorySeenRevision((n) => n + 1)}
      />

      <FeedReportModal
        visible={reportTarget != null}
        authorUsername={reportTarget?.authorUsername ?? ""}
        onClose={() => setReportTarget(null)}
        onSubmit={(reason) => void handleReportSubmit(reason)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "rgba(6, 6, 8, 1)",
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: LIST_BOTTOM_PAD,
    width: "100%",
    maxWidth: FEED_MAX_WIDTH,
    alignSelf: "center",
  },
  listGap: {
    height: 16,
  },
  headerBlock: {
    width: "100%",
  },
});
