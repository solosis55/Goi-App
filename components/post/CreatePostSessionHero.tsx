import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { WorkoutSessionWithTitle } from "../../types/workoutSession";
import { formatSessionPerformedAt } from "../../utils/formatSessionDate";

type CreatePostSessionHeroProps = {
  session: WorkoutSessionWithTitle;
  onChangeSession?: () => void;
  locked?: boolean;
};

export function CreatePostSessionHero({ session, onChangeSession, locked }: CreatePostSessionHeroProps) {
  const dateLabel = formatSessionPerformedAt(session.performedAt);
  const notesPreview = session.notes?.trim().slice(0, 80);

  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Text style={styles.badgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Entreno vinculado
        </Text>
      </View>
      <Text style={styles.title} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {session.workoutTitle}
      </Text>
      {dateLabel ? (
        <Text style={styles.meta} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Sesión · {dateLabel}
        </Text>
      ) : null}
      {notesPreview ? (
        <Text style={styles.notes} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {notesPreview}
        </Text>
      ) : null}
      {onChangeSession ? (
        <Pressable
          onPress={onChangeSession}
          disabled={locked}
          style={({ pressed }) => [styles.changeBtn, pressed ? styles.pressed : null, locked ? styles.disabled : null]}
          accessibilityRole="button"
          accessibilityLabel="Cambiar sesión"
        >
          <Text style={styles.changeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Cambiar sesión
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: "rgba(35, 32, 22, 0.65)",
    gap: 6,
  },
  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: "rgba(212, 175, 55, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  badgeText: {
    color: AUTH.gold,
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 18,
    fontWeight: "700",
    lineHeight: 24,
  },
  meta: {
    color: AUTH.muted,
    fontSize: 13,
  },
  notes: {
    color: AUTH.faint,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 2,
  },
  changeBtn: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingVertical: 6,
  },
  changeText: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
