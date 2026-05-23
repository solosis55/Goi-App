import { useEffect } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useMutedUsers } from "../../hooks/useMutedUsers";

type ProfileMutedSectionProps = {
  userId: string | undefined;
  active: boolean;
};

export function ProfileMutedSection({ userId, active }: ProfileMutedSectionProps) {
  const muted = useMutedUsers(userId);

  useEffect(() => {
    if (active) void muted.reload();
  }, [active, muted.reload]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Silenciados en Inicio
      </Text>
      <Text style={styles.intro} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Cuentas que silenciaste desde el menú del feed en este dispositivo. No aparecen en tu timeline.
      </Text>

      {muted.loading ? (
        <ActivityIndicator color={AUTH.gold} style={styles.loader} />
      ) : muted.rows.length === 0 ? (
        <Text style={styles.empty} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          No hay silenciados.
        </Text>
      ) : (
        <View style={styles.list}>
          {muted.rows.map((row) => (
            <View key={row.id} style={styles.row}>
              <Text style={styles.username} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                @{row.username}
              </Text>
              <Pressable
                onPress={() => void muted.unmute(row.id)}
                style={({ pressed }) => [styles.unmuteBtn, pressed ? styles.pressed : null]}
                accessibilityRole="button"
                accessibilityLabel={`Dejar de silenciar a ${row.username}`}
              >
                <Text style={styles.unmuteText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Dejar de silenciar
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  title: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginTop: 8,
  },
  intro: {
    color: AUTH.faint,
    fontSize: 13,
    lineHeight: 19,
  },
  loader: {
    marginVertical: 12,
  },
  empty: {
    color: AUTH.muted,
    fontSize: 13,
    paddingVertical: 8,
  },
  list: {
    gap: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.8)",
    backgroundColor: "rgba(23, 23, 23, 0.45)",
  },
  username: {
    flex: 1,
    color: AUTH.steel,
    fontSize: 14,
    fontWeight: "600",
  },
  unmuteBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  unmuteText: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
