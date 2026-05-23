import { useEffect, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { allowsUnilateralWithEquipment } from "../../constants/equipmentLaterality";
import { equipmentLabel } from "../../constants/exerciseEquipment";
import { workoutScreenStyles, WORKOUT_UI } from "../../constants/workoutScreenUi";
import type { Exercise } from "../../types/exercise";
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

export type ExerciseBlockMeta = {
  laterality?: "bilateral" | "unilateral";
  equipmentSlug?: string;
};

export function formatExerciseMetaSummary(block: ExerciseBlockMeta): string {
  const lat = (block.laterality ?? "bilateral") === "unilateral" ? "Unilateral" : "Bilateral";
  const equip = equipmentLabel(block.equipmentSlug);
  return equip ? `${lat} · ${equip}` : lat;
}

type ExerciseBlockMetaChipsProps = {
  block: ExerciseBlockMeta;
  exercise?: Exercise;
  disabled?: boolean;
  onLaterality: (lat: "bilateral" | "unilateral") => void;
  onEquipment: (slug: string) => void;
  onSanitizeEquipment?: (slug: string) => void;
  onSanitizeLaterality?: (lat: "bilateral" | "unilateral") => void;
  equipmentSectionLabel?: string;
  /** Botones al final de la fila Bilateral / Unilateral (p. ej. reordenar o quitar). */
  latRowTrailing?: ReactNode;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  summary?: string;
};

export function ExerciseBlockMetaChips({
  block,
  exercise,
  disabled,
  onLaterality,
  onEquipment,
  onSanitizeEquipment,
  onSanitizeLaterality,
  equipmentSectionLabel = "Material",
  latRowTrailing,
  collapsible = false,
  collapsed: collapsedProp,
  onCollapsedChange,
  summary: summaryProp,
}: ExerciseBlockMetaChipsProps) {
  const equipmentSlug = block.equipmentSlug ?? "";
  const lat = block.laterality ?? "bilateral";
  const summary = summaryProp ?? formatExerciseMetaSummary(block);
  const collapsed = collapsedProp ?? true;
  const equipmentOpts = equipmentOptionsForExercise(exercise);
  const restricted = exerciseHasEquipmentRestrictions(exercise);
  const unilateralAllowed = allowsUnilateralWithEquipment(equipmentSlug);
  const latHint = lateralityRestrictionHint(equipmentSlug);

  useEffect(() => {
    if (!exercise || !onSanitizeEquipment) return;
    const current = block.equipmentSlug ?? "";
    if (isEquipmentSlugAllowed(current, exercise)) return;
    onSanitizeEquipment(sanitizeEquipmentSlug(current, exercise));
  }, [exercise?.id, block.equipmentSlug, exercise, onSanitizeEquipment]);

  useEffect(() => {
    if (!onSanitizeLaterality) return;
    const fixed = sanitizeLaterality(block.laterality, equipmentSlug, exercise);
    if ((block.laterality ?? "bilateral") === fixed) return;
    onSanitizeLaterality(fixed);
  }, [equipmentSlug, block.laterality, exercise, onSanitizeLaterality]);

  const toggleCollapsed = () => {
    onCollapsedChange?.(!collapsed);
  };

  const chips = (
    <>
      {restricted ? (
        <Text style={styles.restrictedHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Variantes del movimiento
        </Text>
      ) : null}
      <Text style={workoutScreenStyles.exerciseBlockFieldLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {equipmentSectionLabel}
      </Text>
      <View style={styles.equipmentRow}>
        {equipmentOpts.map((opt) => {
          const active = block.equipmentSlug === opt.slug;
          return (
            <Pressable
              key={opt.slug}
              onPress={() => {
                if (restricted && !isEquipmentSlugAllowed(opt.slug, exercise)) return;
                onEquipment(opt.slug);
              }}
              disabled={disabled}
              style={({ pressed }) => [
                workoutScreenStyles.chip,
                active ? workoutScreenStyles.chipActive : null,
                pressed ? workoutScreenStyles.pressed : null,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={opt.label}
            >
              <Text
                style={[
                  workoutScreenStyles.chipText,
                  active ? workoutScreenStyles.chipTextActive : null,
                ]}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {latHint ? (
        <Text style={styles.restrictedHint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {latHint}
        </Text>
      ) : null}
      <Text style={workoutScreenStyles.exerciseBlockFieldLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Lado
      </Text>
      <View style={styles.latRow}>
        <Pressable
          onPress={() => onLaterality("bilateral")}
          disabled={disabled}
          style={({ pressed }) => [
            workoutScreenStyles.chip,
            lat === "bilateral" ? workoutScreenStyles.chipActive : null,
            pressed ? workoutScreenStyles.pressed : null,
          ]}
          accessibilityRole="button"
          accessibilityState={{ selected: lat === "bilateral" }}
        >
          <Text
            style={[
              workoutScreenStyles.chipText,
              lat === "bilateral" ? workoutScreenStyles.chipTextActive : null,
            ]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            Bilateral
          </Text>
        </Pressable>
        {unilateralAllowed ? (
          <Pressable
            onPress={() => {
              if (!isLateralityAllowed("unilateral", equipmentSlug, exercise)) return;
              onLaterality("unilateral");
            }}
            disabled={disabled}
            style={({ pressed }) => [
              workoutScreenStyles.chip,
              lat === "unilateral" ? workoutScreenStyles.chipActive : null,
              pressed ? workoutScreenStyles.pressed : null,
            ]}
            accessibilityRole="button"
            accessibilityState={{ selected: lat === "unilateral" }}
          >
            <Text
              style={[
                workoutScreenStyles.chipText,
                lat === "unilateral" ? workoutScreenStyles.chipTextActive : null,
              ]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              Unilateral
            </Text>
          </Pressable>
        ) : null}
        {latRowTrailing ? <View style={styles.latRowTrailing}>{latRowTrailing}</View> : null}
      </View>
    </>
  );

  return (
    <View style={styles.wrap}>
      {collapsible ? (
        <Pressable
          onPress={toggleCollapsed}
          style={({ pressed }) => [styles.toggleRow, pressed ? workoutScreenStyles.pressed : null]}
          accessibilityRole="button"
          accessibilityState={{ expanded: !collapsed }}
          accessibilityLabel={collapsed ? "Mostrar lado y material" : "Ocultar lado y material"}
        >
          <Text style={styles.toggleTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Lado y material
          </Text>
          <Text style={styles.toggleSummary} numberOfLines={1} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {summary}
          </Text>
          <Text style={styles.toggleChevron} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {collapsed ? "▼" : "▲"}
          </Text>
        </Pressable>
      ) : null}
      {!collapsible || !collapsed ? chips : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: WORKOUT_UI.border,
    backgroundColor: WORKOUT_UI.chipBg,
  },
  toggleTitle: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  toggleSummary: {
    flex: 1,
    minWidth: 0,
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  toggleChevron: {
    color: AUTH.muted,
    fontSize: 11,
  },
  latRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  latRowTrailing: {
    flexDirection: "row",
    gap: 4,
    marginLeft: "auto",
  },
  equipmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  restrictedHint: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
});
