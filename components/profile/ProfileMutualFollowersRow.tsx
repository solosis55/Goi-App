import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { resolveMediaUrl } from "../../api/config";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { SocialUserPreview } from "../../types/publicProfile";
import { UserAvatar } from "../ui/UserAvatar";

type ProfileMutualFollowersRowProps = {
  mutuals: SocialUserPreview[];
  totalCount?: number;
};

export function ProfileMutualFollowersRow({ mutuals, totalCount }: ProfileMutualFollowersRowProps) {
  const router = useRouter();
  if (mutuals.length === 0) return null;

  const count = totalCount ?? mutuals.length;
  const label =
    count === 1 ? "1 seguidor en común" : `${count} seguidores en común`;

  return (
    <Pressable
      style={({ pressed }) => [styles.wrap, pressed ? styles.pressed : null]}
      onPress={() => {
        if (mutuals[0]) router.push(`/usuario/${mutuals[0].id}`);
      }}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.avatars}>
        {mutuals.slice(0, 3).map((u, i) => (
          <View key={u.id} style={[styles.avatarWrap, i > 0 ? { marginLeft: -12 } : null]}>
            <UserAvatar
              src={u.avatarUrl ? resolveMediaUrl(u.avatarUrl) : ""}
              username={u.username}
              size={28}
            />
          </View>
        ))}
      </View>
      <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    borderWidth: 1,
    borderColor: "rgba(82, 82, 82, 0.4)",
  },
  avatars: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarWrap: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: AUTH.bg,
  },
  text: {
    color: AUTH.steel,
    fontSize: 12,
    fontWeight: "600",
    flex: 1,
  },
  pressed: { opacity: 0.88 },
});
