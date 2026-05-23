import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { exerciseCatalogStyles as s } from "../../constants/exerciseCatalogUi";

export type ActiveFilterChip = {
  key: string;
  label: string;
  onRemove: () => void;
};

type ExerciseCatalogActiveFilterChipsProps = {
  chips: ActiveFilterChip[];
};

export function ExerciseCatalogActiveFilterChips({ chips }: ExerciseCatalogActiveFilterChipsProps) {
  if (chips.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={styles.row}
    >
      {chips.map((chip) => (
        <Pressable
          key={chip.key}
          onPress={chip.onRemove}
          style={({ pressed }) => [s.activeFilterChip, pressed ? { opacity: 0.85 } : null]}
          accessibilityRole="button"
          accessibilityLabel={`Quitar filtro ${chip.label}`}
        >
          <Text style={s.activeFilterChipText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {chip.label}
          </Text>
          <Text style={s.activeFilterChipX} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            ×
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 6,
    paddingVertical: 2,
  },
});
