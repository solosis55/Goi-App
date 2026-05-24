import { Pressable, ScrollView, StyleSheet, Text } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { FEED_CONTENT_FILTERS, type FeedContentFilter } from "../../constants/feedContentFilter";

type FeedContentFiltersProps = {
  value: FeedContentFilter;
  onChange: (value: FeedContentFilter) => void;
};

export function FeedContentFilters({ value, onChange }: FeedContentFiltersProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      accessibilityRole="tablist"
    >
      {FEED_CONTENT_FILTERS.map((chip) => {
        const active = chip.id === value;
        return (
          <Pressable
            key={chip.id}
            onPress={() => onChange(chip.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={chip.label}
            style={({ pressed }) => [
              styles.chip,
              active ? styles.chipActive : null,
              pressed ? styles.chipPressed : null,
            ]}
          >
            <Text
              style={[styles.chipText, active ? styles.chipTextActive : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {chip.label}
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
    paddingBottom: 4,
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
  chipPressed: {
    opacity: 0.88,
  },
  chipText: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: AUTH.gold,
  },
});
