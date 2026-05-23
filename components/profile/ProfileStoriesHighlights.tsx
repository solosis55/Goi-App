import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { getStories } from "../../api/stories";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { GOI_DAILY_LABEL } from "../../constants/storyBranding";
import type { FeedStoryAuthor } from "../../types/story";
import { hasUnseenStories, loadStorySeenMap } from "../../utils/storySeen";
import { UserAvatar } from "../ui/UserAvatar";

type ProfileStoriesHighlightsProps = {
  userId: string;
  username: string;
  avatarUrl?: string;
  isSelf: boolean;
  onViewStory: (author: FeedStoryAuthor) => void;
  onCreateStory?: () => void;
  /** Sin borde inferior cuando va dentro de la pestaña Publicaciones. */
  embedded?: boolean;
};

export function ProfileStoriesHighlights({
  userId,
  username,
  avatarUrl,
  isSelf,
  onViewStory,
  onCreateStory,
  embedded,
}: ProfileStoriesHighlightsProps) {
  const [author, setAuthor] = useState<FeedStoryAuthor | null>(null);
  const [seenMap, setSeenMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [data, seen] = await Promise.all([getStories(), loadStorySeenMap()]);
      setSeenMap(seen);
      const row =
        data.authors?.find((a) => a.userId === userId) ??
        ({
          userId,
          authorUsername: username,
          authorAvatarUrl: avatarUrl ?? "",
          slides: [],
        } satisfies FeedStoryAuthor);
      setAuthor(row);
    } catch {
      setAuthor({
        userId,
        authorUsername: username,
        authorAvatarUrl: avatarUrl ?? "",
        slides: [],
      });
    } finally {
      setLoading(false);
    }
  }, [userId, username, avatarUrl]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  if (loading) return null;

  const hasSlides = (author?.slides.length ?? 0) > 0;
  if (!hasSlides && !isSelf) return null;

  const unseen = author
    ? hasUnseenStories(author.userId, author.slides, seenMap[author.userId])
    : false;
  const isNewSlot = isSelf && !hasSlides;

  const onPress = () => {
    if (!author) return;
    if (isNewSlot && onCreateStory) {
      onCreateStory();
      return;
    }
    if (hasSlides) onViewStory(author);
  };

  return (
    <View style={[styles.wrap, embedded ? styles.wrapEmbedded : null]}>
      <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {GOI_DAILY_LABEL}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.strip}
        accessibilityRole="list"
        accessibilityLabel={`${GOI_DAILY_LABEL} en el perfil`}
      >
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [styles.cell, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={
            isNewSlot
              ? `Publicar ${GOI_DAILY_LABEL}`
              : hasSlides
                ? unseen
                  ? `${GOI_DAILY_LABEL} de ${username}, sin ver`
                  : `${GOI_DAILY_LABEL} de ${username}`
                : `Sin ${GOI_DAILY_LABEL} activo de ${username}`
          }
        >
          <View
            style={[
              styles.ring,
              isNewSlot ? styles.ringNew : hasSlides ? (unseen ? styles.ringUnseen : styles.ringSeen) : styles.ringMuted,
            ]}
          >
            <UserAvatar src={avatarUrl} username={username} size={56} />
            {isNewSlot ? (
              <View style={styles.plusBadge}>
                <Text style={styles.plusText}>+</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.caption} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {isNewSlot ? "Nueva" : hasSlides ? (isSelf ? "Tu Daily" : username) : "—"}
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingTop: 4,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
  },
  wrapEmbedded: {
    borderBottomWidth: 0,
    paddingTop: 8,
    backgroundColor: "rgba(10, 10, 12, 0.35)",
  },
  title: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  strip: {
    paddingHorizontal: 16,
    gap: 14,
    alignItems: "flex-start",
  },
  cell: {
    alignItems: "center",
    width: 72,
    gap: 6,
  },
  ring: {
    padding: 3,
    borderRadius: 999,
    borderWidth: 2,
  },
  ringUnseen: {
    borderColor: AUTH.gold,
  },
  ringSeen: {
    borderColor: "rgba(82, 82, 82, 0.9)",
  },
  ringNew: {
    borderColor: "rgba(212, 175, 55, 0.55)",
    borderStyle: "dashed",
  },
  ringMuted: {
    borderColor: "rgba(64, 64, 64, 0.8)",
  },
  plusBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: AUTH.gold,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: AUTH.bg,
  },
  plusText: {
    color: "#0a0a0a",
    fontSize: 14,
    fontWeight: "800",
    lineHeight: 16,
  },
  caption: {
    color: AUTH.faint,
    fontSize: 11,
    maxWidth: 72,
    textAlign: "center",
  },
  pressed: {
    opacity: 0.88,
  },
});
