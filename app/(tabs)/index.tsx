import { Box } from "@gluestack-ui/themed";
import { Redirect, Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useRef } from "react";
import { ActivityIndicator } from "react-native";
import type { FeedAnimatedFlashListRef } from "../../components/feed/FeedAnimatedFlashList";
import { FeedReportModal } from "../../components/feed/FeedReportModal";
import { FeedScreenContent } from "../../components/feed/FeedScreenContent";
import { StoryViewerModal } from "../../components/stories/StoryViewerModal";
import { SOCIAL_ACTIVITY_HREF } from "../../constants/appRoutes";
import { useGoiTheme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useFeed } from "../../hooks/useFeed";
import { useFeedDiscoverSuggestions } from "../../hooks/useFeedDiscoverSuggestions";
import { useFeedFocusEffects } from "../../hooks/useFeedFocusEffects";
import { useFeedGoldBeam } from "../../hooks/useFeedGoldBeam";
import { useHydrateGoldBeamPref } from "../../hooks/useHydrateGoldBeamPref";
import { useFeedPostActions } from "../../hooks/useFeedPostActions";
import { useFeedScrollFab } from "../../hooks/useFeedScrollFab";
import { useFeedStories } from "../../hooks/useFeedStories";
import { useFeedWorkoutTitles } from "../../hooks/useFeedWorkoutTitles";
import { useFeedPrefsStore } from "../../stores/useFeedPrefsStore";
import { useSocialHubStore } from "../../stores/useSocialHubStore";

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
  const { palette } = useGoiTheme();
  const { isHydrated, isAuthenticated, user } = useAuth();
  const hydrateFeedLocalPrefs = useFeedPrefsStore((s) => s.hydrateFeedLocalPrefs);
  const followingIds = useSocialHubStore((s) => s.followingIds);
  const unreadNotifications = useSocialHubStore((s) => s.unreadNotifications);
  const refreshBadge = useSocialHubStore((s) => s.refreshBadge);
  const listRef = useRef<FeedAnimatedFlashListRef>(null);

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
    markScrolledDown,
    markAtTop,
    buildListItems,
    patchTimeline,
    patchPost,
    isFeedCacheFresh,
  } = feed;

  const goldBeamEnabled = useFeedPrefsStore((s) => s.goldBeamEnabled);
  useHydrateGoldBeamPref();
  const { scrollY, activeBeamPostId, beamViewabilityPairs } = useFeedGoldBeam(posts, goldBeamEnabled);
  const { showScrollFab, onListScroll } = useFeedScrollFab(scrollY, markAtTop, markScrolledDown);

  const {
    storyStripAuthors,
    storyViewerAuthorsList,
    storySeenRevision,
    storyViewerOpen,
    storyViewerAuthorIdx,
    storyViewerSlideIdx,
    setStoryViewerOpen,
    bumpStorySeenRevision,
    refreshStories,
    handleStoryCellClick,
  } = useFeedStories(user);

  const {
    suggestionsPlacement,
    shouldOfferSuggestions,
    insertSuggestionsInline,
    showSuggestionsInEmpty,
    availableSuggestionsCount,
    suggestionsRowProps,
    refreshDiscover,
  } = useFeedDiscoverSuggestions(user, feedScope, postCount);

  const { workoutTitles, refreshWorkoutTitles } = useFeedWorkoutTitles(user?.id);

  const {
    handlers: postActionsHandlers,
    reportTarget,
    setReportTarget,
    handleReportSubmit,
    handleOpenAuthor,
  } = useFeedPostActions({ user, posts, patchPost, patchTimeline });

  const scrollFeedToTop = useCallback(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
    feed.scrollToTop();
  }, [feed]);

  const refreshFollowing = useCallback(async (): Promise<string[]> => {
    if (!user?.id) return [];
    await useSocialHubStore.getState().refreshHub({ silent: true });
    return useSocialHubStore.getState().followingIds;
  }, [user?.id]);

  const refreshFeedLocalPrefs = useCallback(async () => {
    await hydrateFeedLocalPrefs(user?.id);
  }, [user?.id, hydrateFeedLocalPrefs]);

  const refreshFeedLocalPrefsForce = useCallback(async () => {
    await hydrateFeedLocalPrefs(user?.id, { force: true });
  }, [user?.id, hydrateFeedLocalPrefs]);

  const feedListItems = useMemo(
    () =>
      buildListItems({
        insertSuggestions: insertSuggestionsInline && availableSuggestionsCount > 0,
      }),
    [buildListItems, insertSuggestionsInline, availableSuggestionsCount]
  );

  const focusPostId = typeof focusPostIdParam === "string" ? focusPostIdParam : undefined;
  const focusCommentId =
    typeof focusCommentIdParam === "string" ? focusCommentIdParam.trim() : undefined;

  const { highlightedPostId } = useFeedFocusEffects({
    isHydrated,
    isAuthenticated,
    feedRefreshParam,
    focusPostId,
    loading,
    feedListItems,
    hasMore,
    loadMore,
    feedScope,
    feedScopeReady,
    followingIds,
    initScope,
    fetchFeed,
    isFeedCacheFresh,
    scrollFeedToTop,
    listRef,
    refreshStories,
    refreshFeedLocalPrefs,
    refreshFollowing,
    refreshDiscover,
    refreshWorkoutTitles,
    refreshBadge,
  });

  const showFollowingHint =
    feedScope === "following" && postCount === 0 && !loading && !error;

  const handleNewPostsBanner = useCallback(() => {
    scrollFeedToTop();
    void fetchFeed("refresh", feedScope);
  }, [scrollFeedToTop, fetchFeed, feedScope]);

  const openNotifications = useCallback(() => {
    router.push(SOCIAL_ACTIVITY_HREF);
  }, [router]);

  const handlePullRefresh = useCallback(() => {
    void fetchFeed("refresh", feedScope, { force: true });
    void refreshStories();
    void refreshFollowing();
    void refreshDiscover();
    void refreshFeedLocalPrefsForce();
  }, [
    fetchFeed,
    feedScope,
    refreshStories,
    refreshFollowing,
    refreshDiscover,
    refreshFeedLocalPrefsForce,
  ]);

  const feedMediaFingerprint = useMemo(
    () => posts.map((p) => `${p.id}:${p.media?.[0]?.url ?? ""}`).join(";"),
    [posts]
  );

  const feedInteractionFingerprint = useMemo(
    () =>
      posts
        .map((p) => `${p.id}:${p.likedByMe ? 1 : 0}:${p.likesCount}:${p.comments.length}`)
        .join(";"),
    [posts]
  );

  const feedListExtraKey = useMemo(
    () =>
      [
        activeBeamPostId ?? "",
        highlightedPostId ?? "",
        feedScope,
        showFollowingHint ? "1" : "0",
        feedMediaFingerprint,
        feedInteractionFingerprint,
      ].join("|"),
    [
      activeBeamPostId,
      highlightedPostId,
      feedScope,
      showFollowingHint,
      feedMediaFingerprint,
      feedInteractionFingerprint,
    ]
  );

  if (!isHydrated) {
    return (
      <Box flex={1} justifyContent="center" alignItems="center" style={{ backgroundColor: palette.background }}>
        <ActivityIndicator color={palette.primary} />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return <Redirect href="/login" />;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <FeedScreenContent
        user={user}
        listRef={listRef}
        scrollY={scrollY}
        goldBeamEnabled={goldBeamEnabled}
        activeBeamPostId={activeBeamPostId}
        beamViewabilityPairs={beamViewabilityPairs}
        onListScroll={onListScroll}
        showScrollFab={showScrollFab}
        scrollFeedToTop={scrollFeedToTop}
        unreadNotifications={unreadNotifications}
        onNotificationsPress={openNotifications}
        pendingNewCount={pendingNewCount}
        onNewPostsBanner={handleNewPostsBanner}
        feedListItems={feedListItems}
        feedListExtraKey={feedListExtraKey}
        feedScope={feedScope}
        feedScopeReady={feedScopeReady}
        setFeedScopePersisted={setFeedScopePersisted}
        showFollowingHint={showFollowingHint}
        loading={loading}
        refreshing={refreshing}
        loadingMore={loadingMore}
        error={error}
        posts={posts}
        postCount={postCount}
        hasMore={hasMore}
        loadMore={loadMore}
        fetchFeed={fetchFeed}
        onPullRefresh={handlePullRefresh}
        storyStripAuthors={storyStripAuthors}
        storySeenRevision={storySeenRevision}
        onStoryCellClick={handleStoryCellClick}
        shouldOfferSuggestions={shouldOfferSuggestions}
        suggestionsPlacement={suggestionsPlacement}
        showSuggestionsInEmpty={showSuggestionsInEmpty}
        suggestionsRowProps={suggestionsRowProps}
        workoutTitles={workoutTitles}
        highlightedPostId={highlightedPostId}
        focusPostId={focusPostId}
        focusCommentId={focusCommentId}
        onOpenAuthor={handleOpenAuthor}
        postActionsHandlers={postActionsHandlers}
      />

      <StoryViewerModal
        visible={storyViewerOpen}
        authors={storyViewerAuthorsList}
        startAuthorIdx={storyViewerAuthorIdx}
        startSlideIdx={storyViewerSlideIdx}
        onClose={() => setStoryViewerOpen(false)}
        onStoriesUiRefresh={bumpStorySeenRevision}
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
