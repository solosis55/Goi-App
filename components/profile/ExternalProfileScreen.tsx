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
import { getFollowing } from "../../api/auth";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import { useProfileStats } from "../../hooks/useProfileStats";
import { usePublicProfile } from "../../hooks/usePublicProfile";
import type { FeedStoryAuthor } from "../../types/story";
import { StoryViewerModal } from "../stories/StoryViewerModal";
import { ProfileStatsRow } from "./ProfileStatsRow";
import { ProfileStoriesHighlights } from "./ProfileStoriesHighlights";
import { PublicProfileHero } from "./PublicProfileHero";
import { PublicProfilePostsSection } from "./PublicProfilePostsSection";

type ExternalProfileScreenProps = {
  userId: string;
};

export function ExternalProfileScreen({ userId }: ExternalProfileScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [followingIdsReady, setFollowingIdsReady] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [storyViewerOpen, setStoryViewerOpen] = useState(false);
  const [storyAuthor, setStoryAuthor] = useState<FeedStoryAuthor | null>(null);

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

  const storyViewerAuthors = useMemo(
    () => (storyAuthor && storyAuthor.slides.length > 0 ? [storyAuthor] : []),
    [storyAuthor]
  );

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
          onBack={() => router.back()}
          onToggleFollow={() => void profile.handleToggleFollow()}
        />

        {!profile.showRestricted ? (
          <ProfileStoriesHighlights
            userId={userId}
            username={profile.profile?.username ?? ""}
            avatarUrl={profile.profile?.avatarUrl}
            isSelf={false}
            onViewStory={handleViewStory}
          />
        ) : null}

        <ProfileStatsRow
          postsCount={profile.postsTotal}
          followersCount={profile.followerCount}
          followingCount={profile.followingCount}
          routinesCount={stats.routinesCount}
          loading={
            (profile.loading && profile.followerCount === null) ||
            (stats.loading && stats.followersCount === null)
          }
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
        />
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
