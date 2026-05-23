import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import {
  PROFILE_POSTS_FILTERS,
  PROFILE_POSTS_SOURCE_TABS,
  type ProfilePostsFilter,
  type ProfilePostsSourceTab,
} from "../../constants/profilePosts";

type ProfilePostsToolbarProps = {
  sourceTab: ProfilePostsSourceTab;
  onSourceTabChange: (tab: ProfilePostsSourceTab) => void;
  filter: ProfilePostsFilter;
  onFilterChange: (filter: ProfilePostsFilter) => void;
};

export function ProfilePostsToolbar({
  sourceTab,
  onSourceTabChange,
  filter,
  onFilterChange,
}: ProfilePostsToolbarProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.sourceRow}>
        {PROFILE_POSTS_SOURCE_TABS.map((tab) => {
          const selected = sourceTab === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => onSourceTabChange(tab.id)}
              style={({ pressed }) => [
                styles.sourceTab,
                selected ? styles.sourceTabActive : null,
                pressed ? styles.pressed : null,
              ]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <Text
                style={[styles.sourceLabel, selected ? styles.sourceLabelActive : null]}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.filterRow}>
        {PROFILE_POSTS_FILTERS.map((f) => {
          const selected = filter === f.id;
          return (
            <Pressable
              key={f.id}
              onPress={() => onFilterChange(f.id)}
              style={({ pressed }) => [
                styles.filterChip,
                selected ? styles.filterChipActive : null,
                pressed ? styles.pressed : null,
              ]}
            >
              <Text
                style={[styles.filterText, selected ? styles.filterTextActive : null]}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              >
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    gap: 10,
  },
  sourceRow: {
    flexDirection: "row",
    gap: 8,
  },
  sourceTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(23, 23, 23, 0.5)",
  },
  sourceTabActive: {
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.85)",
  },
  sourceLabel: {
    color: AUTH.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  sourceLabelActive: {
    color: AUTH.gold,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.9)",
  },
  filterChipActive: {
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: "rgba(35, 32, 22, 0.6)",
  },
  filterText: {
    color: AUTH.faint,
    fontSize: 12,
    fontWeight: "600",
  },
  filterTextActive: {
    color: AUTH.gold,
  },
  pressed: {
    opacity: 0.88,
  },
});
