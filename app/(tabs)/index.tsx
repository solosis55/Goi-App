import { Box, Text } from "@gluestack-ui/themed";
import { useFocusEffect } from "@react-navigation/native";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
  type ViewToken,
} from "react-native";
import { runOnJS, useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDiscover } from "../../api/auth";
import { createComment, deletePost, toggleLike } from "../../api/posts";
import { getStories } from "../../api/stories";
import { getWorkouts } from "../../api/workouts";
import { AppScreenShell } from "../../components/AppScreenShell";
import { FeedAnimatedFlashList, type FeedAnimatedFlashListRef } from "../../components/feed/FeedAnimatedFlashList";
import { FeedDaySeparator } from "../../components/feed/FeedDaySeparator";
import { FeedEmptyState } from "../../components/feed/FeedEmptyState";
import { FeedErrorBanner } from "../../components/feed/FeedErrorBanner";
import { FeedLoadMoreFooter } from "../../components/feed/FeedLoadMoreFooter";
import { FeedPostCardSkeleton } from "../../components/feed/FeedPostCardSkeleton";
import { FeedStickyScopeHeader } from "../../components/feed/FeedStickyScopeHeader";
import { FeedReportModal } from "../../components/feed/FeedReportModal";
import { FeedScrollToTopFab } from "../../components/feed/FeedScrollToTopFab";
import { FeedDiscoveryZone } from "../../components/feed/FeedDiscoveryZone";
import { FeedWorkoutEventRow } from "../../components/feed/FeedWorkoutEventRow";
import { FeedInlineSuggestionsRow, FeedSuggestionsRow } from "../../components/feed/FeedSuggestionsRow";
import { FeedNewPostsBanner } from "../../components/feed/FeedNewPostsBanner";
import { FeedTopBar } from "../../components/feed/FeedTopBar";
import { FeedPostCardRow } from "../../components/feed/FeedPostCardRow";
import { StoryViewerModal } from "../../components/stories/StoryViewerModal";
import { AUTH } from "../../constants/authUi";
import { camaraHistoriaHref } from "../../constants/storyRoutes";
import { commentFormSchema } from "../../constants/commentSchema";
import { useGoiTheme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useSocialHub } from "../../context/SocialHubContext";
import { useFeed } from "../../hooks/useFeed";
import { useFeedGoldBeamPref } from "../../hooks/useFeedGoldBeamPref";
import { useFeedPrefsStore } from "../../stores/useFeedPrefsStore";
import { useFeedInteractionStore } from "../../stores/useFeedInteractionStore";
import { useSocialHubStore } from "../../stores/useSocialHubStore";
import {
  FeedGoldBeamProvider,
} from "../../context/FeedGoldBeamContext";
import {
  FeedPostActionsProvider,
  type FeedPostActionsHandlers,
  type FeedPostActionsSnapshot,
} from "../../context/FeedPostActionsContext";
import { goiToast } from "../../context/GoiToastContext";
import type { DiscoverUser } from "../../types/auth";
import { getErrorMessage } from "../../utils/errorMessages";
import { appendLocalReport } from "../../utils/feedLocalPrefs";
import { feedListIndexForPostId, type FeedListItem } from "../../utils/feedListItems";
import {
  feedSuggestionsPlacement,
  shouldOfferFeedSuggestions,
} from "../../utils/feedSuggestionsVisibility";
import { postEligibleForGoldBeam } from "../../utils/feedTimeline";
import { buildStoryStripAuthors, storyViewerAuthors } from "../../utils/storyStripAuthors";
import type { Post } from "../../types/post";
import type { FeedStoryAuthor } from "../../types/story";

const FEED_MAX_WIDTH = 672;
const LIST_BOTTOM_PAD = 24;
const SCROLL_TOP_FAB_THRESHOLD = 380;
const SCROLL_FAB_JS_THROTTLE_MS = 100;
const FEED_AUX_REFRESH_STALE_MS = 45_000;

function FeedListSeparator() {
  return <View style={styles.listGap} />;
}

export default function HomeFeedScreen() {
  const router = useRouter();
  const {
    focusPostId: focusPostIdParam,
    focusCommentId: focusCommentIdParam,
    feedRefresh: feedRefreshParam,
  } = useLocalSearchParams<{
    focusPostId?: string;
    focusCommentId?: string;
    feedRefresh?: string;
  }>();
  const { palette, typography } = useGoiTheme();
  const { isHydrated, isAuthenticated, user } = useAuth();
  const [storyAuthorsFromApi, setStoryAuthorsFromApi] = useState<FeedStoryAuthor[]>([]);
  const [storySeenRevision, setStorySeenRevision] = useState(0);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyViewerAuthorIdx, setStoryViewerAuthorIdx] = useState(0);
  const [storyViewerSlideIdx, setStoryViewerSlideIdx] = useState(0);
  const setCommentFieldError = useFeedInteractionStore((s) => s.setCommentFieldError);
  const setCommentingPostId = useFeedInteractionStore((s) => s.setCommentingPostId);
  const setDeletingPostId = useFeedInteractionStore((s) => s.setDeletingPostId);
  const clearCommentError = useFeedInteractionStore((s) => s.clearCommentError);
  const suggestionsDismiss = useFeedPrefsStore((s) => s.suggestionsDismiss);
  const hydrateFeedLocalPrefs = useFeedPrefsStore((s) => s.hydrateFeedLocalPrefs);
  const muteAuthorInStore = useFeedPrefsStore((s) => s.muteAuthor);
  const toggleSavedPostForUser = useFeedPrefsStore((s) => s.toggleSavedPostForUser);
  const snoozeSuggestions = useFeedPrefsStore((s) => s.snoozeSuggestions);
  const dismissSuggestionsPermanent = useFeedPrefsStore((s) => s.dismissSuggestionsPermanent);
  const followingIds = useSocialHubStore((s) => s.followingIds);
  const applyFollowingChange = useSocialHubStore((s) => s.applyFollowingChange);
  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const discoverUsersRef = useRef<DiscoverUser[]>([]);
  discoverUsersRef.current = discoverUsers;
  const [workoutTitles, setWorkoutTitles] = useState<Record<string, string>>({});
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);
  const [showScrollFab, setShowScrollFab] = useState(false);
  const [reportTarget, setReportTarget] = useState<Post | null>(null);
  const { unreadNotifications, refreshBadge } = useSocialHub();
  const feed = useFeed(user?.id);
  const {
    posts,
    postCount,
    feedScope,
    feedScopeReady,
    initScope,
    setFeedScopePersisted,
    loading,
    refreshing,
    loadingMore,
    error,
    fetchFeed,
    loadMore,
    hasMore,
    pendingNewCount,
    setPendingNewCount,
    markScrolledDown,
    markAtTop,
    buildListItems,
    patchTimeline,
    patchPost,
  } = feed;
  const { enabled: goldBeamEnabled } = useFeedGoldBeamPref();
  const feedFocusCountRef = useRef(0);
  const feedRefreshHandledRef = useRef(false);
  const feedAuxRefreshAtRef = useRef(0);
  const scrollFabStateRef = useRef({ atTop: true, showFab: false, lastJsAt: 0 });
  const listRef = useRef<FeedAnimatedFlashListRef>(null);
  const scrollY = useSharedValue(0);
  const [activeBeamPostId, setActiveBeamPostId] = useState<string | null>(null);
  const beamViewabilityConfig = useRef({ itemVisiblePercentThreshold: 45, minimumViewTime: 280 }).current;
  const onBeamViewableChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const posts = viewableItems.filter(
      (t) => t.isViewable && t.item != null && (t.item as FeedListItem).kind === "post"
    );
    if (posts.length === 0) return;

    const visiblePostIds = posts
      .map((t) => (t.item as FeedListItem))
      .filter(
        (row): row is Extract<FeedListItem, { kind: "post" }> =>
          row.kind === "post" && postEligibleForGoldBeam(row.post)
      )
      .map((row) => row.post.id);

    if (visiblePostIds.length === 0) return;

    setActiveBeamPostId((current) => {
      if (current && visiblePostIds.includes(current)) {
        return current;
      }
      const sorted = [...posts].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
      const eligible = sorted.filter((t) => {
        const row = t.item as FeedListItem;
        return row.kind === "post" && postEligibleForGoldBeam(row.post);
      });
      const center = eligible[Math.floor(eligible.length / 2)] ?? sorted[0];
      const row = center.item as FeedListItem;
      return row.kind === "post" && postEligibleForGoldBeam(row.post) ? row.post.id : current;
    });
  }).current;
  const beamViewabilityPairs = useMemo(
    () =>
      goldBeamEnabled
        ? [{ viewabilityConfig: beamViewabilityConfig, onViewableItemsChanged: onBeamViewableChanged }]
        : [],
    [goldBeamEnabled, beamViewabilityConfig, onBeamViewableChanged]
  );
  const likeInFlightRef = useRef(new Set<string>());
  const focusHandledRef = useRef<string | null>(null);
  const insets = useSafeAreaInsets();

  const scrollFeedToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    feed.scrollToTop();
  }, [feed]);

  const storyStripAuthors = useMemo((): FeedStoryAuthor[] => {
    if (!user) return [];
    return buildStoryStripAuthors(storyAuthorsFromApi, {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatarUrl,
    });
  }, [storyAuthorsFromApi, user]);

  const storyViewerAuthorsList = useMemo(
    () => storyViewerAuthors(storyStripAuthors),
    [storyStripAuthors]
  );

  const beamEligibilitySignature = posts
    .map((p) => `${p.id}:${p.workoutId ?? ""}:${p.media?.length ?? 0}`)
    .join("|");
  const beamEligibleIdsKey = useMemo(
    () => posts.filter(postEligibleForGoldBeam).map((p) => p.id).join(","),
    [beamEligibilitySignature]
  );
  const postsRef = useRef(posts);
  postsRef.current = posts;

  const availableSuggestions = useMemo(
    () => discoverUsers.filter((u) => u.id !== user?.id && !followingIds.includes(u.id)),
    [discoverUsers, user?.id, followingIds]
  );

  const shouldOfferSuggestions = useMemo(
    () =>
      shouldOfferFeedSuggestions({
        dismiss: suggestionsDismiss,
        availableCount: availableSuggestions.length,
        followingCount: followingIds.length,
        accountCreatedAt: user?.createdAt,
        feedScope,
        filteredPostsCount: postCount,
      }),
    [
      suggestionsDismiss,
      availableSuggestions.length,
      followingIds.length,
      user?.createdAt,
      feedScope,
      postCount,
    ]
  );

  const suggestionsPlacement = useMemo(
    () =>
      feedSuggestionsPlacement({
        shouldOffer: shouldOfferSuggestions,
        filteredPostsCount: postCount,
      }),
    [shouldOfferSuggestions, postCount]
  );

  const insertSuggestionsInline = suggestionsPlacement === "inline";
  const showSuggestionsInEmpty = suggestionsPlacement === "empty";

  const feedListItems = useMemo(
    () =>
      buildListItems({
        insertSuggestions: insertSuggestionsInline && availableSuggestions.length > 0,
      }),
    [buildListItems, insertSuggestionsInline, availableSuggestions.length]
  );

  useEffect(() => {
    if (!goldBeamEnabled || !beamEligibleIdsKey) {
      setActiveBeamPostId(null);
      return;
    }
    const eligible = postsRef.current.filter(postEligibleForGoldBeam);
    setActiveBeamPostId((current) => {
      if (current && eligible.some((p) => p.id === current)) return current;
      return eligible[0]?.id ?? null;
    });
  }, [goldBeamEnabled, beamEligibleIdsKey]);

  useFocusEffect(
    useCallback(() => {
      if (!goldBeamEnabled || !beamEligibleIdsKey) return;
      const eligible = postsRef.current.filter(postEligibleForGoldBeam);
      setActiveBeamPostId((current) => {
        if (current && eligible.some((p) => p.id === current)) return current;
        return eligible[0]?.id ?? null;
      });
    }, [goldBeamEnabled, beamEligibleIdsKey])
  );

  const showFollowingHint =
    feedScope === "following" && postCount === 0 && !loading && !error;

  const refreshStories = useCallback(async () => {
    if (!user) return;
    try {
      const data = await getStories();
      setStoryAuthorsFromApi(data.authors ?? []);
    } catch {
      /* no bloquea el feed */
    }
  }, [user]);

  const refreshFollowing = useCallback(async (): Promise<string[]> => {
    if (!user?.id) return [];
    await useSocialHubStore.getState().refreshHub({ silent: true });
    return useSocialHubStore.getState().followingIds;
  }, [user?.id]);

  const refreshDiscover = useCallback(async () => {
    if (!user?.id) {
      setDiscoverUsers([]);
      return;
    }
    const showLoading = discoverUsersRef.current.length === 0;
    if (showLoading) setDiscoverLoading(true);
    try {
      const res = await getDiscover(24);
      setDiscoverUsers(res.users ?? []);
    } catch {
      if (discoverUsersRef.current.length === 0) setDiscoverUsers([]);
    } finally {
      if (showLoading) setDiscoverLoading(false);
    }
  }, [user?.id]);

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
      const idx = storyViewerAuthorsList.findIndex((a) => a.userId === clickedUserId);
      if (idx === -1) return;
      setStoryViewerAuthorIdx(idx);
      setStoryViewerSlideIdx(0);
      setStoryViewerOpen(true);
    },
    [router, storyStripAuthors, storyViewerAuthorsList, user]
  );

  const refreshFeedLocalPrefs = useCallback(async () => {
    await hydrateFeedLocalPrefs(user?.id);
  }, [user?.id, hydrateFeedLocalPrefs]);

  const refreshFeedLocalPrefsForce = useCallback(async () => {
    await hydrateFeedLocalPrefs(user?.id, { force: true });
  }, [user?.id, hydrateFeedLocalPrefs]);

  const handleOpenAuthor = useCallback(
    (authorUserId: string) => {
      if (!authorUserId || authorUserId === user?.id) return;
      router.push({ pathname: "/usuario/[id]", params: { id: authorUserId } });
    },
    [router, user?.id]
  );

  const handleMuteAuthor = useCallback(
    (authorUserId: string) => {
      if (!user?.id || authorUserId === user.id) return;
      void muteAuthorInStore(user.id, authorUserId);
      goiToast("Usuario silenciado");
    },
    [user?.id, muteAuthorInStore]
  );

  const handleToggleSave = useCallback(
    (postId: string) => {
      if (!user?.id) return;
      const nowSaved = toggleSavedPostForUser(user.id, postId);
      goiToast(nowSaved ? "Guardado en tu perfil" : "Quitado de guardados");
    },
    [user?.id, toggleSavedPostForUser]
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

  const handleSnoozeSuggestions = useCallback(() => {
    if (!user?.id) return;
    void snoozeSuggestions(user.id);
  }, [user?.id, snoozeSuggestions]);

  const handleDismissSuggestionsPermanent = useCallback(() => {
    if (!user?.id) return;
    void dismissSuggestionsPermanent(user.id);
  }, [user?.id, dismissSuggestionsPermanent]);

  const suggestionsRowProps = useMemo(
    () => ({
      users: discoverUsers,
      followingIds,
      currentUserId: user?.id,
      feedScope,
      loading: discoverLoading,
      onSnooze: handleSnoozeSuggestions,
      onDismissPermanent: handleDismissSuggestionsPermanent,
      onFollowingChanged: (targetId: string, following: boolean) => {
        applyFollowingChange(targetId, following);
      },
      showManageInSocial: true,
    }),
    [
      discoverUsers,
      followingIds,
      user?.id,
      feedScope,
      discoverLoading,
      handleSnoozeSuggestions,
      handleDismissSuggestionsPermanent,
      applyFollowingChange,
    ]
  );

  const updateScrollFab = useCallback(
    (y: number) => {
      const now = Date.now();
      if (now - scrollFabStateRef.current.lastJsAt < SCROLL_FAB_JS_THROTTLE_MS) return;
      scrollFabStateRef.current.lastJsAt = now;

      const atTop = y < 48;
      const showFab = y > SCROLL_TOP_FAB_THRESHOLD;
      if (atTop !== scrollFabStateRef.current.atTop) {
        scrollFabStateRef.current.atTop = atTop;
        if (atTop) markAtTop();
        else markScrolledDown();
      }
      if (showFab !== scrollFabStateRef.current.showFab) {
        scrollFabStateRef.current.showFab = showFab;
        setShowScrollFab(showFab);
      }
    },
    [markAtTop, markScrolledDown]
  );

  const handlePressSession = useCallback(
    (sessionId: string, fromPostId?: string | null) => {
      router.push({
        pathname: "/sesion/[id]",
        params: {
          id: sessionId,
          ...(fromPostId ? { postId: fromPostId } : {}),
        },
      });
    },
    [router]
  );

  const handlePressWorkout = useCallback(
    (post: Post) => {
      if (!post.workoutId) return;
      if (post.userId === user?.id) {
        router.push({ pathname: "/rutina/[id]", params: { id: post.workoutId } });
        return;
      }
      handleOpenAuthor(post.userId);
    },
    [router, user?.id, handleOpenAuthor]
  );

  const onListScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      const y = e.contentOffset.y;
      scrollY.value = y;
      runOnJS(updateScrollFab)(y);
    },
  });

  const handleToggleLike = useCallback(
    async (postId: string) => {
      if (!user?.id || likeInFlightRef.current.has(postId)) return;

      const snapshot = postsRef.current.find((p) => p.id === postId);
      if (!snapshot) return;

      const wasLiked = !!snapshot.likedByMe;
      const optimisticLiked = !wasLiked;

      patchPost(postId, (p) => {
        let nextCount = p.likesCount;
        if (optimisticLiked && !wasLiked) nextCount += 1;
        else if (!optimisticLiked && wasLiked) nextCount = Math.max(0, nextCount - 1);
        return { ...p, likedByMe: optimisticLiked, likesCount: nextCount };
      });

      likeInFlightRef.current.add(postId);
      try {
        const { liked } = await toggleLike(postId);
        patchPost(postId, (p) => {
          let nextCount = snapshot.likesCount;
          if (liked && !snapshot.likedByMe) nextCount += 1;
          else if (!liked && snapshot.likedByMe) nextCount = Math.max(0, snapshot.likesCount - 1);
          return { ...p, likedByMe: liked, likesCount: nextCount };
        });
      } catch (e) {
        patchPost(postId, () => snapshot);
        goiToast(getErrorMessage(e, "No se pudo actualizar el me gusta."));
      } finally {
        likeInFlightRef.current.delete(postId);
      }
    },
    [user?.id, patchPost]
  );

  const handleCreateComment = useCallback(
    async (postId: string, raw: string) => {
      if (!user?.id || useFeedInteractionStore.getState().commentingPostId) return;
      const parsed = commentFormSchema.safeParse({ content: raw });
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? "Comentario no válido";
        setCommentFieldError({ postId, message: msg });
        return;
      }

      setCommentFieldError(null);
      const tempId = `temp-comment-${Date.now()}`;
      const optimisticComment = {
        id: tempId,
        postId,
        userId: user.id,
        authorUsername: user.username,
        authorAvatarUrl: user.avatarUrl ?? "",
        content: parsed.data.content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      patchPost(postId, (p) => {
        const comments = [...p.comments, optimisticComment].sort((a, b) =>
          a.createdAt < b.createdAt ? -1 : 1
        );
        return { ...p, comments };
      });

      setCommentingPostId(postId);
      try {
        const newComment = await createComment(postId, { content: parsed.data.content });
        patchPost(postId, (p) => {
          const comments = p.comments
            .filter((c) => c.id !== tempId)
            .concat(newComment)
            .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1));
          return { ...p, comments };
        });
        goiToast("Comentario publicado");
      } catch (e) {
        patchPost(postId, (p) => ({
          ...p,
          comments: p.comments.filter((c) => c.id !== tempId),
        }));
        setCommentFieldError({
          postId,
          message: getErrorMessage(e, "No se pudo publicar el comentario."),
        });
      } finally {
        setCommentingPostId(null);
      }
    },
    [user?.id, user?.username, user?.avatarUrl, patchPost, setCommentFieldError, setCommentingPostId]
  );

  const handleDeletePost = useCallback(
    async (postId: string) => {
      if (!user?.id || useFeedInteractionStore.getState().deletingPostId) return;
      setDeletingPostId(postId);
      try {
        await deletePost(postId);
        patchTimeline((prev) => prev.filter((e) => e.kind !== "post" || e.post.id !== postId));
        const err = useFeedInteractionStore.getState().commentFieldError;
        if (err?.postId === postId) setCommentFieldError(null);
        goiToast("Publicación eliminada");
      } catch (e) {
        goiToast(getErrorMessage(e, "No se pudo eliminar la publicación."));
      } finally {
        setDeletingPostId(null);
      }
    },
    [user?.id, patchTimeline, setDeletingPostId, setCommentFieldError]
  );

  const focusPostId = typeof focusPostIdParam === "string" ? focusPostIdParam : undefined;
  const focusCommentId =
    typeof focusCommentIdParam === "string" ? focusCommentIdParam.trim() : undefined;

  useEffect(() => {
    if (!focusPostId || loading || focusHandledRef.current === focusPostId) return;
    const idx = feedListIndexForPostId(feedListItems, focusPostId);
    if (idx < 0) {
      if (hasMore) loadMore();
      return;
    }
    focusHandledRef.current = focusPostId;
    setHighlightedPostId(focusPostId);
    requestAnimationFrame(() => {
      void listRef.current
        ?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.3 })
        .catch(() => {
          listRef.current?.scrollToOffset({ offset: Math.max(0, idx * 480), animated: true });
        });
    });
    const t = setTimeout(() => setHighlightedPostId(null), 3500);
    return () => clearTimeout(t);
  }, [focusPostId, loading, feedListItems, hasMore, loadMore]);

  useFocusEffect(
    useCallback(() => {
      if (!isHydrated || !isAuthenticated) return;

      const now = Date.now();
      const afterPublish = feedRefreshParam === "1" && !feedRefreshHandledRef.current;
      const auxStale = now - feedAuxRefreshAtRef.current > FEED_AUX_REFRESH_STALE_MS;

      if (afterPublish) {
        feedRefreshHandledRef.current = true;
        requestAnimationFrame(() => scrollFeedToTop());
        router.setParams({ feedRefresh: undefined });
      } else {
        feedFocusCountRef.current += 1;
      }

      const mode = afterPublish ? "refresh" : feedFocusCountRef.current === 1 ? "initial" : "refresh";

      void (async () => {
        if (!feedScopeReady) {
          const following = await refreshFollowing();
          const scope = await initScope(following.length);
          void fetchFeed(mode, scope, afterPublish ? { force: true } : undefined);
          return;
        }
        void refreshFollowing();
        void fetchFeed(mode, feedScope, afterPublish ? { force: true } : undefined);
      })();

      void refreshStories();
      void refreshFeedLocalPrefs();
      if (auxStale || afterPublish) {
        feedAuxRefreshAtRef.current = now;
        void refreshDiscover();
        void refreshWorkoutTitles();
      }
      void refreshBadge();

      return () => {
        if (feedRefreshParam !== "1") {
          feedRefreshHandledRef.current = false;
        }
      };
    }, [
      isHydrated,
      isAuthenticated,
      feedRefreshParam,
      feedScope,
      feedScopeReady,
      initScope,
      fetchFeed,
      refreshStories,
      refreshFeedLocalPrefs,
      refreshFollowing,
      refreshDiscover,
      refreshWorkoutTitles,
      refreshBadge,
      scrollFeedToTop,
      router,
    ])
  );

  const handleNewPostsBanner = useCallback(() => {
    scrollFeedToTop();
    void fetchFeed("refresh", feedScope);
  }, [scrollFeedToTop, fetchFeed, feedScope]);

  const openNotifications = useCallback(() => {
    router.push({ pathname: "/(tabs)/social", params: { activity: "1" } });
  }, [router]);

  const feedPostActionsHandlers = useMemo<FeedPostActionsHandlers>(
    () => ({
      toggleLike: (postId) => void handleToggleLike(postId),
      submitComment: (postId, content) => void handleCreateComment(postId, content),
      deletePost: (postId) => void handleDeletePost(postId),
      toggleSave: (postId) => void handleToggleSave(postId),
      muteAuthor: (authorId) => void handleMuteAuthor(authorId),
      openAuthor: handleOpenAuthor,
      reportPost: (post) => setReportTarget(post),
      openWorkoutForPost: handlePressWorkout,
      openSession: handlePressSession,
      clearCommentError: () => clearCommentError(),
    }),
    [
      handleToggleLike,
      handleCreateComment,
      handleDeletePost,
      handleToggleSave,
      handleMuteAuthor,
      handleOpenAuthor,
      handlePressWorkout,
      handlePressSession,
      clearCommentError,
    ]
  );

  const feedPostActionsSnapshot = useMemo<FeedPostActionsSnapshot>(
    () => ({
      getCommentError: () => undefined,
      isCommenting: () => false,
      isDeleting: () => false,
      isSaved: () => false,
    }),
    []
  );

  const feedListExtraKey = useMemo(
    () =>
      [
        activeBeamPostId ?? "",
        highlightedPostId ?? "",
        feedScope,
        showFollowingHint ? "1" : "0",
      ].join("|"),
    [activeBeamPostId, highlightedPostId, feedScope, showFollowingHint]
  );

  const renderFeedItem = useCallback(
    ({ item }: { item: FeedListItem }) => {
      if (item.kind === "day") {
        return <FeedDaySeparator label={item.label} />;
      }
      if (item.kind === "suggestions") {
        return <FeedInlineSuggestionsRow {...suggestionsRowProps} />;
      }
      if (item.kind === "workout") {
        return <FeedWorkoutEventRow event={item.event} onOpenAuthor={handleOpenAuthor} />;
      }
      const post = item.post;
      const openCommentsFromNotification =
        focusPostId === post.id && Boolean(focusCommentId);
      return (
        <FeedPostCardRow
          post={post}
          currentUserId={user?.id}
          sessionAvatarUrl={user?.avatarUrl}
          isBeamActive={
            goldBeamEnabled && activeBeamPostId === post.id && postEligibleForGoldBeam(post)
          }
          initialCommentsOpen={openCommentsFromNotification}
          highlighted={highlightedPostId === post.id}
          workoutTitle={
            post.sessionWorkoutTitle ??
            (post.workoutId ? workoutTitles[post.workoutId] ?? "Rutina vinculada" : null)
          }
        />
      );
    },
    [
      focusPostId,
      focusCommentId,
      user?.id,
      user?.avatarUrl,
      activeBeamPostId,
      goldBeamEnabled,
      highlightedPostId,
      workoutTitles,
      suggestionsRowProps,
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
        <FeedDiscoveryZone
          authors={storyStripAuthors}
          currentUserId={user.id}
          seenRevision={storySeenRevision}
          onSelectAuthor={handleStoryCellClick}
          suggestionsPlacement={shouldOfferSuggestions ? suggestionsPlacement : "none"}
        />
      ) : null}

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
        onRetry={error ? () => void fetchFeed("initial", feedScope) : undefined}
      />

      {loading && posts.length === 0 ? <FeedPostCardSkeleton count={3} /> : null}
    </View>
  );

  const listFooter = (
    <View>
      {!loading && !error && postCount === 0 ? (
        <FeedEmptyState
          scope={feedScope}
          suggestionsSlot={
            showSuggestionsInEmpty ? (
              <FeedSuggestionsRow {...suggestionsRowProps} variant="empty" />
            ) : undefined
          }
        />
      ) : null}
      <FeedLoadMoreFooter
        hasMore={hasMore && postCount > 0}
        loadingMore={loadingMore}
        onLoadMore={loadMore}
      />
    </View>
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AppScreenShell variant="feed">
        <FeedGoldBeamProvider scrollY={scrollY} enabled={goldBeamEnabled}>
        <View style={styles.screen}>
          <FeedTopBar
            user={user}
            onBrandPress={scrollFeedToTop}
            scrollY={scrollY}
            unreadCount={unreadNotifications}
            onNotificationsPress={openNotifications}
          />
          <View style={[styles.newPostsBannerSlot, { top: Math.max(insets.top, 6) + 52 }]}>
            <FeedNewPostsBanner count={pendingNewCount} onPress={handleNewPostsBanner} />
          </View>
          <FeedPostActionsProvider
            handlers={feedPostActionsHandlers}
            snapshot={feedPostActionsSnapshot}
          >
          <FeedAnimatedFlashList
            ref={listRef}
            style={styles.list}
            data={feedListItems}
            keyExtractor={(item) => item.key}
            getItemType={(item) => item.kind}
            keyboardShouldPersistTaps="handled"
            drawDistance={720}
            viewabilityConfigCallbackPairs={beamViewabilityPairs}
            onScroll={onListScroll}
            scrollEventThrottle={16}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            extraData={feedListExtraKey}
            ItemSeparatorComponent={FeedListSeparator}
            renderItem={renderFeedItem}
            ListHeaderComponent={listHeader}
            ListFooterComponent={listFooter}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  void fetchFeed("refresh", feedScope, { force: true });
                  void refreshStories();
                  void refreshFollowing();
                  void refreshDiscover();
                  void refreshFeedLocalPrefsForce();
                }}
                tintColor={AUTH.gold}
                colors={[AUTH.gold]}
                progressBackgroundColor="#141416"
              />
            }
          />
          </FeedPostActionsProvider>
          <FeedScrollToTopFab visible={showScrollFab} onPress={scrollFeedToTop} />
        </View>
        </FeedGoldBeamProvider>
      </AppScreenShell>

      <StoryViewerModal
        visible={storyViewerOpen}
        authors={storyViewerAuthorsList}
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
    backgroundColor: "transparent",
  },
  newPostsBannerSlot: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 11,
    alignItems: "center",
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
