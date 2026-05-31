import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { NotificationPrefs } from "../../utils/notificationPrefs";

type SocialNotificationPrefsRowProps = {
  prefs: NotificationPrefs;
  onChange: (prefs: NotificationPrefs) => void;
};

type MuteableType = "like" | "comment" | "follow";
const MUTEABLE: { id: MuteableType; label: string }[] = [
  { id: "like", label: "Me gusta" },
  { id: "comment", label: "Comentarios" },
  { id: "follow", label: "Seguidores" },
];

export function SocialNotificationPrefsRow({ prefs, onChange }: SocialNotificationPrefsRowProps) {
  const muted = new Set(prefs.mutedTypes);

  return (
    <View style={styles.wrap}>
      <Text style={styles.hint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Ocultar en la lista (solo este dispositivo)
      </Text>
      <View style={styles.row}>
        {MUTEABLE.map((opt) => {
            const id = opt.id;
            const isMuted = muted.has(id);
            return (
              <Pressable
                key={id}
                onPress={() => {
                  const next = new Set(muted);
                  if (isMuted) next.delete(id);
                  else next.add(id);
                  onChange({ mutedTypes: [...next] });
                }}
                style={({ pressed }) => [
                  styles.chip,
                  isMuted ? styles.chipMuted : styles.chipOn,
                  pressed ? styles.pressed : null,
                ]}
              >
                <Text
                  style={[styles.chipText, isMuted ? styles.chipTextMuted : null]}
                  maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                >
                  {isMuted ? `Sin ${opt.label.toLowerCase()}` : opt.label}
                </Text>
              </Pressable>
            );
          }
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginBottom: 8,
  },
  hint: {
    color: AUTH.faint,
    fontSize: 11,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
  },
  chipOn: {
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.5)",
  },
  chipMuted: {
    borderColor: "rgba(64, 64, 64, 0.8)",
    backgroundColor: "rgba(18, 18, 20, 0.6)",
  },
  chipText: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "600",
  },
  chipTextMuted: {
    color: AUTH.muted,
    textDecorationLine: "line-through",
  },
  pressed: { opacity: 0.88 },
});
