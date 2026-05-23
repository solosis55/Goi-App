import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { GOI_DAILY_HELP_MESSAGE, GOI_DAILY_LABEL } from "../../constants/storyBranding";
import { useGoiAlert } from "../../context/GoiAlertContext";
import type { FeedStoryAuthor } from "../../types/story";
import { hasUnseenStories, loadStorySeenMap } from "../../utils/storySeen";
import { StoriesRow } from "../stories/StoriesRow";

type FeedStoriesSectionProps = {
  authors: FeedStoryAuthor[];
  currentUserId: string;
  seenRevision: number;
  onSelectAuthor: (userId: string) => void;
};

export function FeedStoriesSection({
  authors,
  currentUserId,
  seenRevision,
  onSelectAuthor,
}: FeedStoriesSectionProps) {
  const { showAlert } = useGoiAlert();
  const [seenMap, setSeenMap] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    void loadStorySeenMap().then((map) => {
      if (!cancelled) setSeenMap(map);
    });
    return () => {
      cancelled = true;
    };
  }, [seenRevision]);

  const activeCount = authors.filter(
    (a) => a.slides.length > 0 && hasUnseenStories(a.userId, a.slides, seenMap[a.userId])
  ).length;

  return (
    <View style={styles.wrap}>
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {GOI_DAILY_LABEL}
          </Text>
          {activeCount > 0 ? (
            <View style={styles.badge}>
              <View style={styles.badgeDot} />
              <Text style={styles.badgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {activeCount}
              </Text>
            </View>
          ) : null}
        </View>
        <Pressable
          onPress={() =>
            showAlert({
              title: GOI_DAILY_LABEL,
              message: GOI_DAILY_HELP_MESSAGE,
              buttons: [{ text: "Entendido", style: "default" }],
            })
          }
          style={({ pressed }) => [styles.infoBtn, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={`Ayuda sobre ${GOI_DAILY_LABEL}`}
        >
          <Text style={styles.infoText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            i
          </Text>
        </Pressable>
      </View>
      <StoriesRow
        authors={authors}
        currentUserId={currentUserId}
        seenRevision={seenRevision}
        onSelectAuthor={onSelectAuthor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 12,
    gap: 10,
    paddingBottom: 4,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  titleLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "600",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.75)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: AUTH.gold,
  },
  badgeText: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "700",
  },
  infoBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.88,
  },
});
