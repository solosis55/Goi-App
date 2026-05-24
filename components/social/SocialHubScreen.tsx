import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
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
import { getDiscover, getFollowing, getPendingFollowRequests } from "../../api/auth";
import { getProfileSocialPage } from "../../api/publicProfile";
import { AppScreenShell } from "../AppScreenShell";
import { FeedSuggestionsRow } from "../feed/FeedSuggestionsRow";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import { useSocialHub } from "../../context/SocialHubContext";
import type { DiscoverUser } from "../../types/auth";
import type { FollowRequestPreview } from "../../types/publicProfile";
import { ProfileSectionSurface } from "../profile/ProfileSectionSurface";
import { FollowRequestsList } from "./FollowRequestsList";
import { SocialNetworkRow } from "./SocialNetworkRow";

type SocialHubScreenProps = {
  showBack?: boolean;
  title?: string;
};

export function SocialHubScreen({ showBack = false, title = "Social" }: SocialHubScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { refreshBadge } = useSocialHub();

  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const [followingIds, setFollowingIds] = useState<string[]>([]);
  const [followRequests, setFollowRequests] = useState<FollowRequestPreview[]>([]);
  const [followersTotal, setFollowersTotal] = useState(0);
  const [followingTotal, setFollowingTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      const [discover, following, requests, followersPage, followingPage] = await Promise.all([
        getDiscover(48),
        getFollowing(user.id),
        getPendingFollowRequests(),
        getProfileSocialPage(user.id, "followers", { limit: 1 }),
        getProfileSocialPage(user.id, "following", { limit: 1 }),
      ]);
      setDiscoverUsers(discover.users ?? []);
      setFollowingIds(following.followingIds ?? []);
      setFollowRequests(requests.requests ?? []);
      setFollowersTotal(followersPage.total ?? 0);
      setFollowingTotal(followingPage.total ?? 0);
    } catch {
      setDiscoverUsers([]);
      setFollowRequests([]);
    }
  }, [user?.id]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([load(), refreshBadge()]);
    setRefreshing(false);
  }, [load, refreshBadge]);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void Promise.all([load(), refreshBadge()]).finally(() => setLoading(false));
    }, [load, refreshBadge])
  );

  const reloadRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      const res = await getPendingFollowRequests();
      setFollowRequests(res.requests ?? []);
      await refreshBadge();
    } catch {
      setFollowRequests([]);
    } finally {
      setRequestsLoading(false);
    }
  }, [refreshBadge]);

  return (
    <AppScreenShell variant="feed">
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) }]}>
        {showBack ? (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            style={({ pressed }) => [styles.sideBtn, pressed ? styles.pressed : null]}
          >
            <Text style={styles.backText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              ←
            </Text>
          </Pressable>
        ) : (
          <View style={styles.sideBtn} />
        )}
        <Text style={styles.screenTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {title}
        </Text>
        <View style={styles.sideBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={AUTH.gold} />
        }
      >
        {loading && discoverUsers.length === 0 ? (
          <ActivityIndicator color={AUTH.gold} style={styles.pageLoader} />
        ) : null}

        {followRequests.length > 0 || requestsLoading ? (
          <ProfileSectionSurface flush goldLine>
            <View style={styles.sectionPad}>
              <Text style={styles.sectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Solicitudes
                {followRequests.length > 0 ? ` (${followRequests.length})` : ""}
              </Text>
              <FollowRequestsList
                requests={followRequests}
                loading={requestsLoading}
                onChanged={() => void reloadRequests()}
              />
            </View>
          </ProfileSectionSurface>
        ) : null}

        <ProfileSectionSurface flush goldLine>
          <View style={styles.sectionPad}>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Tu red
            </Text>
            <SocialNetworkRow
              userId={user?.id ?? ""}
              username={user?.username}
              followersTotal={followersTotal}
              followingTotal={followingTotal}
            />
          </View>
        </ProfileSectionSurface>

        <ProfileSectionSurface flush goldLine>
          <View style={styles.sectionPad}>
            <Text style={styles.sectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Descubrir atletas
            </Text>
            <Text style={styles.sectionSubtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Gente que podría encajar contigo
            </Text>
            <FeedSuggestionsRow
              users={discoverUsers}
              followingIds={followingIds}
              currentUserId={user?.id}
              variant="list"
              onFollowingChanged={(targetId, following) => {
                setFollowingIds((prev) =>
                  following
                    ? prev.includes(targetId)
                      ? prev
                      : [...prev, targetId]
                    : prev.filter((id) => id !== targetId)
                );
                if (following) setFollowingTotal((n) => n + 1);
                else setFollowingTotal((n) => Math.max(0, n - 1));
              }}
            />
          </View>
        </ProfileSectionSurface>
      </ScrollView>
    </AppScreenShell>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  sideBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  backText: {
    color: AUTH.neutral100,
    fontSize: 22,
  },
  screenTitle: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "700",
  },
  scroll: {
    paddingBottom: 32,
    gap: 0,
  },
  pageLoader: {
    marginTop: 24,
  },
  sectionPad: {
    padding: 14,
  },
  sectionTitle: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: AUTH.muted,
    fontSize: 12,
    marginBottom: 10,
  },
  pressed: {
    opacity: 0.88,
  },
});
