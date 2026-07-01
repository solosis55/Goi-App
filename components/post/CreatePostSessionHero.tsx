import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { SessionPickerItem } from "../../types/sessionPicker";
import {
  buildSessionExercisePreviews,
  countRemainingExercises,
} from "../../utils/sessionExercisePreview";
import { PostSessionAttachment } from "./PostSessionAttachment";

type CreatePostSessionHeroProps = {
  session: SessionPickerItem;
  onPressView?: () => void;
};

export function CreatePostSessionHero({ session, onPressView }: CreatePostSessionHeroProps) {
  const snap = session.snapshot;
  const exercisePreviews = buildSessionExercisePreviews(snap, 3);
  const moreExercisesCount = countRemainingExercises(snap, exercisePreviews.length);

  return (
    <PostSessionAttachment
      workoutTitle={session.workoutTitle}
      performedAt={session.performedAt}
      sessionNotes={session.notes}
      metrics={
        snap
          ? {
              completedSets: snap.completedSets,
              totalSets: snap.totalSets,
              completedExercises: snap.completedExercises,
              totalExercises: snap.totalExercises,
            }
          : null
      }
      exercisePreviews={exercisePreviews}
      moreExercisesCount={moreExercisesCount}
      linked
      onPress={onPressView}
      showViewFullCta={Boolean(onPressView)}
    />
  );
}

type CreatePostSessionTodayCtaProps = {
  session: SessionPickerItem | null;
  loading?: boolean;
  onPress: () => void;
};

export function CreatePostSessionTodayCta({ session, loading, onPress }: CreatePostSessionTodayCtaProps) {
  if (!session && !loading) return null;
  return (
    <Pressable
      onPress={onPress}
      disabled={loading || !session}
      style={({ pressed }) => [styles.todayCta, pressed ? styles.pressed : null, loading ? styles.disabled : null]}
      accessibilityRole="button"
      accessibilityLabel="Vincular sesión de hoy"
    >
      <Text style={styles.todayEyebrow} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Acción rápida
      </Text>
      <Text style={styles.todayTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {loading ? "Buscando sesión de hoy…" : `Vincular sesión de hoy · ${session?.workoutTitle ?? ""}`}
      </Text>
      {!loading && session ? (
        <Text style={styles.todaySub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Un toque para usar tu entreno de hoy
        </Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  todayCta: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(212, 175, 55, 0.08)",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  pressed: { opacity: 0.88 },
  disabled: { opacity: 0.65 },
  todayEyebrow: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  todayTitle: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "800",
  },
  todaySub: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
});
