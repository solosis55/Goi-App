import { useCallback, useEffect, useMemo, useState } from "react";
import { toggleFollow } from "../api/auth";
import { getPostsByUserPage } from "../api/posts";
import { getPublicProfileOverview } from "../api/publicProfile";
import { PROFILE_POSTS_PAGE_SIZE } from "../constants/profilePosts";
import type { ProfileUser } from "../types/auth";
import type { Post } from "../types/post";
import type {
  ProfileSectionAccess,
  PublicProfilePreviewPost,
  PublicProfileSession,
  ProfileRestrictionLevel,
  SocialUserPreview,
} from "../types/publicProfile";
import {
  peekPublicProfileCache,
  readPublicProfileCache,
  writePublicProfileCache,
} from "../utils/profileCache";
import { getErrorMessage } from "../utils/errorMessages";

type UsePublicProfileArgs = {
  userId: string | null;
  currentUserId: string | undefined;
  onFollowingChanged?: (targetUserId: string, following: boolean) => void;
};

export function usePublicProfile({
  userId,
  currentUserId,
  onFollowingChanged,
}: UsePublicProfileArgs) {
  const [profile, setProfile] = useState<ProfileUser | null>(() =>
    userId ? peekPublicProfileCache(userId)?.user ?? null : null
  );
  const [posts, setPosts] = useState<Post[]>(() =>
    userId ? peekPublicProfileCache(userId)?.posts.posts ?? [] : []
  );
  const [postsTotal, setPostsTotal] = useState(() =>
    userId ? peekPublicProfileCache(userId)?.posts.total ?? 0 : 0
  );
  const [postsNextCursor, setPostsNextCursor] = useState<string | null>(() =>
    userId ? peekPublicProfileCache(userId)?.posts.nextCursor ?? null : null
  );
  const [postsLoadingMore, setPostsLoadingMore] = useState(false);
  const [sessions, setSessions] = useState<PublicProfileSession[]>(() =>
    userId ? peekPublicProfileCache(userId)?.sessions ?? [] : []
  );
  const [workoutTitles, setWorkoutTitles] = useState<Record<string, string>>(() =>
    userId ? peekPublicProfileCache(userId)?.workoutTitles ?? {} : {}
  );
  const [mutualFollowers, setMutualFollowers] = useState<SocialUserPreview[]>(() =>
    userId ? peekPublicProfileCache(userId)?.mutualFollowers ?? [] : []
  );
  const [followsYou, setFollowsYou] = useState(() =>
    userId ? Boolean(peekPublicProfileCache(userId)?.followsYou) : false
  );
  const [following, setFollowing] = useState(() =>
    userId ? Boolean(peekPublicProfileCache(userId)?.following) : false
  );
  const [loading, setLoading] = useState(() => !userId || !peekPublicProfileCache(userId));
  const [error, setError] = useState<string | null>(null);
  const [followBusy, setFollowBusy] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(() =>
    userId ? peekPublicProfileCache(userId)?.followerCount ?? null : null
  );
  const [followingCount, setFollowingCount] = useState<number | null>(() =>
    userId ? peekPublicProfileCache(userId)?.followingCount ?? null : null
  );
  const [restricted, setRestricted] = useState(() =>
    userId ? Boolean(peekPublicProfileCache(userId)?.restricted) : false
  );
  const [restrictionLevel, setRestrictionLevel] = useState<ProfileRestrictionLevel>(() =>
    userId ? peekPublicProfileCache(userId)?.restrictionLevel ?? "none" : "none"
  );
  const [blocked, setBlocked] = useState(() =>
    userId ? Boolean(peekPublicProfileCache(userId)?.blocked) : false
  );
  const [followPending, setFollowPending] = useState(() =>
    userId ? Boolean(peekPublicProfileCache(userId)?.followPending) : false
  );
  const [previewPosts, setPreviewPosts] = useState<PublicProfilePreviewPost[]>(() =>
    userId ? peekPublicProfileCache(userId)?.previewPosts ?? [] : []
  );
  const [postCountTotal, setPostCountTotal] = useState(() =>
    userId ? peekPublicProfileCache(userId)?.postCountTotal ?? 0 : 0
  );
  const [postsHiddenByVisibility, setPostsHiddenByVisibility] = useState(() =>
    userId ? Boolean(peekPublicProfileCache(userId)?.postsHiddenByVisibility) : false
  );
  const [sectionAccess, setSectionAccess] = useState<ProfileSectionAccess>(() =>
    userId
      ? peekPublicProfileCache(userId)?.sectionAccess ?? {
          bio: true,
          stats: true,
          sessions: true,
          socialLists: true,
        }
      : { bio: true, stats: true, sessions: true, socialLists: true }
  );

  const applyOverview = useCallback((data: Awaited<ReturnType<typeof getPublicProfileOverview>>) => {
    setProfile(data.user);
    setPosts(data.posts.posts);
    setPostsTotal(data.posts.total);
    setPostsNextCursor(data.posts.nextCursor);
    setFollowerCount(data.followerCount);
    setFollowingCount(data.followingCount);
    setFollowing(data.following);
    setFollowsYou(data.followsYou);
    setRestricted(data.restricted);
    setRestrictionLevel(data.restrictionLevel ?? (data.restricted ? "partial" : "none"));
    setBlocked(data.blocked ?? false);
    setFollowPending(data.followPending ?? false);
    setPreviewPosts(data.previewPosts ?? []);
    setPostCountTotal(data.postCountTotal ?? data.posts.total);
    setPostsHiddenByVisibility(data.postsHiddenByVisibility ?? false);
    setSectionAccess(
      data.sectionAccess ?? { bio: true, stats: true, sessions: true, socialLists: true }
    );
    setMutualFollowers(data.mutualFollowers ?? []);
    setSessions(data.sessions ?? []);
    setWorkoutTitles(data.workoutTitles ?? {});
  }, []);

  const load = useCallback(async () => {
    if (!userId || userId === currentUserId) return;
    setPostsLoadingMore(false);
    setError(null);
    const hadInstant = Boolean(peekPublicProfileCache(userId));
    if (!hadInstant) setLoading(true);

    let showedCache = hadInstant;
    try {
      const cached = await readPublicProfileCache(userId);
      if (cached) {
        applyOverview(cached);
        showedCache = true;
        setLoading(false);
      }

      const data = await getPublicProfileOverview(userId);
      applyOverview(data);
      void writePublicProfileCache(userId, data);
    } catch (e) {
      if (!showedCache) {
        setError(getErrorMessage(e, "No se pudo cargar el perfil"));
      }
    } finally {
      setLoading(false);
    }
  }, [userId, currentUserId, applyOverview]);

  const loadMorePosts = useCallback(async () => {
    if (!userId || userId === currentUserId || !postsNextCursor || postsLoadingMore || loading || restricted) {
      return;
    }
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
  }, [userId, currentUserId, postsNextCursor, postsLoadingMore, loading, restricted]);

  useEffect(() => {
    if (!userId || userId === currentUserId) {
      setProfile(null);
      setPosts([]);
      setPostsTotal(0);
      setPostsNextCursor(null);
      setFollowerCount(null);
      setFollowingCount(null);
      setSessions([]);
      setMutualFollowers([]);
      setLoading(false);
      return;
    }
    void load();
  }, [userId, currentUserId, load]);

  const orderedPosts = useMemo(() => {
    const pin = profile?.pinnedPostId?.trim();
    if (!pin) return posts;
    return [...posts].sort((a, b) => {
      if (a.id === pin) return -1;
      if (b.id === pin) return 1;
      return 0;
    });
  }, [posts, profile?.pinnedPostId]);

  const showRestricted =
    blocked ||
    restrictionLevel !== "none" ||
    restricted ||
    Boolean(profile?.restrictedToFollowers && !following);
  const profileUnavailable = Boolean(profile?.profileUnavailable) || restrictionLevel === "unavailable";

  const handleToggleFollow = useCallback(async () => {
    if (!userId || userId === currentUserId) return;
    const prevFollowing = following;
    const prevPending = followPending;
    setFollowBusy(true);
    setError(null);
    setFollowing(!prevFollowing);
    setFollowPending(!prevFollowing ? false : prevPending);
    if (!prevFollowing) {
      setFollowerCount((c) => (c != null ? c + 1 : c));
    } else {
      setFollowerCount((c) => (c != null ? Math.max(0, c - 1) : c));
    }
    try {
      const res = await toggleFollow(userId);
      setFollowing(res.following);
      setFollowPending(Boolean(res.pending));
      onFollowingChanged?.(userId, res.following);
      void load();
    } catch (e) {
      setFollowing(prevFollowing);
      setFollowPending(prevPending);
      if (!prevFollowing) {
        setFollowerCount((c) => (c != null ? Math.max(0, c - 1) : c));
      } else {
        setFollowerCount((c) => (c != null ? c + 1 : c));
      }
      setError(getErrorMessage(e, "No se pudo actualizar el seguimiento"));
    } finally {
      setFollowBusy(false);
    }
  }, [userId, currentUserId, following, followPending, load, onFollowingChanged]);

  return {
    profile,
    postsTotal,
    postsNextCursor,
    postsLoadingMore,
    orderedPosts,
    sessions,
    workoutTitles,
    mutualFollowers,
    followsYou,
    loading,
    error,
    following,
    followBusy,
    showRestricted,
    profileUnavailable,
    restrictionLevel,
    blocked,
    followPending,
    previewPosts,
    postCountTotal,
    postsHiddenByVisibility,
    sectionAccess,
    followerCount,
    followingCount,
    handleToggleFollow,
    load,
    loadMorePosts,
  };
}
