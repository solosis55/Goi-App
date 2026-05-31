import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type ChipOption<T extends string> = { id: T; label: string };

type SocialChipRowProps<T extends string> = {
  options: readonly ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SocialChipRow<T extends string>({ options, value, onChange }: SocialChipRowProps<T>) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [styles.chip, active ? styles.chipActive : null, pressed ? styles.pressed : null]}
          >
            <Text
              style={[styles.chipText, active ? styles.chipTextActive : null]}
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

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.85)",
    backgroundColor: "rgba(18, 18, 20, 0.75)",
  },
  chipActive: {
    borderColor: "rgba(212, 175, 55, 0.55)",
    backgroundColor: "rgba(35, 32, 22, 0.9)",
  },
  chipText: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: AUTH.gold,
  },
  pressed: {
    opacity: 0.88,
  },
});
