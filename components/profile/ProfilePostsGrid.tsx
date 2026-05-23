import { Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { Post } from "../../types/post";
import { postThumbnailUrl } from "../../utils/postThumbnail";

const COLS = 3;
const GAP = 1;

type ProfilePostsGridProps = {
  posts: Post[];
  pinnedPostId?: string | null;
  selectedId?: string | null;
  workoutLabelByPostId?: Record<string, string>;
  onSelect: (postId: string) => void;
};

export function ProfilePostsGrid({
  posts,
  pinnedPostId,
  selectedId,
  workoutLabelByPostId,
  onSelect,
}: ProfilePostsGridProps) {
  const { width } = useWindowDimensions();
  const cellSize = (width - GAP * (COLS - 1)) / COLS;
  const pinTrim = pinnedPostId?.trim() ?? "";

  return (
    <View style={styles.grid}>
      {posts.map((post) => {
        const thumb = postThumbnailUrl(post);
        const thumbUri = thumb ? resolveMediaUrl(thumb) : "";
        const multi = (post.media?.length ?? 0) > 1;
        const selected = selectedId === post.id;
        const isPinned = Boolean(pinTrim && post.id === pinTrim);
        const workoutLabel = workoutLabelByPostId?.[post.id];
        const preview = post.content.trim().slice(0, 80);
        const label =
          preview.length > 0
            ? `Publicación: ${preview}${post.content.trim().length > 80 ? "…" : ""}`
            : "Publicación sin texto";

        return (
          <Pressable
            key={post.id}
            onPress={() => onSelect(post.id)}
            accessibilityRole="button"
            accessibilityLabel={label}
            style={({ pressed }) => [
              styles.cell,
              { width: cellSize, height: cellSize },
              selected ? styles.cellSelected : null,
              pressed ? styles.cellPressed : null,
            ]}
          >
            {thumbUri ? (
              <Image source={{ uri: thumbUri }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={styles.textOnly}>
                <Text style={styles.textOnlyLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Solo texto
                </Text>
                <Text style={styles.textOnlyBody} numberOfLines={4} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {post.content.trim() || "—"}
                </Text>
              </View>
            )}
            {isPinned ? (
              <View style={styles.badgeTopLeft}>
                <Text style={styles.badgeIcon} accessibilityElementsHidden>
                  ★
                </Text>
              </View>
            ) : null}
            {workoutLabel ? (
              <View style={styles.badgeBottom}>
                <Text style={styles.workoutBadgeText} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  🏋 {workoutLabel}
                </Text>
              </View>
            ) : null}
            {multi ? (
              <View style={styles.badgeTopRight}>
                <Text style={styles.badgeIcon} accessibilityElementsHidden>
                  ▦
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GAP,
  },
  cell: {
    backgroundColor: "rgba(23, 23, 23, 0.95)",
    overflow: "hidden",
  },
  cellSelected: {
    borderWidth: 2,
    borderColor: AUTH.gold,
  },
  cellPressed: {
    opacity: 0.9,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  textOnly: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 6,
    gap: 4,
  },
  textOnlyLabel: {
    color: AUTH.faint,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  textOnlyBody: {
    color: AUTH.muted,
    fontSize: 10,
    lineHeight: 14,
    textAlign: "center",
  },
  badgeTopLeft: {
    position: "absolute",
    left: 4,
    top: 4,
  },
  badgeTopRight: {
    position: "absolute",
    right: 4,
    top: 4,
  },
  badgeIcon: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
    textShadowColor: "rgba(0,0,0,0.85)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  badgeBottom: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 3,
    paddingHorizontal: 4,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
  },
  workoutBadgeText: {
    color: AUTH.gold,
    fontSize: 9,
    fontWeight: "700",
    textAlign: "center",
  },
});
