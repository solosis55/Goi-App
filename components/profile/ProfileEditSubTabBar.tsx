import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { PROFILE_EDIT_SUB_TABS, type ProfileEditSubTab } from "../../constants/profileEditTabs";

type ProfileEditSubTabBarProps = {
  active: ProfileEditSubTab;
  onChange: (tab: ProfileEditSubTab) => void;
};

export function ProfileEditSubTabBar({ active, onChange }: ProfileEditSubTabBarProps) {
  return (
    <View style={styles.wrap} accessibilityRole="tablist" accessibilityLabel="Sección del perfil">
      {PROFILE_EDIT_SUB_TABS.map((tab) => {
        const selected = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [
              styles.segment,
              selected ? styles.segmentActive : null,
              pressed ? styles.segmentPressed : null,
            ]}
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
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    backgroundColor: "rgba(23, 23, 23, 0.75)",
    marginBottom: 4,
  },
  segment: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  segmentActive: {
    backgroundColor: "rgba(35, 32, 22, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  segmentPressed: {
    opacity: 0.9,
  },
  label: {
    color: AUTH.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  labelActive: {
    color: AUTH.gold,
  },
});
