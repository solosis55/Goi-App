import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER, authScreenStyles } from "../../constants/authUi";
import { WORKOUT_EXERCISES_MAX } from "../../constants/workoutFormLimits";
import type { Exercise } from "../../types/exercise";

type WorkoutQuickAddBarProps = {
  catalog: Exercise[];
  selectedIds: Set<string>;
  slotsLeft: number;
  disabled?: boolean;
  onPick: (exerciseId: string) => void;
  onOpenCatalog: () => void;
};

export function WorkoutQuickAddBar({
  catalog,
  selectedIds,
  slotsLeft,
  disabled,
  onPick,
  onOpenCatalog,
}: WorkoutQuickAddBarProps) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return catalog
      .filter((e) => e.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [catalog, query]);

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Buscar y añadir ejercicio…"
          placeholderTextColor={AUTH.faint}
          style={styles.input}
          editable={!disabled && slotsLeft > 0}
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Búsqueda rápida de ejercicios"
        />
        <Pressable
          onPress={onOpenCatalog}
          disabled={disabled || slotsLeft <= 0}
          style={({ pressed }) => [styles.catalogBtn, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Abrir catálogo completo"
        >
          <Text style={styles.catalogBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Catálogo
          </Text>
        </Pressable>
      </View>

      {results.length > 0 ? (
        <View style={styles.results}>
          {results.map((e) => {
            const added = selectedIds.has(e.id);
            return (
              <Pressable
                key={e.id}
                onPress={() => {
                  if (added || slotsLeft <= 0) return;
                  onPick(e.id);
                  setQuery("");
                }}
                disabled={added || slotsLeft <= 0}
                style={({ pressed }) => [
                  styles.resultRow,
                  added ? styles.resultAdded : null,
                  pressed && !added ? styles.pressed : null,
                ]}
              >
                <Text style={styles.resultName} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {e.name}
                </Text>
                <Text style={styles.resultAction} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {added ? "✓" : "+"}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  input: {
    flex: 1,
    ...authScreenStyles.input,
    color: AUTH.steel,
  },
  catalogBtn: {
    ...authScreenStyles.cta,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 44,
  },
  catalogBtnText: {
    ...authScreenStyles.ctaLabel,
    fontSize: 14,
  },
  results: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AUTH.cardBorder,
    overflow: "hidden",
    backgroundColor: AUTH.cardBg,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 11,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.8)",
  },
  resultAdded: {
    opacity: 0.5,
  },
  resultName: {
    flex: 1,
    color: AUTH.neutral100,
    fontSize: 14,
    fontWeight: "600",
  },
  resultAction: {
    color: AUTH.gold,
    fontSize: 18,
    fontWeight: "700",
    width: 24,
    textAlign: "center",
  },
  pressed: {
    backgroundColor: "rgba(255, 255, 255, 0.04)",
  },
});
