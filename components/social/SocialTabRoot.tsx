import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppScreenShell } from "../AppScreenShell";
import { useSocialHub } from "../../context/SocialHubContext";
import type { DiscoverFacetFilter } from "../../utils/socialDiscoverFilters";
import { NotificationsTabScreen } from "../notifications/NotificationsTabScreen";
import { SocialDiscoverScreen } from "./SocialDiscoverScreen";
import { SocialHubScreen } from "./SocialHubScreen";
import { SocialTabSegment, type SocialTabSegmentId } from "./SocialTabSegment";

function parseDiscoverParam(raw: string | string[] | undefined): boolean {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "1" || v === "true";
}

function parseFacetParam(raw: string | string[] | undefined): DiscoverFacetFilter {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "active" || v === "trained" || v === "sameGoal" || v === "nearby") return v;
  return "all";
}

function segmentFromParams(discover: boolean, activity?: boolean): SocialTabSegmentId {
  if (activity) return "activity";
  if (discover) return "discover";
  return "hub";
}

export function SocialTabRoot() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { discover: discoverParam, facet: facetParam, activity: activityParam } = useLocalSearchParams<{
    discover?: string;
    facet?: string;
    activity?: string;
  }>();
  const {
    unreadNotifications,
    pendingFollowRequests,
    refreshBadge,
    refreshHub,
    setSocialTabFocused,
  } = useSocialHub();

  const [segment, setSegment] = useState<SocialTabSegmentId>(() =>
    segmentFromParams(parseDiscoverParam(discoverParam), activityParam === "1")
  );
  const [discoverFacet, setDiscoverFacet] = useState<DiscoverFacetFilter>(() =>
    parseFacetParam(facetParam)
  );

  useFocusEffect(
    useCallback(() => {
      setSocialTabFocused(true);
      if (parseDiscoverParam(discoverParam)) {
        setSegment("discover");
        setDiscoverFacet(parseFacetParam(facetParam));
      } else if (activityParam === "1") {
        setSegment("activity");
      }
      void refreshHub({ silent: true });
      void refreshBadge();
      return () => setSocialTabFocused(false);
    }, [discoverParam, facetParam, activityParam, refreshHub, refreshBadge, setSocialTabFocused])
  );

  const onSegmentChange = useCallback(
    (id: SocialTabSegmentId) => {
      setSegment(id);
      router.setParams({
        discover: id === "discover" ? "1" : undefined,
        facet: id === "discover" && discoverFacet !== "all" ? discoverFacet : undefined,
        activity: id === "activity" ? "1" : undefined,
      });
    },
    [router, discoverFacet]
  );

  const openDiscover = useCallback(
    (facet: DiscoverFacetFilter = "all") => {
      setDiscoverFacet(facet);
      setSegment("discover");
      router.setParams({
        discover: "1",
        facet: facet === "all" ? undefined : facet,
        activity: undefined,
      });
    },
    [router]
  );

  const openActivity = useCallback(() => {
    setSegment("activity");
    router.setParams({ discover: undefined, facet: undefined, activity: "1" });
  }, [router]);

  return (
    <AppScreenShell variant="feed">
      <View style={styles.root}>
        <View style={[styles.segmentWrap, { paddingTop: Math.max(insets.top, 6) }]}>
          <SocialTabSegment
            value={segment}
            onChange={onSegmentChange}
            activityBadge={unreadNotifications}
            requestsBadge={pendingFollowRequests}
          />
        </View>
        <View style={styles.panel}>
          {segment === "hub" ? (
            <SocialHubScreen embedded onOpenSearch={openDiscover} onOpenActivity={openActivity} />
          ) : segment === "discover" ? (
            <SocialDiscoverScreen
              embedded
              initialFacet={discoverFacet}
              onFacetChange={setDiscoverFacet}
            />
          ) : (
            <NotificationsTabScreen embedded />
          )}
        </View>
      </View>
    </AppScreenShell>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  segmentWrap: {
    paddingBottom: 4,
  },
  panel: {
    flex: 1,
    minHeight: 0,
  },
});
