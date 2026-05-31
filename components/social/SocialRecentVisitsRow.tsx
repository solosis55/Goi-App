import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { RecentProfileVisit } from "../../utils/profileRecentVisits";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { UserAvatar } from "../ui/UserAvatar";

type SocialRecentVisitsRowProps = {
  visits: RecentProfileVisit[];
};

export function SocialRecentVisitsRow({ visits }: SocialRecentVisitsRowProps) {
  const router = useRouter();
  if (visits.length === 0) return null;

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
      {visits.map((v) => (
        <Pressable
          key={v.userId}
          onPress={() => router.push({ pathname: "/usuario/[id]", params: { id: v.userId } })}
          style={({ pressed }) => [styles.cell, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={`Ver perfil de ${v.username}`}
        >
          <UserAvatar src={v.avatarUrl} username={v.username} size={44} />
          <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            @{v.username}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { gap: 12, paddingVertical: 4 },
  cell: { width: 72, alignItems: "center", gap: 6 },
  name: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
    maxWidth: 72,
    textAlign: "center",
  },
  pressed: { opacity: 0.88 },
});
