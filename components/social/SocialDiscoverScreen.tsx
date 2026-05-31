import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getDiscover, searchUsers } from "../../api/auth";
import { AppScreenShell } from "../AppScreenShell";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import {
  loadDiscoverRecentSearches,
  pushDiscoverRecentSearch,
  clearDiscoverRecentSearches,
} from "../../utils/discoverRecentSearches";
import { readRecentProfileVisits, type RecentProfileVisit } from "../../utils/profileRecentVisits";
import { useAuth } from "../../context/AuthContext";
import { useSocialHub } from "../../context/SocialHubContext";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import type { DiscoverUser } from "../../types/auth";
import { formatRelativeMinutes } from "../../utils/formatRelativeMinutes";
import { groupDiscoverUsers, pickNearbyUsers } from "../../utils/socialDiscoverGroups";
import { DISCOVER_FACET_OPTIONS, type DiscoverFacetFilter } from "../../utils/socialDiscoverFilters";
import {
  DISCOVER_SORT_OPTIONS,
  sortDiscoverUsers,
  type DiscoverSortMode,
} from "../../utils/socialDiscoverSort";
import { ProfileSectionSurface } from "../profile/ProfileSectionSurface";
import { SocialChipRow } from "./SocialChipRow";
import { SocialCompactUserList } from "./SocialCompactUserList";
import { SocialDiscoverHighlights } from "./SocialDiscoverHighlights";
import { SocialLocationCta } from "./SocialLocationCta";
import { SocialMutualConnectionsRow } from "./SocialMutualConnectionsRow";
import { SocialRecentVisitsRow } from "./SocialRecentVisitsRow";
import { SocialStoriesStrip } from "./SocialStoriesStrip";
import { SocialDiscoverSkeleton } from "./SocialDiscoverSkeleton";
import { SocialDiscoverUserRow } from "./SocialDiscoverUserRow";
import { SocialSectionEmpty } from "./SocialSectionEmpty";

const PAGE_SIZE = 40;

type SocialDiscoverScreenProps = {
  showBack?: boolean;
  title?: string;
  embedded?: boolean;
  onBack?: () => void;
  initialFacet?: DiscoverFacetFilter;
  onFacetChange?: (facet: DiscoverFacetFilter) => void;
};

export function SocialDiscoverScreen({
  showBack = true,
  title = "Descubrir atletas",
  embedded = false,
  onBack,
  initialFacet = "all",
  onFacetChange,
}: SocialDiscoverScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { followingIds, applyFollowingChange, toggleFollowFor, invalidateHub, refreshHub } =
    useSocialHub();

  const [discoverUsers, setDiscoverUsers] = useState<DiscoverUser[]>([]);
  const discoverUsersRef = useRef<DiscoverUser[]>([]);
  discoverUsersRef.current = discoverUsers;
  const [searchResults, setSearchResults] = useState<DiscoverUser[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [followBusyId, setFollowBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState<DiscoverSortMode>("recommended");
  const [facet, setFacet] = useState<DiscoverFacetFilter>(initialFacet);

  useEffect(() => {
    setFacet(initialFacet);
  }, [initialFacet]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [total, setTotal] = useState<number | undefined>();
  const [lastRefreshedAt, setLastRefreshedAt] = useState<string | null>(null);
  const [recentVisits, setRecentVisits] = useState<RecentProfileVisit[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const discoverFocusAtRef = useRef(0);
  const DISCOVER_FOCUS_STALE_MS = 45_000;

  const debouncedQuery = useDebouncedValue(query.trim(), 350);

  const load = useCallback(
    async (append = false, fromOffset = 0, facetFilter: DiscoverFacetFilter = facet) => {
      if (!user?.id) return;
      try {
        const discover = await getDiscover(PAGE_SIZE, fromOffset, facetFilter);
        setDiscoverUsers((prev) =>
          append ? [...prev, ...(discover.users ?? [])] : (discover.users ?? [])
        );
        setNextOffset(discover.nextOffset ?? null);
        setTotal(discover.total);
        setLastRefreshedAt(new Date().toISOString());
      } catch {
        if (!append) setDiscoverUsers([]);
      }
    },
    [user?.id, facet]
  );

  useEffect(() => {
    if (!debouncedQuery || !user?.id) {
      setSearchResults([]);
      return;
    }
    let cancelled = false;
    setSearchLoading(true);
    void searchUsers(debouncedQuery, 32)
      .then((res) => {
        if (!cancelled) {
          setSearchResults(res.users ?? []);
          if ((res.users ?? []).length > 0 && user?.id) {
            void pushDiscoverRecentSearch(user.id, debouncedQuery).then(setRecentSearches);
          }
        }
      })
      .catch(() => {
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setSearchLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, user?.id]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    invalidateHub();
    await Promise.all([load(false, 0), refreshHub({ silent: true })]);
    setRefreshing(false);
  }, [load, invalidateHub, refreshHub]);

  const loadMore = useCallback(async () => {
    if (nextOffset == null || loadingMore || query.trim()) return;
    setLoadingMore(true);
    await load(true, nextOffset);
    setLoadingMore(false);
  }, [nextOffset, loadingMore, query, load]);

  useFocusEffect(
    useCallback(() => {
      const hasData = discoverUsersRef.current.length > 0;
      const stale = Date.now() - discoverFocusAtRef.current > DISCOVER_FOCUS_STALE_MS;
      if (!hasData || stale) {
        const showLoading = !hasData;
        if (showLoading) setLoading(true);
        void load(false, 0).finally(() => {
          discoverFocusAtRef.current = Date.now();
          if (showLoading) setLoading(false);
        });
      }
      if (user?.id) {
        void readRecentProfileVisits(user.id).then(setRecentVisits);
        void loadDiscoverRecentSearches(user.id).then(setRecentSearches);
      }
    }, [load, user?.id])
  );

  const followingSet = useMemo(() => new Set(followingIds), [followingIds]);

  const discoverListExtraKey = followBusyId ?? "";

  const hasMutualConnections = useMemo(() => {
    const following = new Set(followingIds);
    for (const u of discoverUsers) {
      for (const m of u.mutualPreview ?? []) {
        if (m.id !== user?.id && !following.has(m.id)) return true;
      }
    }
    return false;
  }, [discoverUsers, followingIds, user?.id]);

  const showDiscoverExtras = !query.trim();

  const baseUsers = useMemo(() => {
    const q = query.trim();
    const source = q ? searchResults : discoverUsers;
    const sorted = sortDiscoverUsers(source, sortMode, {
      viewerLocation: user?.location,
      viewerGoal: user?.goal,
    });
    return sorted;
  }, [discoverUsers, searchResults, query, sortMode, user?.location, user?.goal]);

  const groups = useMemo(
    () => groupDiscoverUsers(baseUsers, user?.id, followingIds),
    [baseUsers, user?.id, followingIds]
  );

  const showMutualRow =
    showDiscoverExtras && hasMutualConnections && groups.mutuals.length === 0;

  const nearbyUsers = useMemo(
    () => (query.trim() ? [] : pickNearbyUsers(baseUsers, user?.location, 12)),
    [baseUsers, query, user?.location]
  );

  const listUsers = useMemo(() => {
    if (query.trim()) return baseUsers;
    if (sortMode === "nearby" || facet === "nearby") return baseUsers;
    return groups.rest;
  }, [query, sortMode, facet, baseUsers, groups.rest]);

  const onFollowingChanged = useCallback(
    (targetId: string, following: boolean) => {
      applyFollowingChange(targetId, following);
    },
    [applyFollowingChange]
  );

  const showLocationCta =
    !query.trim() && (facet === "nearby" || sortMode === "nearby") && !user?.location?.trim();

  const onPressFollow = useCallback(
    (targetId: string) => {
      setFollowBusyId(targetId);
      void toggleFollowFor(targetId).finally(() => setFollowBusyId(null));
    },
    [toggleFollowFor]
  );

  const renderDiscoverUser = useCallback(
    ({ item: u }: { item: DiscoverUser }) => (
      <View style={styles.listPad}>
        <SocialDiscoverUserRow
          user={u}
          following={followingSet.has(u.id) || !!u.isFollowing}
          followPending={!!u.followPending}
          followBusy={followBusyId === u.id}
          onPressFollow={onPressFollow}
        />
      </View>
    ),
    [followingSet, followBusyId, onPressFollow]
  );

  const handleFacetChange = useCallback(
    (f: DiscoverFacetFilter) => {
      setFacet(f);
      onFacetChange?.(f);
      setNextOffset(null);
      void load(false, 0, f);
    },
    [load, onFacetChange]
  );

  const listHeader = useMemo(
    () => (
      <>
        {loading && discoverUsers.length === 0 ? <SocialDiscoverSkeleton /> : null}

        {showDiscoverExtras ? (
          <View style={styles.sectionPad}>
            <SocialStoriesStrip />
          </View>
        ) : null}

        {showDiscoverExtras && recentVisits.length > 0 ? (
          <ProfileSectionSurface flush goldLine>
            <View style={styles.sectionPad}>
              <Text style={styles.sectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Vistos recientemente
              </Text>
              <SocialRecentVisitsRow visits={recentVisits} />
            </View>
          </ProfileSectionSurface>
        ) : null}

        {showLocationCta ? (
          <View style={styles.sectionPad}>
            <SocialLocationCta />
          </View>
        ) : null}

        {!query.trim() && sortMode !== "nearby" && facet !== "nearby" && (groups.mutuals.length > 0 || groups.activeThisWeek.length > 0) ? (
          <ProfileSectionSurface flush goldLine>
            <View style={styles.sectionPad}>
              <SocialDiscoverHighlights
                mutuals={groups.mutuals}
                activeThisWeek={groups.activeThisWeek}
                followingIds={followingIds}
                onFollowingChanged={onFollowingChanged}
              />
            </View>
          </ProfileSectionSurface>
        ) : null}

        {showMutualRow ? (
          <ProfileSectionSurface flush goldLine>
            <View style={styles.sectionPad}>
              <Text style={styles.sectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Conexiones en común
              </Text>
              <SocialMutualConnectionsRow
                discoverUsers={discoverUsers}
                followingIds={followingIds}
                currentUserId={user?.id}
              />
            </View>
          </ProfileSectionSurface>
        ) : null}

        {!query.trim() && nearbyUsers.length > 0 && sortMode !== "nearby" && facet !== "nearby" ? (
          <ProfileSectionSurface flush goldLine>
            <View style={styles.sectionPad}>
              <Text style={styles.sectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Cerca de ti
              </Text>
              <SocialCompactUserList
                users={nearbyUsers}
                followingIds={followingIds}
                currentUserId={user?.id}
                onFollowingChanged={onFollowingChanged}
                emptyTitle=""
                emptyBody=""
              />
            </View>
          </ProfileSectionSurface>
        ) : null}

        {searchLoading && query.trim() ? (
          <ActivityIndicator color={AUTH.gold} style={styles.searchSpinner} />
        ) : null}

        {listUsers.length > 0 ? <View style={styles.listPadTop} /> : null}
      </>
    ),
    [
      loading,
      discoverUsers.length,
      showDiscoverExtras,
      recentVisits,
      showLocationCta,
      query,
      sortMode,
      facet,
      groups.mutuals,
      groups.activeThisWeek,
      followingIds,
      onFollowingChanged,
      showMutualRow,
      discoverUsers,
      user?.id,
      nearbyUsers,
      searchLoading,
      listUsers.length,
    ]
  );

  const listFooter = useMemo(
    () => (
      <>
        {nextOffset != null && !query.trim() && listUsers.length > 0 ? (
          <Pressable
            onPress={() => void loadMore()}
            disabled={loadingMore}
            style={({ pressed }) => [styles.loadMore, pressed ? styles.pressed : null]}
          >
            {loadingMore ? (
              <ActivityIndicator color={AUTH.gold} />
            ) : (
              <Text style={styles.loadMoreText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Cargar más
              </Text>
            )}
          </Pressable>
        ) : null}
      </>
    ),
    [nextOffset, query, listUsers.length, loadingMore, loadMore]
  );

  const listEmpty = useMemo(
    () =>
      !loading && !searchLoading ? (
        <View style={styles.empty}>
          <SocialSectionEmpty
            title={query.trim() ? "Sin resultados" : facet === "nearby" || sortMode === "nearby" ? "Nadie cerca aún" : "No hay sugerencias"}
            body={
              query.trim()
                ? "Prueba otro nombre o quita el filtro."
                : facet === "nearby" || sortMode === "nearby"
                  ? "Añade ubicación en tu perfil para ver atletas cercanos."
                  : "Vuelve más tarde o explora desde el feed."
            }
          />
        </View>
      ) : null,
    [loading, searchLoading, query, facet, sortMode]
  );

  const refreshMeta = formatRelativeMinutes(lastRefreshedAt);

  const body = (
    <>
      {embedded ? null : (
      <View style={[styles.topBar, { paddingTop: Math.max(insets.top, 8) }]}>
        {showBack ? (
          <Pressable
            onPress={() => (onBack ? onBack() : router.back())}
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

      <View style={styles.searchWrap}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar por @usuario"
          placeholderTextColor={AUTH.muted}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
          accessibilityLabel="Buscar atletas por nombre de usuario"
        />
        {recentSearches.length > 0 && !query.trim() ? (
          <View style={styles.recentWrap}>
            <View style={styles.recentHeader}>
              <Text style={styles.recentTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Búsquedas recientes
              </Text>
              <Pressable
                onPress={() => {
                  if (!user?.id) return;
                  void clearDiscoverRecentSearches(user.id).then(() => setRecentSearches([]));
                }}
                accessibilityRole="button"
                accessibilityLabel="Borrar búsquedas recientes"
              >
                <Text style={styles.recentClear} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Borrar
                </Text>
              </Pressable>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentScroll}>
              {recentSearches.map((term) => (
                <Pressable
                  key={term}
                  onPress={() => setQuery(term)}
                  style={({ pressed }) => [styles.recentChip, pressed ? styles.pressed : null]}
                >
                  <Text style={styles.recentChipText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                    @{term.replace(/^@/, "")}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
        <SocialChipRow
          options={DISCOVER_FACET_OPTIONS}
          value={facet}
          onChange={handleFacetChange}
        />
        <SocialChipRow options={DISCOVER_SORT_OPTIONS} value={sortMode} onChange={setSortMode} />
        {refreshMeta ? (
          <Text style={styles.refreshMeta} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {refreshMeta}
            {total != null ? ` · ${discoverUsers.length}/${total}` : ""}
          </Text>
        ) : null}
      </View>

      <FlashList
        style={embedded ? styles.scrollFlex : styles.scrollFlex}
        contentContainerStyle={styles.scroll}
        data={listUsers}
        keyExtractor={(u) => u.id}
        renderItem={renderDiscoverUser}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={listEmpty}
        extraData={discoverListExtraKey}
        keyboardShouldPersistTaps="handled"
        drawDistance={480}
        onEndReached={() => {
          if (nextOffset == null || loadingMore || query.trim()) return;
          void loadMore();
        }}
        onEndReachedThreshold={0.35}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={AUTH.gold} />
        }
      />
    </>
  );

  if (embedded) {
    return <View style={styles.embeddedRoot}>{body}</View>;
  }

  return <AppScreenShell variant="feed">{body}</AppScreenShell>;
}

const styles = StyleSheet.create({
  embeddedRoot: {
    flex: 1,
    minHeight: 0,
  },
  scrollFlex: {
    flex: 1,
  },
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
  searchWrap: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    gap: 8,
  },
  searchInput: {
    color: AUTH.neutral100,
    fontSize: 15,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.85)",
    backgroundColor: "rgba(18, 18, 20, 0.85)",
  },
  recentWrap: {
    gap: 6,
  },
  recentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recentTitle: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  recentClear: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "600",
  },
  recentScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  recentChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.28)",
    backgroundColor: "rgba(35, 32, 22, 0.5)",
  },
  recentChipText: {
    color: AUTH.neutral100,
    fontSize: 12,
    fontWeight: "600",
  },
  refreshMeta: {
    color: AUTH.faint,
    fontSize: 11,
  },
  scroll: {
    paddingBottom: 32,
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
    marginBottom: 8,
  },
  listPad: {
    paddingHorizontal: 14,
    paddingTop: 4,
  },
  listPadTop: {
    height: 4,
  },
  searchSpinner: {
    marginVertical: 16,
  },
  empty: {
    padding: 20,
  },
  loadMore: {
    marginHorizontal: 20,
    marginTop: 12,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  loadMoreText: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
