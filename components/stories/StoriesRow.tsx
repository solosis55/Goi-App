import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import {
  GOI_DAILY_LABEL,
  STORY_STRIP_AVATAR_SIZE,
  STORY_STRIP_CELL_WIDTH,
  STORY_STRIP_RING_BOX,
} from "../../constants/storyBranding";
import type { FeedStoryAuthor } from "../../types/story";
import { hasUnseenStories, loadStorySeenMap } from "../../utils/storySeen";
import { UserAvatar } from "../ui/UserAvatar";

type StoriesRowProps = {
  authors: FeedStoryAuthor[];
  currentUserId: string;
  seenRevision: number;
  onSelectAuthor: (userId: string) => void;
};

export function StoriesRow({ authors, currentUserId, seenRevision, onSelectAuthor }: StoriesRowProps) {
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

  const onPress = useCallback(
    (userId: string) => {
      onSelectAuthor(userId);
    },
    [onSelectAuthor]
  );

  if (authors.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Publica tu primer {GOI_DAILY_LABEL}
        </Text>
        <Text style={styles.emptyBody} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Pulsa tu avatar con el + para compartir un momento (24 h).
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}
      accessibilityRole="list"
      accessibilityLabel={GOI_DAILY_LABEL}
    >
      {authors.map((author) => {
        const isSelf = author.userId === currentUserId;
        const hasSlides = author.slides.length > 0;
        const isNewSlot = isSelf && !hasSlides;
        const unseen = hasUnseenStories(author.userId, author.slides, seenMap[author.userId]);
        const label = isSelf ? (hasSlides ? "Tu Daily" : "Nueva") : author.authorUsername;

        const ringStyle = isNewSlot
          ? styles.ringNew
          : hasSlides
            ? unseen
              ? styles.ringUnseen
              : styles.ringSeen
            : styles.ringMuted;

        return (
          <Pressable
            key={author.userId}
            onPress={() => onPress(author.userId)}
            style={({ pressed }) => [
              styles.cell,
              pressed ? styles.cellPressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isNewSlot
                ? `Publicar ${GOI_DAILY_LABEL}`
                : hasSlides
                  ? `Ver ${GOI_DAILY_LABEL} de ${author.authorUsername}`
                  : `${GOI_DAILY_LABEL} de ${author.authorUsername}`
            }
          >
            <View style={styles.avatarWrap}>
              <View style={styles.ringBox}>
                <View style={[styles.ring, ringStyle, isSelf && hasSlides ? styles.ringSelf : null]}>
                  <UserAvatar
                    src={author.authorAvatarUrl}
                    username={author.authorUsername}
                    size={STORY_STRIP_AVATAR_SIZE}
                  />
                </View>
              </View>
              {isNewSlot ? (
                <View style={styles.plusBadge}>
                  <Text style={styles.plusText}>+</Text>
                </View>
              ) : null}
            </View>
            <Text
              style={[styles.label, isNewSlot ? styles.labelNew : null, isSelf ? styles.labelSelf : null]}
              numberOfLines={1}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  empty: {
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(115, 115, 115, 0.45)",
    backgroundColor: "rgba(0, 0, 0, 0.15)",
    paddingHorizontal: 16,
    paddingVertical: 18,
    gap: 6,
  },
  emptyTitle: {
    color: "#d4d4d4",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  emptyBody: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  strip: {
    paddingVertical: 4,
    paddingRight: 8,
    gap: 12,
    alignItems: "flex-start",
  },
  cell: {
    width: STORY_STRIP_CELL_WIDTH,
    alignItems: "center",
    gap: 6,
  },
  cellPressed: {
    opacity: 0.85,
  },
  avatarWrap: {
    position: "relative",
    width: STORY_STRIP_RING_BOX,
    height: STORY_STRIP_RING_BOX,
    alignItems: "center",
    justifyContent: "center",
  },
  ringBox: {
    width: STORY_STRIP_RING_BOX,
    height: STORY_STRIP_RING_BOX,
    alignItems: "center",
    justifyContent: "center",
  },
  ring: {
    borderRadius: 999,
    padding: 2,
    overflow: "hidden",
  },
  ringSelf: {
    borderColor: "rgba(212, 175, 55, 0.55)",
  },
  ringNew: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(212, 175, 55, 0.65)",
  },
  ringUnseen: {
    borderWidth: 3,
    borderColor: AUTH.gold,
  },
  ringSeen: {
    borderWidth: 2,
    borderColor: "rgba(115, 115, 115, 0.9)",
  },
  ringMuted: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(115, 115, 115, 0.55)",
  },
  plusBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AUTH.gold,
    borderWidth: 2,
    borderColor: "#09090b",
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "700",
    marginTop: -1,
  },
  label: {
    width: STORY_STRIP_CELL_WIDTH,
    color: AUTH.muted,
    fontSize: 11,
    textAlign: "center",
  },
  labelNew: {
    color: AUTH.gold,
    fontWeight: "600",
  },
  labelSelf: {
    fontWeight: "600",
  },
});
