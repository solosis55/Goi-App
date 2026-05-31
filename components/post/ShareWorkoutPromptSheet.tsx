import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { AnimatedGoldButton } from "../auth/AnimatedGoldButton";

export type ShareWorkoutPromptStats = {
  setsLabel: string;
  exercisesLabel: string;
  progressPct: number;
  volumeKg?: number;
};

type ShareWorkoutPromptSheetProps = {
  visible: boolean;
  workoutTitle: string;
  stats: ShareWorkoutPromptStats;
  onLater: () => void;
  onShare: () => void;
};

export function ShareWorkoutPromptSheet({
  visible,
  workoutTitle,
  stats,
  onLater,
  onShare,
}: ShareWorkoutPromptSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onLater}>
      <Pressable style={styles.backdrop} onPress={onLater} accessibilityLabel="Cerrar" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 12 }]}>
        <View style={styles.handle} />
        <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Sesión guardada
        </Text>
        <Text style={styles.sub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          ¿Compartir este entreno en el feed?
        </Text>

        <View style={styles.hero}>
          <Text style={styles.heroTitle} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {workoutTitle}
          </Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {stats.setsLabel}
              </Text>
              <Text style={styles.statLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Series
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {stats.exercisesLabel}
              </Text>
              <Text style={styles.statLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Ejercicios
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statValue, styles.statAccent]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {stats.progressPct}%
              </Text>
              <Text style={styles.statLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                Hecho
              </Text>
            </View>
            {stats.volumeKg != null && stats.volumeKg > 0 ? (
              <View style={styles.stat}>
                <Text style={styles.statValue} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {stats.volumeKg}
                </Text>
                <Text style={styles.statLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  Kg
                </Text>
              </View>
            ) : null}
          </View>
        </View>

        <AnimatedGoldButton
          label="Compartir en el feed"
          loadingLabel="Abriendo…"
          loading={false}
          onPress={onShare}
          accessibilityLabel="Compartir en el feed"
        />
        <Pressable
          onPress={onLater}
          style={({ pressed }) => [styles.laterBtn, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Más tarde"
        >
          <Text style={styles.laterText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Más tarde
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    backgroundColor: "#0c0c0e",
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(82, 82, 82, 0.55)",
    paddingHorizontal: 20,
    paddingTop: 10,
    gap: 14,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(115, 115, 115, 0.65)",
    marginBottom: 4,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  sub: {
    color: AUTH.muted,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginTop: -6,
  },
  hero: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.55)",
    gap: 12,
  },
  heroTitle: {
    color: AUTH.gold,
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: 8,
  },
  stat: {
    alignItems: "center",
    minWidth: 64,
    gap: 2,
  },
  statValue: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "700",
  },
  statAccent: {
    color: AUTH.gold,
  },
  statLabel: {
    color: AUTH.faint,
    fontSize: 11,
  },
  laterBtn: {
    alignItems: "center",
    paddingVertical: 12,
  },
  laterText: {
    color: AUTH.muted,
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
  },
});
