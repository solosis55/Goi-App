import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { FeedAnimatedFlashListRef } from "../components/feed/FeedAnimatedFlashList";
import { FEED_AUX_REFRESH_STALE_MS, FEED_STALE_MS, type FeedScope } from "../constants/feed";
import { feedListIndexForPostId, type FeedListItem } from "../utils/feedListItems";
import { useSocialHubStore } from "../stores/useSocialHubStore";
import { useFocusStaleRefresh } from "./useFocusStaleRefresh";

type UseFeedFocusEffectsOptions = {
  isHydrated: boolean;
  isAuthenticated: boolean;
  feedRefreshParam?: string;
  focusPostId?: string;
  focusCommentId?: string;
  loading: boolean;
  feedListItems: FeedListItem[];
  hasMore: boolean;
  loadMore: () => void;
  feedScope: FeedScope;
  feedScopeReady: boolean;
  followingIds: string[];
  initScope: (followingCount: number) => Promise<FeedScope>;
  fetchFeed: (
    mode: "initial" | "refresh",
    scope: FeedScope,
    opts?: { force?: boolean }
  ) => void;
  isFeedCacheFresh: () => boolean;
  hasFeedTimeline: () => boolean;
  scrollFeedToTop: () => void;
  listRef: RefObject<FeedAnimatedFlashListRef | null>;
  refreshStories: () => Promise<void>;
  refreshFeedLocalPrefs: () => Promise<void>;
  refreshFollowing: () => Promise<string[]>;
  refreshDiscover: () => Promise<void>;
  refreshWorkoutTitles: () => Promise<void>;
  refreshBadge: () => Promise<void>;
};

export function useFeedFocusEffects({
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
  hasFeedTimeline,
  scrollFeedToTop,
  listRef,
  refreshStories,
  refreshFeedLocalPrefs,
  refreshFollowing,
  refreshDiscover,
  refreshWorkoutTitles,
  refreshBadge,
}: UseFeedFocusEffectsOptions) {
  const router = useRouter();
  const feedRefreshHandledRef = useRef(false);
  const feedAuxRefreshAtRef = useRef(0);
  const afterPublishRef = useRef(false);
  const focusAuxStaleRef = useRef(false);
  const focusHandledRef = useRef<string | null>(null);
  const [highlightedPostId, setHighlightedPostId] = useState<string | null>(null);

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
  }, [focusPostId, loading, feedListItems, hasMore, loadMore, listRef]);

  const onFocusEnter = useCallback(() => {
    const afterPublish = feedRefreshParam === "1" && !feedRefreshHandledRef.current;
    afterPublishRef.current = afterPublish;
    if (afterPublish) {
      feedRefreshHandledRef.current = true;
      requestAnimationFrame(() => scrollFeedToTop());
      router.setParams({ feedRefresh: undefined });
    }
    return () => {
      if (feedRefreshParam !== "1") {
        feedRefreshHandledRef.current = false;
      }
      afterPublishRef.current = false;
    };
  }, [feedRefreshParam, scrollFeedToTop, router]);

  const skipFocusIncrement = useCallback(() => afterPublishRef.current, []);

  const forceRefresh = useCallback(() => afterPublishRef.current, []);

  const onEveryFocus = useCallback(() => {
    const now = Date.now();
    const auxStale = now - feedAuxRefreshAtRef.current > FEED_AUX_REFRESH_STALE_MS;
    const afterPublish = afterPublishRef.current;
    focusAuxStaleRef.current = auxStale;

    void refreshFeedLocalPrefs();
    if (auxStale || afterPublish) {
      feedAuxRefreshAtRef.current = now;
      void refreshDiscover();
      void refreshWorkoutTitles();
    }
    if (auxStale || afterPublish) void refreshStories();
    void refreshBadge();
  }, [
    refreshFeedLocalPrefs,
    refreshDiscover,
    refreshWorkoutTitles,
    refreshStories,
    refreshBadge,
  ]);

  const onRefresh = useCallback(() => {
      const afterPublish = afterPublishRef.current;
      const fetchMode = afterPublish || hasFeedTimeline() ? "refresh" : "initial";

      void (async () => {
        if (!feedScopeReady) {
          await refreshFollowing();
          const scope = await initScope(useSocialHubStore.getState().followingIds.length);
          void fetchFeed(fetchMode, scope, afterPublish ? { force: true } : undefined);
          return;
        }
        if (afterPublish || focusAuxStaleRef.current) {
          void refreshFollowing();
        }
        void fetchFeed(fetchMode, feedScope, afterPublish ? { force: true } : undefined);
      })();
    },
    [feedScopeReady, refreshFollowing, initScope, fetchFeed, feedScope, hasFeedTimeline]
  );

  useFocusStaleRefresh({
    enabled: isHydrated && isAuthenticated,
    staleMs: FEED_STALE_MS,
    hasData: isFeedCacheFresh,
    deferUntilInteractions: true,
    skipFocusIncrement,
    forceRefresh,
    onFocusEnter,
    onEveryFocus,
    onRefresh,
  });

  return { highlightedPostId };
}
