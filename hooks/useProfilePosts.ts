import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPostsByIds, getPostsByUserPage } from "../api/posts";
import {
  PROFILE_POSTS_PAGE_SIZE,
  type ProfilePostsFilter,
  type ProfilePostsSourceTab,
} from "../constants/profilePosts";
import { useFocusStaleRefresh } from "./useFocusStaleRefresh";
import { useFeedPrefsStore } from "../stores/useFeedPrefsStore";
import type { Post } from "../types/post";
import { getErrorMessage } from "../utils/errorMessages";
import { applyProfilePostsFilter } from "../utils/profilePostsDisplay";

export function useProfilePosts(userId: string | undefined, pinnedPostId?: string | null) {
  const savedPostIds = useFeedPrefsStore((s) => s.savedPostIds);
  const pruneSavedPostsToExisting = useFeedPrefsStore((s) => s.pruneSavedPostsToExisting);

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [orphansCount, setOrphansCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [sourceTab, setSourceTab] = useState<ProfilePostsSourceTab>("mine");
  const [filter, setFilter] = useState<ProfilePostsFilter>("all");
  const [loading, setLoading] = useState(true);
  const [savedLoading, setSavedLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingMoreRef = useRef(false);
  const hasMinePostsRef = useRef(false);
  hasMinePostsRef.current = myPosts.length > 0;

  const loadSavedPosts = useCallback(
    async (ids: string[]) => {
      if (!userId) {
        setSavedPosts([]);
        setOrphansCount(0);
        return;
      }
      setSavedLoading(true);
      try {
        if (ids.length === 0) {
          setSavedPosts([]);
          setOrphansCount(0);
          return;
        }
        const posts = await getPostsByIds(ids);
        const byId = new Map(posts.map((p) => [p.id, p]));
        const ordered: Post[] = [];
        for (const id of ids) {
          const post = byId.get(id);
          if (post) ordered.push(post);
        }
        setSavedPosts(ordered);
        const orphans = ids.length - ordered.length;
        setOrphansCount(orphans);
        if (orphans > 0) {
          await pruneSavedPostsToExisting(userId, new Set(ordered.map((p) => p.id)));
        }
      } catch {
        setSavedPosts([]);
      } finally {
        setSavedLoading(false);
      }
    },
    [userId, pruneSavedPostsToExisting]
  );

  useEffect(() => {
    if (sourceTab === "saved") {
      void loadSavedPosts(savedPostIds);
    }
  }, [sourceTab, savedPostIds, loadSavedPosts]);

  const fetchMinePage = useCallback(
    async (mode: "initial" | "refresh" | "more", cursor?: string | null) => {
      if (!userId) return;
      if (mode === "more") {
        if (!cursor || loadingMoreRef.current) return;
        loadingMoreRef.current = true;
        setLoadingMore(true);
      } else if (mode === "refresh") {
        setRefreshing(true);
        setError(null);
      } else {
        setLoading(true);
        setError(null);
      }

      try {
        const res = await getPostsByUserPage(userId, {
          limit: PROFILE_POSTS_PAGE_SIZE,
          cursor: mode === "more" ? cursor : undefined,
        });
        setTotal(res.total);
        setNextCursor(res.nextCursor);
        setMyPosts((prev) => (mode === "more" ? [...prev, ...res.posts] : res.posts));
      } catch (e) {
        if (mode !== "more") {
          setMyPosts([]);
          setTotal(0);
          setNextCursor(null);
          setError(getErrorMessage(e, "No se pudieron cargar tus publicaciones."));
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
        loadingMoreRef.current = false;
        setLoadingMore(false);
      }
    },
    [userId]
  );

  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchMinePage("refresh"),
      sourceTab === "saved" ? loadSavedPosts(savedPostIds) : Promise.resolve(),
    ]);
  }, [fetchMinePage, loadSavedPosts, sourceTab, savedPostIds]);

  const loadMore = useCallback(() => {
    if (sourceTab !== "mine" || !nextCursor || loadingMore || loading) return;
    void fetchMinePage("more", nextCursor);
  }, [sourceTab, nextCursor, loadingMore, loading, fetchMinePage]);

  useFocusStaleRefresh({
    enabled: Boolean(userId),
    staleMs: 30_000,
    hasData: () => hasMinePostsRef.current,
    onRefresh: ({ isFirstFocus }) => {
      void fetchMinePage(isFirstFocus ? "initial" : "refresh");
    },
  });

  const displayedPosts = useMemo(() => {
    const base = sourceTab === "mine" ? myPosts : savedPosts;
    return applyProfilePostsFilter(base, filter, sourceTab === "mine" ? pinnedPostId : null);
  }, [sourceTab, myPosts, savedPosts, filter, pinnedPostId]);

  const listLoading = sourceTab === "mine" ? loading : savedLoading;

  const removePost = useCallback((postId: string) => {
    setMyPosts((prev) => prev.filter((p) => p.id !== postId));
    setSavedPosts((prev) => prev.filter((p) => p.id !== postId));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  const patchPost = useCallback((postId: string, updater: (post: Post) => Post) => {
    setMyPosts((prev) => prev.map((p) => (p.id === postId ? updater(p) : p)));
    setSavedPosts((prev) => prev.map((p) => (p.id === postId ? updater(p) : p)));
  }, []);

  const pruneSavedOrphans = useCallback(async () => {
    if (!userId) return;
    await loadSavedPosts(savedPostIds);
  }, [userId, loadSavedPosts, savedPostIds]);

  return {
    myPosts,
    setMyPosts,
    savedPosts,
    displayedPosts,
    total,
    sourceTab,
    setSourceTab,
    filter,
    setFilter,
    loading: listLoading,
    loadingMore,
    refreshing,
    error,
    hasMore: sourceTab === "mine" && Boolean(nextCursor),
    refreshAll,
    loadMore,
    removePost,
    patchPost,
    savedOrphansCount: orphansCount,
    pruneSavedOrphans,
  };
}
