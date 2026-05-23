import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFollowers, getFollowing } from "../../api/auth";
import { getStories } from "../../api/stories";
import { getWorkouts } from "../../api/workouts";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { useProfileStats } from "../../hooks/useProfileStats";
import { usePublicProfile } from "../../hooks/usePublicProfile";
import type { FeedStoryAuthor } from "../../types/story";
import { computeProfileBadges } from "../../utils/profileBadges";
import { formatMemberSince } from "../../utils/profileMemberSince";
import { buildProfileActivityLine } from "../../utils/profileRecentActivity";
import { shareProfile } from "../../utils/shareProfile";
import { hasUnseenStories, loadStorySeenMap } from "../../utils/storySeen";
import { StoryViewerModal } from "../stories/StoryViewerModal";
import { ProfilePublicInfo } from "./ProfilePublicInfo";
import { ProfilePublicWorkoutSummary } from "./ProfilePublicWorkoutSummary";
import { ProfileSectionSurface } from "./ProfileSectionSurface";
import { ProfileStoriesHighlights } from "./ProfileStoriesHighlights";
import { PublicProfileHero } from "./PublicProfileHero";
import { PublicProfilePostsSection } from "./PublicProfilePostsSection";

type ExternalProfileScreenProps = {
  userId: string;
};

export function ExternalProfileScreen({ userId }: ExternalProfileScreenProps) {
  const router = useRouter();
  const { showAlert } = useGoiAlert();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [followingIdsReady, setFollowingIdsReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyAuthor, setStoryAuthor] = useState<FeedStoryAuthor | null>(null);
  const [dailyAuthor, setDailyAuthor] = useState<FeedStoryAuthor | null>(null);
  const [unseenDaily, setUnseenDaily] = useState(false);
  const [targetFollowerIds, setTargetFollowerIds] = useState<string[]>([]);
  const [workoutTitles, setWorkoutTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    setFollowingIdsReady(false);
    if (!user?.id) {
      setFollowingIds([]);
      setFollowingIdsReady(true);
      return;
    }
    void getFollowing(user.id)
      .then((res) => {
        if (!cancelled) setFollowingIds(res.followingIds ?? []);
      })
      .catch(() => {
        if (!cancelled) setFollowingIds([]);
      })
      .finally(() => {
        if (!cancelled) setFollowingIdsReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    let cancelled = false;
    void getFollowers(userId)
      .then((res) => {
        if (!cancelled) setTargetFollowerIds(res.followerIds ?? []);
      })
      .catch(() => {
        if (!cancelled) setTargetFollowerIds([]);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const [data, seen] = await Promise.all([getStories(), loadStorySeenMap()]);
        const row = data.authors?.find((a) => a.userId === userId);
        if (cancelled) return;
        setDailyAuthor(row ?? null);
        setUnseenDaily(
          Boolean(row?.slides.length && hasUnseenStories(userId, row.slides, seen[userId]))
        );
      } catch {
        if (!cancelled) {
          setDailyAuthor(null);
          setUnseenDaily(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    void getWorkouts()
      .then((all) => {
        if (cancelled) return;
        const map: Record<string, string> = {};
        for (const w of all) {
          if (w.userId === userId) map[w.id] = w.title;
        }
        setWorkoutTitles(map);
      })
      .catch(() => {
        if (!cancelled) setWorkoutTitles({});
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const profile = usePublicProfile({
    userId: followingIdsReady ? userId : null,
    currentUserId: user?.id,
    initialFollowingIds: followingIds,
    onFollowingChanged: (targetId, isFollowing) => {
      setFollowingIds((prev) => {
        if (isFollowing) return prev.includes(targetId) ? prev : [...prev, targetId];
        return prev.filter((id) => id !== targetId);
      });
    },
  });

  const stats = useProfileStats(userId);

  const socialStats = useMemo(
    () => ({
      postsCount: profile.postsTotal,
      followersCount: profile.followerCount,
      followingCount: profile.followingCount,
      loading:
        (profile.loading && profile.followerCount === null) ||
        (stats.loading && stats.followersCount === null),
    }),
    [
      profile.postsTotal,
      profile.followerCount,
      profile.followingCount,
      profile.loading,
      stats.loading,
      stats.followersCount,
    ]
  );

  const workoutStats = useMemo(
    () => ({
      totalSessions: stats.totalSessions,
      sessionsThisWeek: stats.sessionsThisWeek,
      routinesCount: stats.routinesCount,
      loading: stats.loading && stats.totalSessions === null,
    }),
    [stats.totalSessions, stats.sessionsThisWeek, stats.routinesCount, stats.loading]
  );

  const profileBadges = useMemo(
    () =>
      computeProfileBadges({
        sessionsThisWeek: stats.sessionsThisWeek ?? 0,
        totalSessions: stats.totalSessions ?? 0,
        routinesCount: stats.routinesCount ?? 0,
        postsCount: profile.postsTotal ?? 0,
      }),
    [stats.sessionsThisWeek, stats.totalSessions, stats.routinesCount, profile.postsTotal]
  );

  const storyViewerAuthors = useMemo(
    () => (storyAuthor && storyAuthor.slides.length > 0 ? [storyAuthor] : []),
    [storyAuthor]
  );

  const followsYou = Boolean(user?.id && targetFollowerIds.includes(user.id));

  const mutualCount = useMemo(() => {
    if (!user?.id) return 0;
    const theirs = new Set(targetFollowerIds);
    return followingIds.filter((id) => id !== userId && theirs.has(id)).length;
  }, [followingIds, targetFollowerIds, user?.id, userId]);

  const memberSinceLabel = formatMemberSince(profile.profile?.createdAt);

  const activityLine = useMemo(
    () =>
      buildProfileActivityLine(
        profile.orderedPosts[0]?.createdAt,
        stats.lastSession?.performedAt
      ),
    [profile.orderedPosts, stats.lastSession?.performedAt]
  );

  const postWorkoutLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of profile.orderedPosts) {
      if (p.workoutId && workoutTitles[p.workoutId]) map[p.id] = workoutTitles[p.workoutId];
    }
    return map;
  }, [profile.orderedPosts, workoutTitles]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([profile.load(), stats.refresh()]);
    } finally {
      setRefreshing(false);
    }
  }, [profile, stats]);

  const handleViewStory = useCallback((author: FeedStoryAuthor) => {
    setStoryAuthor(author);
    setStoryViewerOpen(true);
  }, []);

  const handleAvatarDaily = useCallback(() => {
    if (dailyAuthor?.slides.length) handleViewStory(dailyAuthor);
  }, [dailyAuthor, handleViewStory]);

  const handleShareProfile = useCallback(() => {
    const username = profile.profile?.username?.trim();
    if (!username) return;
    void shareProfile(username, userId);
  }, [profile.profile?.username, userId]);

  const handleSocialStatPress = useCallback(
    (kind: "posts" | "followers" | "following") => {
      const label = kind === "posts" ? "publicaciones" : kind === "followers" ? "seguidores" : "siguiendo";
      showAlert({
        title: "Próximamente",
        message: `La lista de ${label} estará disponible en una próxima actualización.`,
        buttons: [{ text: "Entendido", style: "default" }],
      });
    },
    [showAlert]
  );

  if (user?.id === userId) {
    router.replace("/(tabs)/perfil");
    return null;
  }

  if (!followingIdsReady || (profile.loading && !profile.profile)) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator color={AUTH.gold} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void onRefresh()} tintColor={AUTH.gold} />
        }
      >
        {profile.error ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {profile.error}
            </Text>
            <Pressable onPress={() => void profile.load()} style={styles.retryBtn}>
              <Text style={styles.retryText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Reintentar
              </Text>
            </Pressable>
          </View>
        ) : null}

        <PublicProfileHero
          profile={profile.profile}
          loading={profile.loading}
          restricted={profile.showRestricted}
          following={profile.following}
          followBusy={profile.followBusy}
          followsYou={followsYou}
          mutualCount={mutualCount}
          memberSinceLabel={memberSinceLabel}
          unseenDaily={unseenDaily}
          onBack={() => router.back()}
          onToggleFollow={() => void profile.handleToggleFollow()}
          onShare={handleShareProfile}
          onAvatarPress={dailyAuthor?.slides.length ? handleAvatarDaily : undefined}
          socialStats={socialStats}
          onSocialStatPress={handleSocialStatPress}
        />

        <ProfileSectionSurface>
          <ProfilePublicInfo
            bio={profile.profile?.bio}
            goal={profile.profile?.goal}
            location={profile.profile?.location}
            websiteUrl={profile.profile?.websiteUrl}
            instagramUrl={profile.profile?.instagramUrl}
            stravaUrl={profile.profile?.stravaUrl}
            restricted={profile.showRestricted}
            restrictedMessage="Perfil limitado hasta que sigas a esta cuenta."
            badges={profile.showRestricted ? [] : profileBadges}
            workoutStats={profile.showRestricted ? undefined : workoutStats}
            activityLine={profile.showRestricted ? null : activityLine}
            workoutSummary={
              profile.showRestricted ? null : (
                <ProfilePublicWorkoutSummary
                  loading={stats.loading && stats.totalSessions === null}
                  lastSession={stats.lastSession}
                  recentRoutineTitles={stats.recentRoutineTitles}
                  streakWeeks={stats.streakWeeks}
                  sparklineCounts={stats.sparklineCounts}
                />
              )
            }
          />
        </ProfileSectionSurface>

        {!profile.showRestricted ? (
          <>
            <ProfileStoriesHighlights
              userId={userId}
              username={profile.profile?.username ?? ""}
              avatarUrl={profile.profile?.avatarUrl}
              isSelf={false}
              onViewStory={handleViewStory}
            />
            <PublicProfilePostsSection
              posts={profile.orderedPosts}
              postsTotal={profile.postsTotal}
              pinnedPostId={profile.profile?.pinnedPostId}
              loading={profile.loading}
              loadingMore={profile.postsLoadingMore}
              showRestricted={profile.showRestricted}
              hasMore={Boolean(profile.postsNextCursor)}
              onLoadMore={() => void profile.loadMorePosts()}
              workoutLabelByPostId={postWorkoutLabels}
            />
          </>
        ) : null}
      </ScrollView>

      <StoryViewerModal
        visible={storyViewerOpen}
        authors={storyViewerAuthors}
        startAuthorIdx={0}
        startSlideIdx={0}
        onClose={() => setStoryViewerOpen(false)}
        onStoriesUiRefresh={() => {}}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: AUTH.bg,
    alignItems: "center",
    justifyContent: "center",
  },
  errorWrap: {
    padding: 16,
    alignItems: "center",
    gap: 8,
  },
  errorText: {
    color: AUTH.danger,
    fontSize: 14,
    textAlign: "center",
  },
  retryBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  retryText: {
    color: AUTH.gold,
    fontWeight: "600",
  },
});
