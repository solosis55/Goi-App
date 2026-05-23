import { Pressable, ScrollView, Text } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { exerciseCatalogStyles as s } from "../../constants/exerciseCatalogUi";
import { CATALOG_SORT_OPTIONS, type CatalogSortMode } from "../../utils/catalogExerciseSort";

type ExerciseCatalogSortBarProps = {
  value: CatalogSortMode;
  onChange: (mode: CatalogSortMode) => void;
};

export function ExerciseCatalogSortBar({ value, onChange }: ExerciseCatalogSortBarProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={s.sortRow}
    >
      <Text style={s.sortLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Orden
      </Text>
      {CATALOG_SORT_OPTIONS.map((opt) => {
        const active = value === opt.mode;
        return (
          <Pressable
            key={opt.mode}
            onPress={() => onChange(opt.mode)}
            style={[s.sortChip, active ? s.sortChipActive : null]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[s.sortChipText, active ? s.sortChipTextActive : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
