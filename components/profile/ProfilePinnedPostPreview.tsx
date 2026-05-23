import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { Post } from "../../types/post";
import { postThumbnailUrl } from "../../utils/postThumbnail";

type ProfilePinnedPostPreviewProps = {
  post: Post;
  onPress: () => void;
};

export function ProfilePinnedPostPreview({ post, onPress }: ProfilePinnedPostPreviewProps) {
  const thumb = postThumbnailUrl(post);
  const thumbUri = thumb ? resolveMediaUrl(thumb) : "";
  const preview = post.content.trim();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
      accessibilityRole="button"
      accessibilityLabel="Ver publicación fijada"
    >
      <View style={styles.badge}>
        <Text style={styles.badgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Fijada
        </Text>
      </View>
      {thumbUri ? (
        <Image source={{ uri: thumbUri }} style={styles.thumb} resizeMode="cover" />
      ) : (
        <View style={styles.textOnly}>
          <Text style={styles.textOnlyBody} numberOfLines={3} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {preview || "Publicación"}
          </Text>
        </View>
      )}
      {preview ? (
        <Text style={styles.caption} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {preview}
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: "rgba(18, 18, 20, 0.92)",
    overflow: "hidden",
  },
  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 2,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(10, 10, 12, 0.88)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
  },
  badgeText: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "700",
  },
  thumb: {
    width: "100%",
    height: 140,
  },
  textOnly: {
    minHeight: 100,
    padding: 16,
    justifyContent: "center",
    backgroundColor: "rgba(28, 28, 30, 0.95)",
  },
  textOnlyBody: {
    color: AUTH.neutral100,
    fontSize: 15,
    lineHeight: 22,
  },
  caption: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: AUTH.steel,
    fontSize: 13,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.92,
  },
});
