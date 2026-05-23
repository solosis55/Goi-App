import { Pressable, Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

export type WorkoutsSubTab = "routines" | "sessions";

type WorkoutsSubTabBarProps = {
  active: WorkoutsSubTab;
  onChange: (tab: WorkoutsSubTab) => void;
  routineCount?: number;
  sessionCount?: number;
};

const TABS: { id: WorkoutsSubTab; label: string }[] = [
  { id: "routines", label: "Rutinas" },
  { id: "sessions", label: "Sesiones" },
];

function tabLabel(id: WorkoutsSubTab, count?: number) {
  if (typeof count !== "number") return TABS.find((t) => t.id === id)?.label ?? id;
  const base = TABS.find((t) => t.id === id)?.label ?? id;
  return `${base} (${count})`;
}

export function WorkoutsSubTabBar({
  active,
  onChange,
  routineCount,
  sessionCount,
}: WorkoutsSubTabBarProps) {
  return (
    <View style={workoutScreenStyles.tabBar} accessibilityRole="tablist">
      {TABS.map((tab) => {
        const selected = active === tab.id;
        const count = tab.id === "routines" ? routineCount : sessionCount;

        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={({ pressed }) => [
              workoutScreenStyles.tab,
              pressed ? workoutScreenStyles.pressed : null,
            ]}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
          >
            <Text
              style={[workoutScreenStyles.tabText, selected ? workoutScreenStyles.tabTextActive : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
              numberOfLines={1}
            >
              {tabLabel(tab.id, count)}
            </Text>
            {selected ? (
              <View style={workoutScreenStyles.tabIndicator} pointerEvents="none" />
            ) : (
              <View style={workoutScreenStyles.tabIndicatorPlaceholder} pointerEvents="none" />
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
