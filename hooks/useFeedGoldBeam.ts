import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type ViewToken } from "react-native";
import { useSharedValue } from "react-native-reanimated";
import type { Post } from "../types/post";
import type { FeedListItem } from "../utils/feedListItems";
import { postEligibleForGoldBeam } from "../utils/feedTimeline";

const BEAM_VIEWABILITY_THRESHOLD = 22;
const BEAM_VIEWABILITY_MIN_TIME = 200;
/** Cerca del tope: priorizar el post elegible más reciente / visible arriba. */
const BEAM_TOP_SCROLL_Y = 120;

function isEligiblePostRow(row: FeedListItem): row is Extract<FeedListItem, { kind: "post" }> {
  return row.kind === "post" && postEligibleForGoldBeam(row.post);
}

function newestEligiblePostId(posts: Post[]): string | null {
  return posts.find(postEligibleForGoldBeam)?.id ?? null;
}

export function useFeedGoldBeam(posts: Post[], goldBeamEnabled: boolean) {
  const scrollY = useSharedValue(0);
  const [activeBeamPostId, setActiveBeamPostId] = useState<string | null>(null);
  const postsRef = useRef(posts);
  postsRef.current = posts;

  const beamViewabilityConfig = useRef({
    itemVisiblePercentThreshold: BEAM_VIEWABILITY_THRESHOLD,
    minimumViewTime: BEAM_VIEWABILITY_MIN_TIME,
  }).current;

  const onBeamViewableChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const atTop = scrollY.value < BEAM_TOP_SCROLL_Y;
    const visible = viewableItems
      .filter((t) => t.isViewable && t.item != null && (t.item as FeedListItem).kind === "post")
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    const eligibleVisible = visible.filter((t) => isEligiblePostRow(t.item as FeedListItem));
    const topEligibleId = newestEligiblePostId(postsRef.current);

    if (eligibleVisible.length === 0) {
      if (atTop && topEligibleId) setActiveBeamPostId(topEligibleId);
      return;
    }

    const visiblePostIds = eligibleVisible.map(
      (t) => (t.item as Extract<FeedListItem, { kind: "post" }>).post.id
    );

    setActiveBeamPostId((current) => {
      if (atTop && topEligibleId && (current === topEligibleId || visiblePostIds.includes(topEligibleId))) {
        return topEligibleId;
      }
      if (current && visiblePostIds.includes(current)) return current;

      const pick =
        atTop || eligibleVisible.length === 1
          ? eligibleVisible[0]
          : eligibleVisible[Math.floor(eligibleVisible.length / 2)];

      const row = pick.item as FeedListItem;
      return isEligiblePostRow(row) ? row.post.id : current;
    });
  }).current;

  const beamViewabilityPairs = useMemo(
    () =>
      goldBeamEnabled
        ? [{ viewabilityConfig: beamViewabilityConfig, onViewableItemsChanged: onBeamViewableChanged }]
        : [],
    [goldBeamEnabled, beamViewabilityConfig, onBeamViewableChanged]
  );

  const beamEligibilitySignature = posts
    .map(
      (p) =>
        `${p.id}:${p.format ?? ""}:${p.workoutId ?? ""}:${p.hasMedia ?? false}:${p.media?.length ?? 0}`
    )
    .join("|");

  const beamEligibleIdsKey = useMemo(
    () => posts.filter(postEligibleForGoldBeam).map((p) => p.id).join(","),
    [beamEligibilitySignature]
  );

  const syncActiveBeam = useCallback(() => {
    if (!goldBeamEnabled || !beamEligibleIdsKey) {
      setActiveBeamPostId(null);
      return;
    }
    const atTop = scrollY.value < BEAM_TOP_SCROLL_Y;
    const topEligible = postsRef.current.find(postEligibleForGoldBeam);
    setActiveBeamPostId((current) => {
      if (atTop && topEligible) return topEligible.id;
      if (current && postsRef.current.some((p) => p.id === current && postEligibleForGoldBeam(p))) {
        return current;
      }
      return topEligible?.id ?? null;
    });
  }, [goldBeamEnabled, beamEligibleIdsKey]);

  useEffect(() => {
    syncActiveBeam();
  }, [syncActiveBeam]);

  useFocusEffect(
    useCallback(() => {
      syncActiveBeam();
    }, [syncActiveBeam])
  );

  return {
    scrollY,
    activeBeamPostId,
    beamViewabilityPairs,
  };
}
