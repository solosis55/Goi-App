import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { PROFILE_EDIT_SUB_TABS, type ProfileEditSubTab } from "../../constants/profileEditTabs";

type ProfileEditSubTabBarProps = {
  active: ProfileEditSubTab;
  onChange: (tab: ProfileEditSubTab) => void;
};

/** Misma jerarquía visual que las pestañas principales del perfil. */
export function ProfileEditSubTabBar({ active, onChange }: ProfileEditSubTabBarProps) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist" accessibilityLabel="Sección del perfil">
      {PROFILE_EDIT_SUB_TABS.map((tab) => {
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
              style={[styles.label, selected ? styles.labelActive : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
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
    marginBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(64, 64, 64, 0.65)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  tabPressed: {
    opacity: 0.88,
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
    marginTop: 8,
    height: 2,
    width: "70%",
    maxWidth: 64,
    borderRadius: 1,
    backgroundColor: AUTH.gold,
  },
  indicatorPlaceholder: {
    marginTop: 8,
    height: 2,
    width: "70%",
    maxWidth: 64,
  },
});
