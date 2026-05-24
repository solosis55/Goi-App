import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { socialListHref } from "../../constants/socialListRoutes";

type SocialNetworkRowProps = {
  userId: string;
  username?: string;
  followersTotal: number;
  followingTotal: number;
};

export function SocialNetworkRow({
  userId,
  username,
  followersTotal,
  followingTotal,
}: SocialNetworkRowProps) {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => router.push(socialListHref(userId, "followers", username))}
        style={({ pressed }) => [styles.cell, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel={`${followersTotal} seguidores`}
      >
        <Text style={styles.count} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {followersTotal}
        </Text>
        <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Seguidores
        </Text>
      </Pressable>
      <View style={styles.divider} />
      <Pressable
        onPress={() => router.push(socialListHref(userId, "following", username))}
        style={({ pressed }) => [styles.cell, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel={`${followingTotal} siguiendo`}
      >
        <Text style={styles.count} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {followingTotal}
        </Text>
        <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Siguiendo
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
    backgroundColor: "rgba(23, 23, 23, 0.55)",
    overflow: "hidden",
  },
  cell: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 14,
    gap: 4,
  },
  divider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: "rgba(82, 82, 82, 0.5)",
  },
  count: {
    color: AUTH.neutral100,
    fontSize: 20,
    fontWeight: "700",
  },
  label: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
    backgroundColor: "rgba(212, 175, 55, 0.06)",
  },
});
