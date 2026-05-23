import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

type ChipOption = { slug: string; label: string };

type ExerciseCatalogFilterChipsProps = {
  title: string;
  options: readonly ChipOption[];
  activeSlugs: string[];
  onToggle: (slug: string) => void;
  onClear?: () => void;
};

export function ExerciseCatalogFilterChips({
  title,
  options,
  activeSlugs,
  onToggle,
  onClear,
}: ExerciseCatalogFilterChipsProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={workoutScreenStyles.exerciseBlockFieldLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {title}
        </Text>
        {activeSlugs.length > 0 && onClear ? (
          <Pressable onPress={onClear} hitSlop={8} accessibilityRole="button" accessibilityLabel={`Quitar filtros de ${title}`}>
            <Text style={workoutScreenStyles.linkText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Limpiar
            </Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.chipsRow}
      >
        {options.map((opt) => {
          const active = activeSlugs.includes(opt.slug);
          return (
            <Pressable
              key={opt.slug}
              onPress={() => onToggle(opt.slug)}
              style={({ pressed }) => [
                workoutScreenStyles.chip,
                active ? workoutScreenStyles.chipActive : null,
                pressed ? workoutScreenStyles.pressed : null,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
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
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  chipsRow: {
    gap: 6,
    paddingRight: 4,
  },
});
