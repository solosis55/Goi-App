import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { PUBLIC_PROFILE_TABS, type PublicProfileTab } from "../../constants/publicProfileTabs";

type PublicProfileTabBarProps = {
  active: PublicProfileTab;
  onChange: (tab: PublicProfileTab) => void;
};

export function PublicProfileTabBar({ active, onChange }: PublicProfileTabBarProps) {
  return (
    <View style={styles.wrap}>
      {PUBLIC_PROFILE_TABS.map((tab) => {
        const selected = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [styles.tab, pressed ? styles.pressed : null]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <Text
              style={[styles.label, selected ? styles.labelActive : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {tab.label}
            </Text>
            {selected ? <View style={styles.indicator} /> : null}
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
    borderBottomColor: "rgba(82, 82, 82, 0.45)",
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    gap: 8,
  },
  label: {
    color: AUTH.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  labelActive: {
    color: AUTH.gold,
  },
  indicator: {
    alignSelf: "stretch",
    width: "72%",
    height: 2,
    borderRadius: 1,
    backgroundColor: AUTH.gold,
    opacity: 0.9,
  },
  pressed: { opacity: 0.88 },
});
