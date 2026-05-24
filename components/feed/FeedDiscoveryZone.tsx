import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { FeedStoryAuthor } from "../../types/story";
import type { FeedSuggestionsPlacement } from "../../utils/feedSuggestionsVisibility";
import { FeedStoriesSection } from "./FeedStoriesSection";

type FeedDiscoveryZoneProps = {
  authors: FeedStoryAuthor[];
  currentUserId: string;
  seenRevision: number;
  onSelectAuthor: (userId: string) => void;
  suggestionsPlacement: FeedSuggestionsPlacement;
};

function bridgeCopy(placement: FeedSuggestionsPlacement): { label: string; hint: string } {
  if (placement === "inline") {
    return {
      label: "Amplía tu círculo",
      hint: "Historias de quien sigues arriba · Sugerencias al bajar el feed",
    };
  }
  if (placement === "empty" || placement === "header") {
    return {
      label: "Amplía tu círculo",
      hint: "Historias de quien sigues · Descubre atletas para tu feed",
    };
  }
  return {
    label: "Tu día",
    hint: "Historias de quien sigues",
  };
}

export function FeedDiscoveryZone({
  authors,
  currentUserId,
  seenRevision,
  onSelectAuthor,
  suggestionsPlacement,
}: FeedDiscoveryZoneProps) {
  const bridge = bridgeCopy(suggestionsPlacement);
  const showBridge = suggestionsPlacement !== "none";

  return (
    <View style={styles.wrap}>
      <FeedStoriesSection
        authors={authors}
        currentUserId={currentUserId}
        seenRevision={seenRevision}
        onSelectAuthor={onSelectAuthor}
      />
      {showBridge ? (
        <View style={styles.bridge}>
          <View style={styles.bridgeLine} />
          <Text style={styles.bridgeLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {bridge.label}
          </Text>
          <Text style={styles.bridgeHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {bridge.hint}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 4,
  },
  bridge: {
    paddingHorizontal: 14,
    paddingTop: 2,
    paddingBottom: 8,
    gap: 4,
  },
  bridgeLine: {
    height: 1,
    backgroundColor: "rgba(212, 175, 55, 0.22)",
    marginBottom: 6,
  },
  bridgeLabel: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  bridgeHint: {
    color: AUTH.muted,
    fontSize: 11,
    lineHeight: 15,
  },
});
