import { useFocusEffect } from "expo-router";
import { useCallback } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useAuth } from "../../context/AuthContext";
import { useMutedUsers } from "../../hooks/useMutedUsers";
import { UserAvatar } from "../ui/UserAvatar";

export function SocialMutedUsersSection() {
  const router = useRouter();
  const { user } = useAuth();
  const { rows, loading, reload, unmute } = useMutedUsers(user?.id);

  useFocusEffect(
    useCallback(() => {
      void reload();
    }, [reload])
  );

  if (!loading && rows.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        No verás sus publicaciones en el feed (solo en este dispositivo).
      </Text>
      {loading ? <ActivityIndicator color={AUTH.gold} /> : null}
      {rows.map((r, index) => (
        <View key={r.id} style={[styles.row, index < rows.length - 1 ? styles.divider : null]}>
          <Pressable
            onPress={() => router.push({ pathname: "/usuario/[id]", params: { id: r.id } })}
            style={styles.main}
          >
            <UserAvatar src="" username={r.username} size={36} />
            <Text style={styles.name} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              @{r.username}
            </Text>
          </Pressable>
          <Pressable onPress={() => void unmute(r.id)} style={styles.unmute}>
            <Text style={styles.unmuteText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Dejar de silenciar
            </Text>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.5)",
    overflow: "hidden",
  },
  hint: {
    color: AUTH.muted,
    fontSize: 11,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  divider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
  },
  main: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 0,
  },
  name: {
    flex: 1,
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "600",
  },
  unmute: { paddingVertical: 4 },
  unmuteText: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
});
