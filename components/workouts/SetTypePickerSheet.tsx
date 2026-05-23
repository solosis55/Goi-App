import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, AUTH_PAD, authScreenStyles } from "../../constants/authUi";
import {
  WORKOUT_SET_TYPE_PICKER_SECTIONS,
  workoutSetTypesForMode,
  type WorkoutSetTypeOption,
} from "../../constants/workoutSetTypes";
import { WORKOUT_UI, workoutScreenStyles } from "../../constants/workoutScreenUi";
import { WorkoutSetTypeIcon } from "./WorkoutSetTypeIcon";

type SetTypePickerSheetProps = {
  visible: boolean;
  selected: string;
  onSelect: (slug: string) => void;
  onClose: () => void;
};

function SetTypeOptionRow({
  opt,
  active,
  onPress,
}: {
  opt: WorkoutSetTypeOption;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        active ? styles.rowActive : null,
        pressed ? styles.pressed : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${opt.label}. ${opt.description}`}
      accessibilityState={{ selected: active }}
    >
      <View style={styles.rowLeft}>
        <View style={[styles.iconBox, active ? styles.iconBoxActive : null]}>
          <WorkoutSetTypeIcon slug={opt.slug} size="md" />
        </View>
        <View style={styles.rowTextCol}>
          <Text
            style={[styles.rowText, active ? styles.rowTextActive : null]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {opt.label}
          </Text>
          <Text style={styles.rowDesc} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {opt.description}
          </Text>
        </View>
      </View>
      {active ? <Text style={styles.check}>✓</Text> : null}
    </Pressable>
  );
}

export function SetTypePickerSheet({ visible, selected, onSelect, onClose }: SetTypePickerSheetProps) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Cerrar" />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + 16 }]}>
        <View style={workoutScreenStyles.cardGlowLine} />
        <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Tipo de serie
        </Text>
        <Text style={styles.subtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Elige cómo registrar esta serie: por repeticiones o por tiempo de trabajo.
        </Text>
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {WORKOUT_SET_TYPE_PICKER_SECTIONS.map((section, sectionIndex) => (
            <View
              key={section.mode}
              style={sectionIndex > 0 ? styles.sectionBlock : styles.sectionBlockFirst}
            >
              <Text style={styles.sectionTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {section.title}
              </Text>
              <Text style={styles.sectionSubtitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {section.subtitle}
              </Text>
              {workoutSetTypesForMode(section.mode).map((opt) => (
                <SetTypeOptionRow
                  key={opt.slug}
                  opt={opt}
                  active={selected === opt.slug}
                  onPress={() => {
                    onSelect(opt.slug);
                    onClose();
                  }}
                />
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  sheet: {
    position: "relative",
    overflow: "hidden",
    backgroundColor: AUTH.cardBg,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    borderTopWidth: 1,
    borderColor: AUTH.cardBorder,
    paddingHorizontal: AUTH_PAD,
    paddingTop: 20,
    maxHeight: "72%",
  },
  title: {
    ...authScreenStyles.cardTitle,
    marginBottom: 6,
    paddingTop: 4,
  },
  subtitle: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  list: {
    maxHeight: 420,
  },
  sectionBlockFirst: {
    marginBottom: 4,
  },
  sectionBlock: {
    marginTop: 16,
    marginBottom: 4,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(64, 64, 64, 0.75)",
  },
  sectionTitle: {
    color: AUTH.gold,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  sectionSubtitle: {
    color: AUTH.faint,
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 10,
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    flex: 1,
    minWidth: 0,
  },
  rowTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 3,
    paddingTop: 2,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.9)",
    backgroundColor: "rgba(8, 8, 10, 0.7)",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  iconBoxActive: {
    borderColor: WORKOUT_UI.borderGold,
    backgroundColor: WORKOUT_UI.chipBgActive,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.8)",
    gap: 8,
  },
  rowActive: {
    borderColor: WORKOUT_UI.borderGold,
    backgroundColor: WORKOUT_UI.chipBgActive,
  },
  rowText: {
    color: AUTH.steel,
    fontSize: 15,
    fontWeight: "700",
  },
  rowTextActive: {
    color: AUTH.gold,
  },
  rowDesc: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
  },
  check: {
    color: AUTH.gold,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 4,
  },
  pressed: {
    opacity: 0.9,
  },
});
