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
import { readPublicProfileCache, writePublicProfileCache } from "../utils/profileCache";
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
  const [sessions, setSessions] = useState<PublicProfileSession[]>([]);
  const [workoutTitles, setWorkoutTitles] = useState<Record<string, string>>({});
  const [mutualFollowers, setMutualFollowers] = useState<SocialUserPreview[]>([]);
  const [followsYou, setFollowsYou] = useState(false);
  const [following, setFollowing] = useState(() =>
    Boolean(userId && initialFollowingIds.includes(userId))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followBusy, setFollowBusy] = useState(false);
  const [followerCount, setFollowerCount] = useState<number | null>(null);
  const [followingCount, setFollowingCount] = useState<number | null>(null);
  const [restricted, setRestricted] = useState(false);
  const [restrictionLevel, setRestrictionLevel] = useState<ProfileRestrictionLevel>("none");
  const [blocked, setBlocked] = useState(false);
  const [followPending, setFollowPending] = useState(false);
  const [previewPosts, setPreviewPosts] = useState<PublicProfilePreviewPost[]>([]);
  const [postCountTotal, setPostCountTotal] = useState(0);
  const [postsHiddenByVisibility, setPostsHiddenByVisibility] = useState(false);
  const [sectionAccess, setSectionAccess] = useState<ProfileSectionAccess>({
    bio: true,
    stats: true,
    sessions: true,
    socialLists: true,
  });

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
    setLoading(true);
    setPostsLoadingMore(false);
    setError(null);
    try {
      const cached = await readPublicProfileCache(userId);
      if (cached) applyOverview(cached);

      const data = await getPublicProfileOverview(userId);
      applyOverview(data);
      void writePublicProfileCache(userId, data);
    } catch (e) {
      setError(getErrorMessage(e, "No se pudo cargar el perfil"));
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

  const showRestricted =
    blocked ||
    restrictionLevel !== "none" ||
    restricted ||
    Boolean(profile?.restrictedToFollowers && !following);
  const profileUnavailable = Boolean(profile?.profileUnavailable) || restrictionLevel === "unavailable";

  const handleToggleFollow = useCallback(async () => {
    if (!userId || userId === currentUserId) return;
    setFollowBusy(true);
    setError(null);
    try {
      const res = await toggleFollow(userId);
      setFollowing(res.following);
      setFollowPending(Boolean(res.pending));
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
