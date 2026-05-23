import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import type { Exercise } from "../../types/exercise";
import type { WorkoutExerciseBlock } from "../../types/workout";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

type WorkoutPreviewModalProps = {
  visible: boolean;
  title: string;
  description: string;
  blocks: WorkoutExerciseBlock[];
  catalogById: Map<string, Exercise>;
  onClose: () => void;
};

export function WorkoutPreviewModal({
  visible,
  title,
  description,
  blocks,
  catalogById,
  onClose,
}: WorkoutPreviewModalProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={[styles.root, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 16 }]}>
        <View style={styles.head}>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={workoutScreenStyles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Cerrar
            </Text>
          </Pressable>
          <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Vista previa
          </Text>
          <View style={styles.headSpacer} />
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.routineTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {title.trim() || "Sin título"}
          </Text>
          {description.trim() ? (
            <Text style={styles.desc} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              {description.trim()}
            </Text>
          ) : null}
          {blocks.map((block, i) => (
            <View key={`${block.exerciseId}-${i}`} style={styles.row}>
              <Text style={styles.exName} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {i + 1}. {catalogById.get(block.exerciseId)?.name ?? "Ejercicio"}
              </Text>
              <Text style={styles.meta} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {block.sets.length} series
              </Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: AUTH.bg,
    paddingHorizontal: 18,
  },
  head: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "600",
  },
  headSpacer: {
    width: 56,
  },
  routineTitle: {
    color: AUTH.neutral100,
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 8,
  },
  desc: {
    color: AUTH.muted,
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 16,
  },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AUTH.fieldBorder,
    gap: 4,
  },
  exName: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "600",
  },
  meta: {
    color: AUTH.faint,
    fontSize: 12,
  },
});
