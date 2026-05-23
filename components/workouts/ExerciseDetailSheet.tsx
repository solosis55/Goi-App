import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getExercise } from "../../api/exercises";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";
import type { Exercise } from "../../types/exercise";
import { EQUIPMENT_LABEL, MUSCLE_LABEL } from "../../utils/catalogExerciseDisplay";
import { ExerciseImageSlot } from "./ExerciseImageSlot";

type ExerciseDetailSheetProps = {
  visible: boolean;
  exercise?: Exercise;
  onClose: () => void;
};

function ChipRow({ labels }: { labels: string[] }) {
  if (labels.length === 0) return null;
  return (
    <View style={styles.chipRow}>
      {labels.map((label) => (
        <View key={label} style={styles.chip}>
          <Text style={styles.chipText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function StatsPlaceholder() {
  return (
    <View style={styles.statsBox}>
      <Text style={styles.statsIntro} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Próximamente: récords personales, volumen y frecuencia con este movimiento.
      </Text>
      <View style={styles.statsGrid}>
        {(["PR", "Volumen", "Sesiones"] as const).map((label) => (
          <View key={label} style={styles.statCell}>
            <Text style={styles.statLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {label}
            </Text>
            <Text style={styles.statValue} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              —
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ExerciseDetailSheet({ visible, exercise, onClose }: ExerciseDetailSheetProps) {
  const insets = useSafeAreaInsets();
  const [resolved, setResolved] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!visible || !exercise) {
      setResolved(null);
      setLoading(false);
      return;
    }
    setResolved(exercise);
    const needsFetch = !exercise.description?.trim() && !exercise.instructions?.trim();
    if (!needsFetch) return;

    let cancelled = false;
    setLoading(true);
    getExercise(exercise.id)
      .then((full) => {
        if (!cancelled) setResolved(full);
      })
      .catch(() => {
        if (!cancelled) setResolved(exercise);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [visible, exercise?.id]);

  const ex = resolved;
  if (!visible || !ex) return null;

  const muscleLabels = (ex.muscles ?? []).map((s) => MUSCLE_LABEL[s] ?? s);
  const equipmentLabels = (ex.equipmentTags ?? []).map((s) => EQUIPMENT_LABEL[s] ?? s);
  const equipmentText = ex.equipment?.trim();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar ficha" />
      <View style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}>
        <View style={workoutScreenStyles.cardGlowLine} />
        <View style={styles.handle} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.imageWrap}>
            <ExerciseImageSlot imageUri={ex.imageUrl} size={120} />
          </View>
          <Text style={styles.kicker} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Ficha del movimiento
          </Text>
          <Text style={styles.name} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {ex.name}
          </Text>

          {loading ? (
            <ActivityIndicator color={AUTH.gold} style={styles.loader} />
          ) : null}

          {muscleLabels.length > 0 ? (
            <Section title="Músculos">
              <ChipRow labels={muscleLabels} />
            </Section>
          ) : null}

          {equipmentLabels.length > 0 ? (
            <Section title="Variantes de material">
              <ChipRow labels={equipmentLabels} />
            </Section>
          ) : null}

          {equipmentText ? (
            <Section title="Equipamiento habitual">
              <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {equipmentText}
              </Text>
            </Section>
          ) : null}

          {ex.description?.trim() ? (
            <Section title="Descripción">
              <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {ex.description.trim()}
              </Text>
            </Section>
          ) : null}

          {ex.instructions?.trim() ? (
            <Section title="Ejecución">
              <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {ex.instructions.trim()}
              </Text>
            </Section>
          ) : null}

          {!loading && !ex.description?.trim() && !ex.instructions?.trim() ? (
            <Text style={styles.muted} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Sin descripción ni instrucciones en el catálogo todavía.
            </Text>
          ) : null}

          <Section title="Estadísticas">
            <StatsPlaceholder />
          </Section>
        </ScrollView>
        <Pressable onPress={onClose} style={({ pressed }) => [styles.closeBtn, pressed ? styles.pressed : null]}>
          <Text style={styles.closeBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Cerrar
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: AUTH.cardBg,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderTopWidth: 1,
    borderColor: AUTH.cardBorder,
    paddingTop: 10,
    paddingHorizontal: 16,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(82, 82, 82, 0.9)",
    marginBottom: 12,
  },
  content: {
    gap: 12,
    paddingBottom: 12,
  },
  imageWrap: {
    alignSelf: "center",
  },
  kicker: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    textAlign: "center",
  },
  name: {
    color: AUTH.neutral100,
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  loader: {
    marginVertical: 8,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  body: {
    color: AUTH.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  muted: {
    color: AUTH.muted,
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipText: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
  statsBox: {
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(82, 82, 82, 0.7)",
    backgroundColor: "rgba(10, 10, 12, 0.5)",
    padding: 12,
    gap: 10,
  },
  statsIntro: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  statCell: {
    flex: 1,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(0,0,0,0.25)",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  statLabel: {
    color: AUTH.faint,
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  statValue: {
    marginTop: 4,
    color: AUTH.muted,
    fontSize: 18,
    fontWeight: "600",
  },
  closeBtn: {
    marginTop: 8,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    alignItems: "center",
  },
  closeBtnText: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
