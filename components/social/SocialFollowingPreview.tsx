import { useRouter } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { socialListHref } from "../../constants/socialListRoutes";
import type { SocialUserPreview } from "../../types/publicProfile";
import { UserAvatar } from "../ui/UserAvatar";

type SocialFollowingPreviewProps = {
  userId: string;
  username?: string;
  followingTotal: number;
  previews: SocialUserPreview[];
  loading?: boolean;
};

export function SocialFollowingPreview({
  userId,
  username,
  followingTotal,
  previews,
  loading,
}: SocialFollowingPreviewProps) {
  const router = useRouter();

  if (!loading && followingTotal === 0) {
    return (
      <Text style={styles.emptyHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Aún no sigues a nadie. Encuéntralos en la pestaña Buscar.
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      {loading ? <ActivityIndicator color={AUTH.gold} style={styles.loader} /> : null}
      {previews.length > 0 ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          {previews.map((u) => (
            <Pressable
              key={u.id}
              onPress={() => router.push({ pathname: "/usuario/[id]", params: { id: u.id } })}
              style={({ pressed }) => [styles.cell, pressed ? styles.pressed : null]}
              accessibilityRole="button"
              accessibilityLabel={`Ver perfil de ${u.username}`}
            >
              <UserAvatar src={u.avatarUrl} username={u.username} size={48} />
              <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                @{u.username}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {followingTotal > 0 ? (
        <Pressable
          onPress={() => router.push(socialListHref(userId, "following", username))}
          style={({ pressed }) => [styles.seeAll, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={`Ver los ${followingTotal} que sigues`}
        >
          <Text style={styles.seeAllText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Ver los {followingTotal} que sigues →
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  loader: {
    marginVertical: 8,
  },
  scroll: {
    gap: 12,
    paddingVertical: 4,
  },
  cell: {
    width: 72,
    alignItems: "center",
    gap: 6,
  },
  name: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
    maxWidth: 72,
    textAlign: "center",
  },
  seeAll: {
    alignSelf: "flex-start",
    paddingVertical: 4,
  },
  seeAllText: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  emptyHint: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  pressed: {
    opacity: 0.88,
  },
});
