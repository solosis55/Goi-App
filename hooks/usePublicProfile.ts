import { useCallback, useEffect, useMemo, useState } from "react";
import { getFollowers, getFollowing, getProfile, toggleFollow } from "../api/auth";
import { getPostsByUserPage } from "../api/posts";
import { PROFILE_POSTS_PAGE_SIZE } from "../constants/profilePosts";
import type { ProfileUser } from "../types/auth";
import type { Post } from "../types/post";
import { getErrorMessage } from "../utils/errorMessages";

type UsePublicProfileArgs = {
  userId: string | null;
  currentUserId: string | undefined;
  initialFollowingIds: string[];
  onFollowingChanged?: (targetUserId: string, following: boolean) => void;
};

export function usePublicProfile({
  userId,
  currentUserId,
  initialFollowingIds,
  onFollowingChanged,
}: UsePublicProfileArgs) {
  const [profile, setProfile] = useState<ProfileUser | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [postsTotal, setPostsTotal] = useState(0);
  const [postsNextCursor, setPostsNextCursor] = useState<string | null>(null);
  const [postsLoadingMore, setPostsLoadingMore] = useState(false);
  const [following, setFollowing] = useState(() =>
    Boolean(userId && initialFollowingIds.includes(userId))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followBusy, setFollowBusy] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);

  const load = useCallback(async () => {
    if (!userId || userId === currentUserId) return;
    setLoading(true);
    setPostsLoadingMore(false);
    setError(null);
    setFollowerCount(null);
    setFollowingCount(null);
    setPostsNextCursor(null);
    try {
      const [profRes, pageRes] = await Promise.all([
        getProfile(userId),
        getPostsByUserPage(userId, { limit: PROFILE_POSTS_PAGE_SIZE }),
      ]);
      setProfile(profRes.user);
      setPosts(pageRes.posts);
      setPostsTotal(pageRes.total);
      setPostsNextCursor(pageRes.nextCursor);
      try {
        const [folR, fingR] = await Promise.all([getFollowers(userId), getFollowing(userId)]);
        setFollowerCount(folR.followerIds?.length ?? 0);
        setFollowingCount(fingR.followingIds?.length ?? 0);
      } catch {
        setFollowerCount(null);
        setFollowingCount(null);
      }
    } catch (e) {
      setError(getErrorMessage(e, "No se pudo cargar el perfil"));
      setProfile(null);
      setPosts([]);
      setPostsTotal(0);
      setPostsNextCursor(null);
    } finally {
      setLoading(false);
    }
  }, [userId, currentUserId]);

  const loadMorePosts = useCallback(async () => {
    if (!userId || userId === currentUserId || !postsNextCursor || postsLoadingMore || loading) return;
    setPostsLoadingMore(true);
    try {
      const pageRes = await getPostsByUserPage(userId, {
        limit: PROFILE_POSTS_PAGE_SIZE,
        cursor: postsNextCursor,
      });
      setPosts((prev) => {
        const seen = new Set(prev.map((p) => p.id));
        const merged = [...prev];
        for (const p of pageRes.posts) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            merged.push(p);
          }
        }
        return merged;
      });
      setPostsNextCursor(pageRes.nextCursor);
      setPostsTotal(pageRes.total);
    } catch (e) {
      setError(getErrorMessage(e, "No se pudieron cargar más publicaciones"));
    } finally {
      setPostsLoadingMore(false);
    }
  }, [userId, currentUserId, postsNextCursor, postsLoadingMore, loading]);

  useEffect(() => {
    if (!userId || userId === currentUserId) {
      setProfile(null);
      setPosts([]);
      setPostsTotal(0);
      setPostsNextCursor(null);
      setFollowerCount(null);
      setFollowingCount(null);
      return;
    }
    void load();
  }, [userId, currentUserId, load]);

  useEffect(() => {
    if (!userId) setFollowing(false);
    else setFollowing(initialFollowingIds.includes(userId));
  }, [userId, initialFollowingIds]);

  const orderedPosts = useMemo(() => {
    const pin = profile?.pinnedPostId?.trim();
    if (!pin) return posts;
    return [...posts].sort((a, b) => {
      if (a.id === pin) return -1;
      if (b.id === pin) return 1;
      return 0;
    });
  }, [posts, profile?.pinnedPostId]);

  const showRestricted = Boolean(profile?.restrictedToFollowers && !following);

  const handleToggleFollow = useCallback(async () => {
    if (!userId || userId === currentUserId) return;
    setFollowBusy(true);
    setError(null);
    try {
      const res = await toggleFollow(userId);
      setFollowing(res.following);
      onFollowingChanged?.(userId, res.following);
      await load();
    } catch (e) {
      setError(getErrorMessage(e, "No se pudo actualizar el seguimiento"));
    } finally {
      setFollowBusy(false);
    }
  }, [userId, currentUserId, load, onFollowingChanged]);

  return {
    profile,
    postsTotal,
    postsNextCursor,
    postsLoadingMore,
    orderedPosts,
    loading,
    error,
    following,
    followBusy,
    showRestricted,
    followerCount,
    followingCount,
    handleToggleFollow,
    load,
    loadMorePosts,
  };
}
