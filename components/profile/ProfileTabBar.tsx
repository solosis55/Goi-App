import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { PROFILE_SECTION_TABS, type ProfileSectionTab } from "../../constants/profileTabs";
import { TabDumbbellIcon } from "../navigation/TabBarIcons";

type ProfileTabBarProps = {
  active: ProfileSectionTab;
  onChange: (tab: ProfileSectionTab) => void;
  stickyElevated?: boolean;
};

function TabIcon({
  tab,
  color,
  selected,
}: {
  tab: ProfileSectionTab;
  color: string;
  selected: boolean;
}) {
  if (tab === "posts") {
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
        <Path
          d="M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 13h6v6H4v-6zm10 0h6v6h-6v-6z"
          stroke={color}
          strokeWidth={1.75}
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  if (tab === "profile") {
    return (
      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" aria-hidden>
        <Path
          d="M12 12a4 4 0 100-8 4 4 0 000 8zM5 20a7 7 0 0114 0"
          stroke={color}
          strokeWidth={1.75}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  return <TabDumbbellIcon size={18} color={color} filled={selected} />;
}

export function ProfileTabBar({ active, onChange, stickyElevated }: ProfileTabBarProps) {
  return (
    <View style={[styles.wrap, stickyElevated ? styles.wrapSticky : null]}>
      {PROFILE_SECTION_TABS.map((tab) => {
        const selected = active === tab.id;
        const color = selected ? AUTH.gold : AUTH.muted;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [styles.tab, pressed ? styles.tabPressed : null]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
          >
            <TabIcon tab={tab.id} color={color} selected={selected} />
            <Text
              style={[styles.tabLabel, selected ? styles.tabLabelActive : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              numberOfLines={1}
            >
              {tab.shortLabel}
            </Text>
            {selected ? <View style={styles.indicator} /> : <View style={styles.indicatorPlaceholder} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    backgroundColor: AUTH.bg,
  },
  wrapSticky: {
    backgroundColor: "rgba(10, 10, 12, 0.98)",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(212, 175, 55, 0.12)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 4,
    gap: 4,
  },
  tabPressed: {
    opacity: 0.88,
  },
  tabLabel: {
    color: AUTH.muted,
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  tabLabelActive: {
    color: AUTH.gold,
  },
  indicator: {
    marginTop: 4,
    height: 2,
    width: "72%",
    maxWidth: 48,
    borderRadius: 1,
    backgroundColor: AUTH.gold,
  },
  indicatorPlaceholder: {
    marginTop: 4,
    height: 2,
    width: "72%",
    maxWidth: 48,
  },
});
