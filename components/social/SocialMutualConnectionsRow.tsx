import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DiscoverUser } from "../../types/auth";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { UserAvatar } from "../ui/UserAvatar";

type SocialMutualConnectionsRowProps = {
  discoverUsers: DiscoverUser[];
  followingIds: string[];
  currentUserId: string | undefined;
  max?: number;
};

export function SocialMutualConnectionsRow({
  discoverUsers,
  followingIds,
  currentUserId,
  max = 10,
}: SocialMutualConnectionsRowProps) {
  const router = useRouter();

  const mutuals = useMemo(() => {
    const following = new Set(followingIds);
    const map = new Map<string, { id: string; username: string; avatarUrl: string }>();
    for (const u of discoverUsers) {
      for (const m of u.mutualPreview ?? []) {
        if (m.id === currentUserId || following.has(m.id) || map.has(m.id)) continue;
        map.set(m.id, m);
      }
    }
    return [...map.values()].slice(0, max);
  }, [discoverUsers, followingIds, currentUserId, max]);

  if (mutuals.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Conexiones en común con gente que podrías seguir
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {mutuals.map((m) => (
          <Pressable
            key={m.id}
            onPress={() => router.push({ pathname: "/usuario/[id]", params: { id: m.id } })}
            style={({ pressed }) => [styles.cell, pressed ? styles.pressed : null]}
          >
            <UserAvatar src={m.avatarUrl} username={m.username} size={40} />
            <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              @{m.username}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  hint: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  scroll: { gap: 12, paddingVertical: 4 },
  cell: { width: 72, alignItems: "center", gap: 6 },
  name: {
    color: AUTH.muted,
    fontSize: 11,
    maxWidth: 72,
    textAlign: "center",
  },
  pressed: { opacity: 0.88 },
});
