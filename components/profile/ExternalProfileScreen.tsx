import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getFollowing, toggleBlockUser } from "../../api/auth";
import { getStories } from "../../api/stories";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { PublicProfileTab } from "../../constants/publicProfileTabs";
import { useAuth } from "../../context/AuthContext";
import { useGoiAlert } from "../../context/GoiAlertContext";
import { usePublicProfile } from "../../hooks/usePublicProfile";
import type { FeedStoryAuthor } from "../../types/story";
import { blockUser } from "../../utils/profileBlocks";
import { computeProfileBadges } from "../../utils/profileBadges";
import { computeProfileStatsFromSessions } from "../../utils/profileStatsFromSessions";
import { formatMemberSince } from "../../utils/profileMemberSince";
import { buildProfileActivityLine } from "../../utils/profileRecentActivity";
import { shareProfile } from "../../utils/shareProfile";
import { hasUnseenStories, loadStorySeenMap } from "../../utils/storySeen";
import { StoryViewerModal } from "../stories/StoryViewerModal";
import { ExternalProfileSkeleton } from "./ExternalProfileSkeleton";
import { socialListHref } from "../../constants/socialListRoutes";
import { ProfileMutualFollowersRow } from "./ProfileMutualFollowersRow";
import { ProfilePublicInfo } from "./ProfilePublicInfo";
import { ProfilePublicSessionsSection } from "./ProfilePublicSessionsSection";
import { ProfileRestrictedCTA } from "./ProfileRestrictedCTA";
import { ProfileSectionRestrictedHint } from "./ProfileSectionRestrictedHint";
import { ProfileSectionSurface } from "./ProfileSectionSurface";
import { ProfileStoriesHighlights } from "./ProfileStoriesHighlights";
import { PublicProfileHero } from "./PublicProfileHero";
import { PublicProfilePostsSection } from "./PublicProfilePostsSection";
import { PublicProfileStickyHeader } from "./PublicProfileStickyHeader";
import { PublicProfileTabBar } from "./PublicProfileTabBar";

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
  const [profileTab, setProfileTab] = useState<PublicProfileTab>("posts");
  const [stickyVisible, setStickyVisible] = useState(false);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyAuthor, setStoryAuthor] = useState<FeedStoryAuthor | null>(null);
  const [dailyAuthor, setDailyAuthor] = useState<FeedStoryAuthor | null>(null);
  const [unseenDaily, setUnseenDaily] = useState(false);

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

  const sessionStats = useMemo(() => {
    const routinesCount = Object.keys(profile.workoutTitles).length;
    return computeProfileStatsFromSessions(profile.sessions, profile.workoutTitles, routinesCount);
  }, [profile.sessions, profile.workoutTitles]);

  const socialStats = useMemo(
    () => ({
      postsCount: profile.postsTotal,
      followersCount: profile.sectionAccess.socialLists ? profile.followerCount : null,
      followingCount: profile.sectionAccess.socialLists ? profile.followingCount : null,
      loading: profile.loading && profile.followerCount === null,
    }),
    [
      profile.postsTotal,
      profile.followerCount,
      profile.followingCount,
      profile.loading,
      profile.sectionAccess.socialLists,
    ]
  );

  const profileBadges = useMemo(
    () =>
      profile.sectionAccess.stats
        ? computeProfileBadges({
            sessionsThisWeek: sessionStats.sessionsThisWeek,
            totalSessions: sessionStats.totalSessions,
            routinesCount: sessionStats.routinesCount,
            postsCount: profile.postsTotal ?? 0,
          })
        : [],
    [sessionStats, profile.postsTotal, profile.sectionAccess.stats]
  );

  const memberSinceLabel = formatMemberSince(profile.profile?.createdAt);

  const activityLine = useMemo(
    () =>
      buildProfileActivityLine(
        profile.orderedPosts[0]?.createdAt,
        sessionStats.lastSession?.performedAt
      ),
    [profile.orderedPosts, sessionStats.lastSession?.performedAt]
  );

  const postWorkoutLabels = useMemo(() => {
    const map: Record<string, string> = {};
    for (const p of profile.orderedPosts) {
      if (p.workoutId && profile.workoutTitles[p.workoutId]) {
        map[p.id] = profile.workoutTitles[p.workoutId];
      }
    }
    return map;
  }, [profile.orderedPosts, profile.workoutTitles]);

  const storyViewerAuthors = useMemo(
    () => (storyAuthor && storyAuthor.slides.length > 0 ? [storyAuthor] : []),
    [storyAuthor]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await profile.load();
    } finally {
      setRefreshing(false);
    }
  }, [profile]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setStickyVisible(e.nativeEvent.contentOffset.y > 220);
  }, []);

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
      if (kind === "posts") {
        setProfileTab("posts");
        return;
      }
      if (!profile.sectionAccess.socialLists) {
        showAlert({
          title: "Lista no disponible",
          message: "Este usuario ha restringido quién puede ver sus seguidores y seguidos.",
          buttons: [{ text: "Entendido", style: "default" }],
        });
        return;
      }
      router.push(socialListHref(userId, kind, profile.profile?.username));
    },
    [profile.sectionAccess.socialLists, profile.profile?.username, router, showAlert, userId]
  );

  const handleMoreMenu = useCallback(() => {
    const username = profile.profile?.username?.trim() || "usuario";
    showAlert({
      title: `@${username}`,
      message: "Opciones de perfil",
      buttons: [
        {
          text: "Bloquear usuario",
          style: "destructive",
          onPress: () => {
            void (async () => {
              await toggleBlockUser(userId);
              await blockUser(userId);
              showAlert({
                title: "Usuario bloqueado",
                message: "No verás su contenido en el feed.",
                buttons: [{ text: "Entendido", style: "default" }],
              });
              router.back();
            })();
          },
        },
        {
          text: "Reportar perfil",
          onPress: () => {
            showAlert({
              title: "Reporte registrado",
              message: "Gracias. Revisaremos este perfil.",
              buttons: [{ text: "Entendido", style: "default" }],
            });
          },
        },
        { text: "Cancelar", style: "cancel" },
      ],
    });
  }, [profile.profile?.username, userId, showAlert, router]);

  if (user?.id === userId) {
    router.replace("/(tabs)/perfil");
    return null;
  }

  if (!followingIdsReady || (profile.loading && !profile.profile)) {
    return (
      <View style={{ paddingTop: insets.top, flex: 1, backgroundColor: AUTH.bg }}>
        <ExternalProfileSkeleton />
      </View>
    );
  }

  const username = profile.profile?.username?.trim() ?? "";

  return (
    <View style={styles.root}>
      <PublicProfileStickyHeader
        visible={stickyVisible}
        username={username}
        avatarUrl={profile.profile?.avatarUrl}
        following={profile.following}
        followBusy={profile.followBusy}
        onBack={() => router.back()}
        onToggleFollow={() => void profile.handleToggleFollow()}
      />

      <ScrollView
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
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
          followsYou={profile.followsYou}
          memberSinceLabel={memberSinceLabel}
          activityLine={activityLine}
          unseenDaily={unseenDaily}
          onBack={() => router.back()}
          onToggleFollow={() => void profile.handleToggleFollow()}
          onShare={handleShareProfile}
          onMore={handleMoreMenu}
          onAvatarPress={dailyAuthor?.slides.length ? handleAvatarDaily : undefined}
          socialStats={socialStats}
          onSocialStatPress={handleSocialStatPress}
        />

        {profile.mutualFollowers.length > 0 && profile.showRestricted ? (
          <View style={styles.mutualsWrap}>
            <ProfileMutualFollowersRow mutuals={profile.mutualFollowers} />
          </View>
        ) : null}

        {profile.showRestricted ? (
          <ProfileRestrictedCTA
            username={username}
            following={profile.following}
            followPending={profile.followPending}
            followBusy={profile.followBusy}
            postCountTotal={profile.postCountTotal}
            previewPosts={profile.previewPosts}
            unavailable={profile.profileUnavailable}
            onFollow={() => void profile.handleToggleFollow()}
          />
        ) : (
          <>
            {profile.sectionAccess.bio ? (
              <ProfileSectionSurface>
                <ProfilePublicInfo
                  bio={profile.profile?.bio}
                  goal={profile.profile?.goal}
                  location={profile.profile?.location}
                  websiteUrl={profile.profile?.websiteUrl}
                  instagramUrl={profile.profile?.instagramUrl}
                  stravaUrl={profile.profile?.stravaUrl}
                  restricted={false}
                  badges={profileBadges}
                />
              </ProfileSectionSurface>
            ) : (
              <ProfileSectionRestrictedHint
                title="Información restringida"
                body="Bio y enlaces visibles solo para quien el propietario autoriza."
              />
            )}

            <ProfileStoriesHighlights
              userId={userId}
              username={username}
              avatarUrl={profile.profile?.avatarUrl}
              isSelf={false}
              onViewStory={handleViewStory}
            />

            <PublicProfileTabBar active={profileTab} onChange={setProfileTab} />

            {profileTab === "posts" ? (
              <PublicProfilePostsSection
                posts={profile.orderedPosts}
                postsTotal={profile.postsTotal}
                pinnedPostId={profile.profile?.pinnedPostId}
                loading={profile.loading}
                loadingMore={profile.postsLoadingMore}
                showRestricted={false}
                postsHiddenByVisibility={profile.postsHiddenByVisibility}
                hasMore={Boolean(profile.postsNextCursor)}
                onLoadMore={() => void profile.loadMorePosts()}
                workoutLabelByPostId={postWorkoutLabels}
              />
            ) : profile.sectionAccess.sessions ? (
              <ProfilePublicSessionsSection sessions={profile.sessions} loading={profile.loading} />
            ) : (
              <ProfileSectionRestrictedHint
                title="Sesiones privadas"
                body="Las sesiones de entrenamiento solo están disponibles para seguidores autorizados."
              />
            )}
          </>
        )}
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
  mutualsWrap: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
});
