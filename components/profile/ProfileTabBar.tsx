import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { PROFILE_SECTION_TABS, type ProfileSectionTab } from "../../constants/profileTabs";

type ProfileTabBarProps = {
  active: ProfileSectionTab;
  onChange: (tab: ProfileSectionTab) => void;
};

export function ProfileTabBar({ active, onChange }: ProfileTabBarProps) {
  return (
    <View style={styles.wrap}>
      {PROFILE_SECTION_TABS.map((tab) => {
        const selected = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [styles.tab, pressed ? styles.tabPressed : null]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            accessibilityLabel={tab.label}
          >
            <Text
              style={[styles.tabLabel, selected ? styles.tabLabelActive : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              numberOfLines={1}
            >
              {tab.label}
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
    backgroundColor: AUTH.bg,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 8,
    paddingHorizontal: 4,
  },
  tabPressed: {
    opacity: 0.88,
  },
  tabLabel: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  tabLabelActive: {
    color: AUTH.gold,
  },
  indicator: {
    marginTop: 8,
    height: 2,
    width: "72%",
    maxWidth: 56,
    borderRadius: 1,
    backgroundColor: AUTH.gold,
  },
  indicatorPlaceholder: {
    marginTop: 8,
    height: 2,
    width: "72%",
    maxWidth: 56,
  },
});
