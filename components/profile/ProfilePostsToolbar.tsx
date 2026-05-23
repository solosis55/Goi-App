import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
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

function ProfilePostsGridIcon({ size = 24, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <Path
        d="M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 13h6v6H4v-6zm10 0h6v6h-6v-6z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ProfilePostsBookmarkIcon({ size = 24, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <Path
        d="M6 4h12v17l-6-4-6 4V4z"
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function ProfilePostsToolbar({
  sourceTab,
  onSourceTabChange,
  filter,
  onFilterChange,
}: ProfilePostsToolbarProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.sourceTablist} accessibilityRole="tablist" accessibilityLabel="Vista de publicaciones">
        {PROFILE_POSTS_SOURCE_TABS.map((tab) => {
          const selected = sourceTab === tab.id;
          const color = selected ? AUTH.gold : AUTH.muted;
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
              accessibilityLabel={tab.id === "mine" ? "Mis publicaciones" : "Guardados"}
            >
              {tab.id === "mine" ? (
                <ProfilePostsGridIcon color={color} />
              ) : (
                <ProfilePostsBookmarkIcon color={color} />
              )}
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
        <Text style={styles.filterKicker} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Filtro
        </Text>
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
    paddingTop: 8,
    paddingBottom: 8,
    gap: 12,
  },
  sourceTablist: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 48,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: AUTH.cardBorder,
    paddingBottom: 8,
  },
  sourceTab: {
    alignItems: "center",
    paddingTop: 8,
    paddingHorizontal: 12,
    minWidth: 72,
    minHeight: 44,
    borderTopWidth: 2,
    borderTopColor: "transparent",
    gap: 4,
  },
  sourceTabActive: {
    borderTopColor: AUTH.gold,
  },
  sourceLabel: {
    color: AUTH.muted,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  sourceLabelActive: {
    color: AUTH.gold,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
  },
  filterKicker: {
    color: AUTH.faint,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.9)",
  },
  filterChipActive: {
    borderColor: "rgba(212, 175, 55, 0.45)",
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
