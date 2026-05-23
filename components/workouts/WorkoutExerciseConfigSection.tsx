import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { allowsUnilateralWithEquipment } from "../../constants/equipmentLaterality";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";
import type { Exercise } from "../../types/exercise";
import type { WorkoutExerciseBlock } from "../../types/workout";
import {
  equipmentOptionsForExercise,
  exerciseHasEquipmentRestrictions,
  isEquipmentSlugAllowed,
  sanitizeEquipmentSlug,
} from "../../utils/exerciseEquipmentLimits";
import {
  isLateralityAllowed,
  lateralityRestrictionHint,
  sanitizeLaterality,
} from "../../utils/exerciseLateralityLimits";
import { WorkoutLateralitySegment } from "./WorkoutLateralitySegment";

type WorkoutExerciseConfigSectionProps = {
  block: WorkoutExerciseBlock;
  exercise?: Exercise;
  disabled?: boolean;
  onChange: (patch: Partial<WorkoutExerciseBlock>) => void;
};

export function WorkoutExerciseConfigSection({
  block,
  exercise,
  disabled,
  onChange,
}: WorkoutExerciseConfigSectionProps) {
  const options = useMemo(() => equipmentOptionsForExercise(exercise), [exercise]);
  const restricted = exerciseHasEquipmentRestrictions(exercise);
  const equipmentSlug = block.equipmentSlug ?? "";
  const unilateralAllowed = allowsUnilateralWithEquipment(equipmentSlug);
  const latHint = lateralityRestrictionHint(equipmentSlug);

  useEffect(() => {
    if (!exercise) return;
    const current = block.equipmentSlug ?? "";
    if (isEquipmentSlugAllowed(current, exercise)) return;
    onChange({ equipmentSlug: sanitizeEquipmentSlug(current, exercise) });
  }, [exercise?.id, block.equipmentSlug, exercise, onChange]);

  useEffect(() => {
    const current = block.laterality;
    const fixed = sanitizeLaterality(current, equipmentSlug, exercise);
    if ((current ?? "bilateral") === fixed) return;
    onChange({ laterality: fixed });
  }, [equipmentSlug, block.laterality, exercise, onChange]);

  const setEquipment = (slug: string) => {
    if (restricted && !isEquipmentSlugAllowed(slug, exercise)) return;
    const nextSlug = block.equipmentSlug === slug ? "" : slug;
    const patch: Partial<WorkoutExerciseBlock> = { equipmentSlug: nextSlug };
    if (!isLateralityAllowed(block.laterality, nextSlug, exercise)) {
      patch.laterality = "bilateral";
    }
    onChange(patch);
  };

  const setLaterality = (lat: "bilateral" | "unilateral") => {
    if (!isLateralityAllowed(lat, equipmentSlug, exercise)) return;
    onChange({ laterality: lat });
  };

  return (
    <View style={styles.wrap}>
      <Text style={workoutScreenStyles.exerciseBlockFieldLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Configuración
      </Text>

      <View style={styles.materialHead}>
        <Text style={styles.materialLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Material
        </Text>
        {restricted ? (
          <Text style={styles.materialHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Variantes del movimiento
          </Text>
        ) : null}
      </View>

      {options.length === 0 ? (
        <Text style={styles.emptyHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Sin variantes de material definidas.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.chipsRow}
        >
          {options.map((opt) => {
            const active = block.equipmentSlug === opt.slug;
            return (
              <Pressable
                key={opt.slug}
                onPress={() => setEquipment(opt.slug)}
                disabled={disabled}
                style={({ pressed }) => [
                  workoutScreenStyles.chip,
                  active ? workoutScreenStyles.chipActive : null,
                  pressed ? workoutScreenStyles.pressed : null,
                ]}
              >
                <Text
                  style={[workoutScreenStyles.chipText, active ? workoutScreenStyles.chipTextActive : null]}
                  maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View style={styles.latHead}>
        <Text style={styles.materialLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Lado
        </Text>
        {latHint ? (
          <Text style={styles.materialHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {latHint}
          </Text>
        ) : null}
      </View>

      <WorkoutLateralitySegment
        value={block.laterality === "unilateral" ? "unilateral" : "bilateral"}
        disabled={disabled}
        unilateralAllowed={unilateralAllowed}
        onChange={setLaterality}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.45)",
  },
  materialHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  latHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 4,
  },
  materialLabel: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  materialHint: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
  },
  emptyHint: {
    color: AUTH.muted,
    fontSize: 12,
  },
  chipsRow: {
    gap: 6,
    paddingRight: 8,
  },
});
