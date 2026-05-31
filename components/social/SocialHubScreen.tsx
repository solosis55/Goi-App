import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppScreenShell } from "../AppScreenShell";
import { FeedSuggestionsRow } from "../feed/FeedSuggestionsRow";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import { useSocialHub } from "../../context/SocialHubContext";
import type { DiscoverUser } from "../../types/auth";
import type { DiscoverFacetFilter } from "../../utils/socialDiscoverFilters";
import { groupDiscoverUsers } from "../../utils/socialDiscoverGroups";
import { invalidateSocialHubCache } from "../../utils/socialHubCache";
import { socialPreviewToDiscover } from "../../utils/socialUserMappers";
import { ProfileSectionSurface } from "../profile/ProfileSectionSurface";
import { FollowRequestsList } from "./FollowRequestsList";
import { SentFollowRequestsList } from "./SentFollowRequestsList";
import { SocialFollowingPreview } from "./SocialFollowingPreview";
import { SocialHubEmptyState } from "./SocialHubEmptyState";
import { SocialFeedSuggestionsRestore } from "./SocialFeedSuggestionsRestore";
import { SocialMutedUsersSection } from "./SocialMutedUsersSection";
import { SocialBlockedList } from "./SocialBlockedList";
import { SocialCompactUserList } from "./SocialCompactUserList";
import { SocialNetworkRow } from "./SocialNetworkRow";
import { SocialHubSkeleton } from "./SocialHubSkeleton";
import { SocialCollapsibleSection } from "./SocialCollapsibleSection";
import { SocialWeeklyChallengeCard } from "./SocialWeeklyChallengeCard";
import { SocialTrainsTodayStrip } from "./SocialTrainsTodayStrip";
import { SocialSectionEmpty } from "./SocialSectionEmpty";

const HUB_SUGGESTIONS_PREVIEW = 6;
const HUB_REQUESTS_PREVIEW = 3;

type SocialHubScreenProps = {
  showBack?: boolean;
  title?: string;
  embedded?: boolean;
  onOpenSearch?: (facet?: DiscoverFacetFilter) => void;
  onOpenActivity?: () => void;
};

export function SocialHubScreen({
  showBack = false,
  title = "Social",
  embedded = false,
  onOpenSearch,
  onOpenActivity,
}: SocialHubScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const {
    hub,
    hubLoading,
    followingIds,
    refreshBadge,
    refreshHub,
    invalidateHub,
    applyFollowingChange,
  } = useSocialHub();

  const [refreshing, setRefreshing] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const discoverUsers = hub?.discoverUsers ?? [];
  const followRequests = hub?.followRequests ?? [];
  const sentRequests = hub?.sentRequests ?? [];
  const followingPreviews = hub?.followingPreviews ?? [];
  const followersTotal = hub?.followersTotal ?? 0;
  const followingTotal = hub?.followingTotal ?? 0;
  const blockedIds = hub?.blockedIds ?? [];
  const mySessionsWeek = hub?.weekly?.mySessionsWeek ?? 0;
  const followingActiveWeek = hub?.weekly?.followingActiveWeek ?? 0;
  const followBackUsers = useMemo(
    () => (hub?.followBackPreviews ?? []).map(socialPreviewToDiscover),
    [hub?.followBackPreviews]
  );
  const followRequestsPreview = useMemo(
    () => followRequests.slice(0, HUB_REQUESTS_PREVIEW),
    [followRequests]
  );
  const hasMoreRequests = followRequests.length > HUB_REQUESTS_PREVIEW;
  const loading = hubLoading && !hub;
  const followingPreviewLoading = hubLoading && !hub;

  const refresh = useCallback(async () => {
    setRefreshing(true);
    invalidateHub();
    await Promise.all([refreshHub(), refreshBadge()]);
    setRefreshing(false);
  }, [invalidateHub, refreshHub, refreshBadge]);

  const reloadRequests = useCallback(async () => {
    setRequestsLoading(true);
    try {
      await Promise.all([refreshHub({ silent: true }), refreshBadge()]);
    } finally {
      setRequestsLoading(false);
    }
  }, [refreshHub, refreshBadge]);

  const handleRequestsChanged = useCallback(() => {
    void reloadRequests();
  }, [reloadRequests]);

  const handleBlockedListChanged = useCallback(() => {
    void refreshHub();
  }, [refreshHub]);

  const suggestionTeaser = useMemo(() => {
    const seen = new Set<string>();
    const out: DiscoverUser[] = [];
    const groups = groupDiscoverUsers(discoverUsers, user?.id, followingIds);
    for (const u of [...groups.mutuals, ...groups.activeThisWeek, ...groups.rest]) {
      if (!u.id || seen.has(u.id)) continue;
      seen.add(u.id);
      out.push(u);
      if (out.length >= HUB_SUGGESTIONS_PREVIEW) break;
    }
    return out;
  }, [discoverUsers, user?.id, followingIds]);

  const showEmptyHub = useMemo(
    () =>
      !loading &&
      followRequests.length === 0 &&
      followingTotal === 0 &&
      suggestionTeaser.length === 0,
    [loading, followRequests.length, followingTotal, suggestionTeaser.length]
  );

  const onFollowingChanged = useCallback(
    (targetId: string, following: boolean) => {
      applyFollowingChange(targetId, following);
      if (following) void refreshHub({ silent: true });
    },
    [applyFollowingChange, refreshHub]
  );

  const openDiscoverAll = useCallback(
    (facet: DiscoverFacetFilter = "all") => {
      onOpenSearch?.(facet);
    },
    [onOpenSearch]
  );

  const body = (
    <>
      {embedded ? null : (
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
      )}

      <ScrollView
        style={embedded ? styles.scrollFlex : undefined}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={AUTH.gold} />
        }
      >
        {loading && !hub ? <SocialHubSkeleton /> : null}

        {!loading && !hub ? (
          <ProfileSectionSurface flush goldLine>
            <View style={styles.sectionPad}>
              <SocialSectionEmpty
                title="No se pudo cargar Social"
                body="Comprueba la conexión y que el servidor esté en marcha."
                actionLabel="Reintentar"
                onAction={() => void refresh()}
              />
            </View>
          </ProfileSectionSurface>
        ) : null}

        {showEmptyHub && hub ? (
          <ProfileSectionSurface flush goldLine>
            <SocialHubEmptyState onExploreDiscover={() => openDiscoverAll("all")} />
          </ProfileSectionSurface>
        ) : null}

        {hub ? (
          <>
            {followRequests.length > 0 || requestsLoading ? (
              <ProfileSectionSurface flush goldLine>
                <View style={styles.sectionPad}>
                  <Text style={styles.blockTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    Solicitudes de seguimiento
                    {followRequests.length > 0 ? ` (${followRequests.length})` : ""}
                  </Text>
                  <FollowRequestsList
                    requests={followRequestsPreview}
                    loading={requestsLoading}
                    onChanged={handleRequestsChanged}
                  />
                  {hasMoreRequests && onOpenActivity ? (
                    <Pressable
                      onPress={onOpenActivity}
                      style={({ pressed }) => [styles.seeAllRow, pressed ? styles.pressed : null]}
                      accessibilityRole="button"
                      accessibilityLabel="Ver todas las solicitudes en Actividad"
                    >
                      <Text style={styles.seeAllText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                        Ver todas en Actividad ({followRequests.length}) →
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </ProfileSectionSurface>
            ) : null}

            {!showEmptyHub ? (
              <ProfileSectionSurface flush goldLine>
                <View style={styles.sectionPad}>
                  <SocialWeeklyChallengeCard
                    followingActiveCount={followingActiveWeek}
                    followingTotal={followingTotal}
                    mySessionsWeek={mySessionsWeek}
                    onPressTrain={() => router.push("/(tabs)/entrenamientos")}
                    onPressSeeActive={() => openDiscoverAll("trained")}
                  />

                  <SocialNetworkRow
                    userId={user?.id ?? ""}
                    username={user?.username}
                    followersTotal={followersTotal}
                    followingTotal={followingTotal}
                  />

                  <View style={styles.subsection}>
                    <Text style={styles.subsectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      Tu red esta semana
                    </Text>
                    <SocialTrainsTodayStrip discoverUsers={discoverUsers} followingIds={followingIds} />
                  </View>

                  <View style={styles.subsection}>
                    <Text style={styles.subsectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      Quién sigues
                    </Text>
                    {followingTotal === 0 && !followingPreviewLoading ? (
                      <SocialSectionEmpty
                        title="Aún no sigues a nadie"
                        body="Encuentra atletas en la pestaña Buscar."
                        actionLabel="Buscar atletas"
                        onAction={() => openDiscoverAll("all")}
                      />
                    ) : (
                      <SocialFollowingPreview
                        userId={user?.id ?? ""}
                        username={user?.username}
                        followingTotal={followingTotal}
                        previews={followingPreviews}
                        loading={followingPreviewLoading}
                      />
                    )}
                  </View>

                  {followBackUsers.length > 0 ? (
                    <View style={styles.subsection}>
                      <Text style={styles.subsectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                        Te siguen — devuélveles el follow
                      </Text>
                      <SocialCompactUserList
                        users={followBackUsers}
                        followingIds={followingIds}
                        currentUserId={user?.id}
                        onFollowingChanged={onFollowingChanged}
                        emptyTitle=""
                        emptyBody=""
                      />
                    </View>
                  ) : null}
                </View>
              </ProfileSectionSurface>
            ) : null}

            {suggestionTeaser.length > 0 ? (
              <ProfileSectionSurface flush goldLine>
                <View style={styles.sectionPad}>
                  <Pressable
                    onPress={() => openDiscoverAll("all")}
                    style={({ pressed }) => [styles.seeAllRow, pressed ? styles.pressed : null]}
                    accessibilityRole="button"
                    accessibilityLabel="Ver todas las sugerencias en Buscar"
                  >
                    <Text style={styles.blockTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      Sugerencias para ti
                    </Text>
                    <Text style={styles.seeAllText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                      Ver todos en Buscar →
                    </Text>
                  </Pressable>
                  <FeedSuggestionsRow
                    users={suggestionTeaser}
                    followingIds={followingIds}
                    currentUserId={user?.id}
                    variant="list"
                    embedded
                    onFollowingChanged={onFollowingChanged}
                  />
                </View>
              </ProfileSectionSurface>
            ) : null}

            <SocialCollapsibleSection
              id="ajustes"
              title="Ajustes"
              subtitle="Preferencias y cuentas"
              defaultCollapsed
            >
              <SocialFeedSuggestionsRestore />
              <View style={styles.subsection}>
                <Text style={styles.subsectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Silenciados en el feed
                </Text>
                <SocialMutedUsersSection />
              </View>
              {sentRequests.length > 0 ? (
                <View style={styles.subsection}>
                  <Text style={styles.subsectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    Solicitudes enviadas ({sentRequests.length})
                  </Text>
                  <SentFollowRequestsList
                    requests={sentRequests}
                    loading={requestsLoading}
                    onChanged={handleRequestsChanged}
                  />
                </View>
              ) : null}
              {blockedIds.length > 0 ? (
                <View style={styles.subsection}>
                  <Text style={styles.subsectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    Cuentas bloqueadas
                  </Text>
                  <SocialBlockedList onChanged={handleBlockedListChanged} />
                </View>
              ) : null}
            </SocialCollapsibleSection>
          </>
        ) : null}
      </ScrollView>
    </>
  );

  if (embedded) {
    return <View style={styles.embeddedRoot}>{body}</View>;
  }

  return <AppScreenShell variant="feed">{body}</AppScreenShell>;
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
  embeddedRoot: {
    flex: 1,
    minHeight: 0,
  },
  scrollFlex: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
    paddingHorizontal: 12,
    gap: 12,
  },
  sectionPad: {
    padding: 14,
    gap: 14,
  },
  blockTitle: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "700",
  },
  subsection: {
    gap: 8,
  },
  subsectionTitle: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  seeAllRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  seeAllText: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
