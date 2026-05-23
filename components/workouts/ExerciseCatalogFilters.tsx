import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { exerciseCatalogStyles as s } from "../../constants/exerciseCatalogUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";
import { ExerciseCatalogFilterChips } from "./ExerciseCatalogFilterChips";

type ChipOption = { slug: string; label: string };

type ExerciseCatalogFiltersProps = {
  muscleOptions: readonly ChipOption[];
  equipmentOptions: readonly ChipOption[];
  muscleSlugs: string[];
  equipmentSlugs: string[];
  onToggleMuscle: (slug: string) => void;
  onToggleEquipment: (slug: string) => void;
  onClearMuscles: () => void;
  onClearEquipment: () => void;
  /** En editor embebido: panel colapsable por defecto. */
  compact?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

export function ExerciseCatalogFilters({
  muscleOptions,
  equipmentOptions,
  muscleSlugs,
  equipmentSlugs,
  onToggleMuscle,
  onToggleEquipment,
  onClearMuscles,
  onClearEquipment,
  compact = false,
  onExpandedChange,
}: ExerciseCatalogFiltersProps) {
  const [open, setOpen] = useState(!compact);

  const setOpenState = (next: boolean) => {
    setOpen(next);
    onExpandedChange?.(next);
  };
  const activeCount = muscleSlugs.length + equipmentSlugs.length;

  if (!compact) {
    return (
      <View style={{ gap: 10 }}>
        <ExerciseCatalogFilterChips
          title="Músculo"
          options={muscleOptions}
          activeSlugs={muscleSlugs}
          onToggle={onToggleMuscle}
          onClear={onClearMuscles}
        />
        <ExerciseCatalogFilterChips
          title="Material"
          options={equipmentOptions}
          activeSlugs={equipmentSlugs}
          onToggle={onToggleEquipment}
          onClear={onClearEquipment}
        />
      </View>
    );
  }

  return (
    <View style={s.filterPanel}>
      <View style={s.filterPanelHead}>
        <Pressable
          onPress={() => setOpenState(!open)}
          style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 8 }}
          accessibilityRole="button"
          accessibilityState={{ expanded: open }}
          accessibilityLabel={open ? "Ocultar filtros" : "Mostrar filtros"}
        >
          <Text style={workoutScreenStyles.exerciseBlockFieldLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Filtros
          </Text>
          {activeCount > 0 ? (
            <View style={s.filterBadge}>
              <Text style={s.filterBadgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                {activeCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
        {activeCount > 0 ? (
          <Pressable
            onPress={() => {
              onClearMuscles();
              onClearEquipment();
            }}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Quitar todos los filtros"
          >
            <Text style={workoutScreenStyles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Limpiar
            </Text>
          </Pressable>
        ) : null}
        <Pressable
          onPress={() => setOpenState(!open)}
          style={s.expandBtn}
          accessibilityRole="button"
          accessibilityLabel={open ? "Contraer filtros" : "Expandir filtros"}
        >
          <Text
            style={[s.expandIcon, open ? s.expandIconOpen : null]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {open ? "−" : "+"}
          </Text>
        </Pressable>
      </View>

      {open ? (
        <View style={s.filterPanelBody}>
          <ExerciseCatalogFilterChips
            title="Músculo"
            options={muscleOptions}
            activeSlugs={muscleSlugs}
            onToggle={onToggleMuscle}
            onClear={onClearMuscles}
          />
          <ExerciseCatalogFilterChips
            title="Material"
            options={equipmentOptions}
            activeSlugs={equipmentSlugs}
            onToggle={onToggleEquipment}
            onClear={onClearEquipment}
          />
        </View>
      ) : null}
    </View>
  );
}
