import { useCallback, useMemo, useRef, useState } from "react";
import { getFeedPage } from "../api/posts";
import { ApiError } from "../api/client";
import { FEED_PAGE_SIZE, type FeedScope } from "../constants/feed";
import { FEED_SUGGESTIONS_INSERT_AFTER_POSTS } from "../constants/feedSuggestions";
import type { FeedTimelineItemDto, Post } from "../types/post";
import { buildFeedListItems, reuseFeedListItems, type FeedListItem } from "../utils/feedListItems";
import { countFeedPosts, filterMutedTimeline } from "../utils/feedTimeline";
import { patchTimelinePost } from "../utils/feedTimelinePatch";
import { useFeedPrefsStore } from "../stores/useFeedPrefsStore";

type FeedError = { message: string; detail?: string };

export function useFeed(userId: string | undefined) {
  const feedScope = useFeedPrefsStore((s) => s.feedScope);
  const feedScopeReady = useFeedPrefsStore((s) => s.feedScopeReady);
  const mutedUserIds = useFeedPrefsStore((s) => s.mutedUserIds);
  const initFeedScope = useFeedPrefsStore((s) => s.initFeedScope);
  const setFeedScopeInStore = useFeedPrefsStore((s) => s.setFeedScope);

  const mutedUserIdSet = useMemo(() => new Set(mutedUserIds), [mutedUserIds]);

  const [timeline, setTimeline] = useState<FeedTimelineItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<FeedError | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [pendingNewCount, setPendingNewCount] = useState(0);

  const feedAnchorRef = useRef<string | null>(null);
  const scrollAtTopRef = useRef(true);
  const nextCursorRef = useRef<string | null>(null);
  const lastFetchAtRef = useRef(0);
  const listItemsCacheRef = useRef<FeedListItem[]>([]);
  const timelineLengthRef = useRef(0);
  timelineLengthRef.current = timeline.length;
  const STALE_MS = 30_000;

  const initScope = useCallback(
    async (followingCount: number) => initFeedScope(followingCount),
    [initFeedScope]
  );

  const filteredTimeline = useMemo(
    () => filterMutedTimeline(timeline, mutedUserIdSet),
    [timeline, mutedUserIdSet]
  );

  const posts = useMemo(
    () => filteredTimeline.filter((e): e is { kind: "post"; post: Post } => e.kind === "post").map((e) => e.post),
    [filteredTimeline]
  );

  const fetchFeed = useCallback(
    async (mode: "initial" | "refresh" | "more", scope: FeedScope, opts?: { force?: boolean }) => {
      if (!userId) return;
      if (
        mode === "refresh" &&
        !opts?.force &&
        Date.now() - lastFetchAtRef.current < STALE_MS &&
        timelineLengthRef.current > 0
      ) {
        return;
      }
      if (mode === "initial") setLoading(true);
      else if (mode === "more") setLoadingMore(true);
      else setRefreshing(true);
      setError(null);

      try {
        const cursor = mode === "more" ? nextCursorRef.current : null;
        const page = await getFeedPage(scope, FEED_PAGE_SIZE, cursor);

        if (mode === "more" && cursor) {
          setTimeline((prev) => [...prev, ...page.items]);
        } else {
          const list = page.items;
          const anchor = feedAnchorRef.current;

          if (mode === "refresh" && anchor && !scrollAtTopRef.current) {
            const anchorIdx = list.findIndex((e) => e.kind === "post" && e.post.id === anchor);
            if (anchorIdx > 0) {
              setPendingNewCount(anchorIdx);
            } else if (anchorIdx === -1) {
              const firstPost = list.find((e) => e.kind === "post");
              if (firstPost && firstPost.kind === "post" && firstPost.post.id !== anchor) {
                setPendingNewCount(1);
              }
            }
          } else if (mode === "refresh" || mode === "initial") {
            const firstPost = list.find((e) => e.kind === "post");
            feedAnchorRef.current = firstPost && firstPost.kind === "post" ? firstPost.post.id : null;
            if (scrollAtTopRef.current) setPendingNewCount(0);
          }

          setTimeline(list);
        }

        nextCursorRef.current = page.nextCursor;
        setNextCursor(page.nextCursor);
        setHasMore(page.hasMore);
        lastFetchAtRef.current = Date.now();
      } catch (e) {
        if (e instanceof ApiError) {
          setError({ message: e.message, detail: `Código ${e.code} · HTTP ${e.status}` });
        } else {
          setError({ message: "No se pudo cargar el feed." });
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [userId]
  );

  const setFeedScopePersisted = useCallback(
    (scope: FeedScope) => {
      void setFeedScopeInStore(scope);
      setTimeline([]);
      setNextCursor(null);
      setHasMore(false);
      void fetchFeed("initial", scope);
    },
    [fetchFeed, setFeedScopeInStore]
  );

  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore || !nextCursor) return;
    void fetchFeed("more", feedScope);
  }, [hasMore, loadingMore, nextCursor, fetchFeed, feedScope]);

  const scrollToTop = useCallback(() => {
    scrollAtTopRef.current = true;
    const first = posts[0];
    feedAnchorRef.current = first?.id ?? null;
    setPendingNewCount(0);
  }, [posts]);

  const markScrolledDown = useCallback(() => {
    scrollAtTopRef.current = false;
  }, []);

  const markAtTop = useCallback(() => {
    scrollAtTopRef.current = true;
    feedAnchorRef.current = posts[0]?.id ?? null;
    setPendingNewCount(0);
  }, [posts]);

  const buildListItems = useCallback(
    (opts: { insertSuggestions: boolean }) => {
      const built = buildFeedListItems(filteredTimeline, {
        insertSuggestions: opts.insertSuggestions,
        suggestionsAfterPostCount: FEED_SUGGESTIONS_INSERT_AFTER_POSTS,
      });
      listItemsCacheRef.current = reuseFeedListItems(built, listItemsCacheRef.current);
      return listItemsCacheRef.current;
    },
    [filteredTimeline]
  );

  const patchTimeline = useCallback(
    (patch: (prev: FeedTimelineItemDto[]) => FeedTimelineItemDto[]) => {
      setTimeline(patch);
    },
    []
  );

  const patchPost = useCallback((postId: string, updater: (post: Post) => Post) => {
    setTimeline((prev) => patchTimelinePost(prev, postId, updater));
  }, []);

  return {
    timeline: filteredTimeline,
    posts,
    postCount: countFeedPosts(filteredTimeline),
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
    scrollToTop,
    markScrolledDown,
    markAtTop,
    buildListItems,
    patchTimeline,
    patchPost,
  };
}
