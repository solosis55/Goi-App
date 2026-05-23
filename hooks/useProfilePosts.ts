import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getPosts, getPostsByUserPage } from "../api/posts";
import {
  PROFILE_POSTS_PAGE_SIZE,
  type ProfilePostsFilter,
  type ProfilePostsSourceTab,
} from "../constants/profilePosts";
import type { Post } from "../types/post";
import {
  loadSavedPostIds,
  pruneSavedPostIdsToExisting,
} from "../utils/feedLocalPrefs";
import { getErrorMessage } from "../utils/errorMessages";
import { applyProfilePostsFilter } from "../utils/profilePostsDisplay";

export function useProfilePosts(userId: string | undefined, pinnedPostId?: string | null) {
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [timelinePosts, setTimelinePosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [savedRevision, setSavedRevision] = useState(0);
  const [orphansCount, setOrphansCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [sourceTab, setSourceTab] = useState<ProfilePostsSourceTab>("mine");
  const [filter, setFilter] = useState<ProfilePostsFilter>("all");
  const [loading, setLoading] = useState(true);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const focusCountRef = useRef(0);
  const loadingMoreRef = useRef(false);

  const refreshSavedLocal = useCallback(() => {
    setSavedRevision((n) => n + 1);
  }, []);

  const rebuildSavedPosts = useCallback(async () => {
    if (!userId) {
      setSavedPosts([]);
      setOrphansCount(0);
      return;
    }
    const ids = await loadSavedPostIds(userId);
    const byId = new Map(timelinePosts.map((p) => [p.id, p]));
    const out: Post[] = [];
    for (const id of ids) {
      const p = byId.get(id);
      if (p) out.push(p);
    }
    setSavedPosts(out);
    const timelineIds = new Set(timelinePosts.map((p) => p.id));
    setOrphansCount(ids.filter((id) => !timelineIds.has(id)).length);
  }, [userId, timelinePosts]);

  useEffect(() => {
    void rebuildSavedPosts();
  }, [rebuildSavedPosts, savedRevision]);

  const loadTimeline = useCallback(async () => {
    if (!userId) return;
    setTimelineLoading(true);
    try {
      const data = await getPosts();
      const list = Array.isArray(data) ? data : [];
      setTimelinePosts(list);
      const idSet = new Set(list.map((p) => p.id));
      await pruneSavedPostIdsToExisting(userId, idSet);
      refreshSavedLocal();
    } catch {
      /* guardados locales siguen disponibles */
    } finally {
      setTimelineLoading(false);
    }
  }, [userId, refreshSavedLocal]);

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
    await Promise.all([fetchMinePage("refresh"), loadTimeline()]);
  }, [fetchMinePage, loadTimeline]);

  const loadMore = useCallback(() => {
    if (sourceTab !== "mine" || !nextCursor || loadingMore || loading) return;
    void fetchMinePage("more", nextCursor);
  }, [sourceTab, nextCursor, loadingMore, loading, fetchMinePage]);

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;
      focusCountRef.current += 1;
      const mode = focusCountRef.current === 1 ? "initial" : "refresh";
      void fetchMinePage(mode);
      void loadTimeline();
    }, [userId, fetchMinePage, loadTimeline])
  );

  const displayedPosts = useMemo(() => {
    const base = sourceTab === "mine" ? myPosts : savedPosts;
    return applyProfilePostsFilter(base, filter, sourceTab === "mine" ? pinnedPostId : null);
  }, [sourceTab, myPosts, savedPosts, filter, pinnedPostId]);

  const listLoading = sourceTab === "mine" ? loading : timelineLoading || loading;

  const removePost = useCallback((postId: string) => {
    setMyPosts((prev) => prev.filter((p) => p.id !== postId));
    setTotal((t) => Math.max(0, t - 1));
  }, []);

  const pruneSavedOrphans = useCallback(async () => {
    if (!userId) return;
    const idSet = new Set(timelinePosts.map((p) => p.id));
    await pruneSavedPostIdsToExisting(userId, idSet);
    refreshSavedLocal();
  }, [userId, timelinePosts, refreshSavedLocal]);

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
    refreshSavedLocal,
    savedOrphansCount: orphansCount,
    pruneSavedOrphans,
  };
}
