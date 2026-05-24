import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { PublicProfilePreviewPost } from "../../types/publicProfile";
import { profileFollowButtonStyles as followStyles } from "./profileFollowButtonStyles";

type ProfileRestrictedCTAProps = {
  username: string;
  following: boolean;
  followPending: boolean;
  followBusy: boolean;
  postCountTotal?: number;
  previewPosts?: PublicProfilePreviewPost[];
  unavailable?: boolean;
  onFollow: () => void;
};

function PreviewGrid({ posts }: { posts: PublicProfilePreviewPost[] }) {
  if (posts.length === 0) {
    return (
      <View style={styles.grid} accessibilityElementsHidden>
        {Array.from({ length: 6 }).map((_, i) => (
          <View key={i} style={styles.gridCell} />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.grid} accessibilityElementsHidden>
      {posts.slice(0, 3).map((p) => {
        const uri = p.media?.[0]?.url;
        return (
          <View key={p.id} style={styles.gridCell}>
            {uri ? <Image source={{ uri }} style={styles.gridImage} blurRadius={8} /> : null}
          </View>
        );
      })}
      {posts.length < 3
        ? Array.from({ length: 3 - posts.length }).map((_, i) => <View key={`empty-${i}`} style={styles.gridCell} />)
        : null}
    </View>
  );
}

export function ProfileRestrictedCTA({
  username,
  following,
  followPending,
  followBusy,
  postCountTotal,
  previewPosts = [],
  unavailable = false,
  onFollow,
}: ProfileRestrictedCTAProps) {
  const handle = username.trim() || "usuario";

  if (unavailable) {
    return (
      <View style={styles.wrap}>
        <View style={styles.content}>
          <Text style={styles.lockIcon} accessibilityElementsHidden>
            🔒
          </Text>
          <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Perfil no disponible
          </Text>
          <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            @{handle} ha limitado quién puede ver su perfil.
          </Text>
        </View>
      </View>
    );
  }

  const followLabel = followBusy ? "…" : followPending ? "Solicitado" : following ? "Siguiendo" : "Seguir";

  return (
    <View style={styles.wrap}>
      <PreviewGrid posts={previewPosts} />
      <View style={styles.content}>
        <Text style={styles.lockIcon} accessibilityElementsHidden>
          🔒
        </Text>
        <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Perfil privado
        </Text>
        <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {followPending
            ? `Tu solicitud para seguir a @${handle} está pendiente.`
            : `Sigue a @${handle} para ver publicaciones, sesiones y más.`}
        </Text>
        {postCountTotal != null && postCountTotal > 0 ? (
          <Text style={styles.countHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {postCountTotal} publicaciones
          </Text>
        ) : null}
        <Pressable
          onPress={onFollow}
          disabled={followBusy || following || followPending}
          style={({ pressed }) => [
            followStyles.base,
            styles.btn,
            following || followPending ? followStyles.following : followStyles.primary,
            pressed ? followStyles.pressed : null,
            followBusy ? followStyles.busy : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={followLabel}
        >
          <Text
            style={following || followPending ? followStyles.textFollowing : followStyles.textPrimary}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {followLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.22)",
    backgroundColor: "rgba(18, 18, 20, 0.92)",
    overflow: "hidden",
  },
  grid: {
    flexDirection: "row",
    gap: 3,
    padding: 3,
    opacity: 0.5,
  },
  gridCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 4,
    backgroundColor: "rgba(64, 64, 64, 0.85)",
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  content: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 20,
    marginTop: -4,
  },
  lockIcon: {
    fontSize: 28,
    opacity: 0.85,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "700",
  },
  body: {
    color: AUTH.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  countHint: {
    color: AUTH.faint,
    fontSize: 12,
  },
  btn: {
    marginTop: 6,
    minWidth: 140,
  },
});
