import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { PostVisibility } from "../../constants/createPost";
import { visibilityLabel } from "../../utils/visibilityStyles";
import { UserAvatar } from "../ui/UserAvatar";

type CreatePostPreviewProps = {
  username: string;
  avatarUrl?: string | null;
  content: string;
  visibility: PostVisibility;
  imageUri?: string | null;
  workoutTitle?: string | null;
  compact?: boolean;
};

export function CreatePostPreview({
  username,
  avatarUrl,
  content,
  visibility,
  imageUri,
  workoutTitle,
  compact = false,
}: CreatePostPreviewProps) {
  const previewText = content.trim() || "Tu publicación aparecerá así en el feed…";

  return (
    <View style={[styles.wrap, compact ? styles.wrapCompact : null]}>
      {!compact ? (
        <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Vista previa
        </Text>
      ) : null}
      <View style={[styles.card, compact ? styles.cardCompact : null]}>
        <View style={styles.head}>
          <UserAvatar src={avatarUrl} username={username} size={36} />
          <View style={styles.headMeta}>
            <Text style={styles.user} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              @{username}
            </Text>
            <Text style={styles.vis} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {visibilityLabel(visibility)}
            </Text>
          </View>
        </View>
        <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {previewText}
        </Text>
        {workoutTitle ? (
          <View style={styles.workoutPill}>
            <Text style={styles.workoutPillText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Sesión · {workoutTitle}
            </Text>
          </View>
        ) : null}
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[styles.previewImage, compact ? styles.previewImageCompact : null]}
            contentFit="cover"
          />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  wrapCompact: {
    gap: 0,
  },
  label: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
    backgroundColor: "rgba(18, 18, 20, 0.92)",
    padding: 12,
    gap: 10,
  },
  cardCompact: {
    padding: 10,
    gap: 8,
    borderRadius: 10,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  headMeta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  user: {
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "600",
  },
  vis: {
    color: AUTH.faint,
    fontSize: 11,
  },
  body: {
    color: AUTH.neutral100,
    fontSize: 15,
    lineHeight: 22,
  },
  workoutPill: {
    alignSelf: "flex-start",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.65)",
  },
  workoutPillText: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: 160,
    borderRadius: 10,
    backgroundColor: "#141416",
  },
  previewImageCompact: {
    height: 72,
  },
});
