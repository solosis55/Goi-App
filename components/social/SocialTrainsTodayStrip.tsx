import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { DiscoverUser } from "../../types/auth";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { UserAvatar } from "../ui/UserAvatar";

type SocialTrainsTodayStripProps = {
  discoverUsers: DiscoverUser[];
  followingIds: string[];
};

export function SocialTrainsTodayStrip({ discoverUsers, followingIds }: SocialTrainsTodayStripProps) {
  const router = useRouter();

  const trainers = useMemo(() => {
    const set = new Set(followingIds);
    return discoverUsers
      .filter((u) => set.has(u.id) && (u.trainedThisWeek || u.activeThisWeek))
      .slice(0, 12);
  }, [discoverUsers, followingIds]);

  if (trainers.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Quién entrena esta semana
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {trainers.map((u) => (
          <Pressable
            key={u.id}
            onPress={() => router.push({ pathname: "/usuario/[id]", params: { id: u.id } })}
            style={({ pressed }) => [styles.cell, pressed ? styles.pressed : null]}
          >
            <View style={styles.ring}>
              <UserAvatar src={u.avatarUrl} username={u.username} size={44} />
              {u.trainedThisWeek ? <View style={styles.dot} /> : null}
            </View>
            <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              @{u.username}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  label: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  scroll: { gap: 12, paddingVertical: 4 },
  cell: { width: 72, alignItems: "center", gap: 6 },
  ring: {
    padding: 2,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: "rgba(74, 222, 128, 0.45)",
  },
  dot: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4ade80",
    borderWidth: 2,
    borderColor: "#0e0e10",
  },
  name: {
    color: AUTH.muted,
    fontSize: 11,
    maxWidth: 72,
    textAlign: "center",
  },
  pressed: { opacity: 0.88 },
});
