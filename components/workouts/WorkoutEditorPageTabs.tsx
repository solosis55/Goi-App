import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH } from "../../constants/authUi";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

export type WorkoutEditorPage = "routine" | "catalog";

type WorkoutEditorPageTabsProps = {
  active: WorkoutEditorPage;
  onRoutine: () => void;
  onCatalog: () => void;
  exerciseCount?: number;
};

const TABS: { id: WorkoutEditorPage; label: string }[] = [
  { id: "routine", label: "Rutina" },
  { id: "catalog", label: "Catálogo" },
];

export function WorkoutEditorPageTabs({
  active,
  onRoutine,
  onCatalog,
  exerciseCount,
}: WorkoutEditorPageTabsProps) {
  return (
    <View style={styles.wrap}>
      <View style={workoutScreenStyles.tabBar} accessibilityRole="tablist">
        {TABS.map((tab) => {
          const selected = active === tab.id;
          const label =
            tab.id === "catalog" && typeof exerciseCount === "number"
              ? `${tab.label} (${exerciseCount})`
              : tab.label;

          return (
            <Pressable
              key={tab.id}
              onPress={tab.id === "routine" ? onRoutine : onCatalog}
              style={({ pressed }) => [workoutScreenStyles.tab, pressed ? workoutScreenStyles.pressed : null]}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
            >
              <Text
                style={[workoutScreenStyles.tabText, selected ? workoutScreenStyles.tabTextActive : null]}
                maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                numberOfLines={1}
              >
                {label}
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
      <View style={styles.dots} accessibilityElementsHidden>
        <View style={[styles.dot, active === "routine" ? styles.dotActive : null]} />
        <View style={[styles.dot, active === "catalog" ? styles.dotActive : null]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 4,
    gap: 6,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(82, 82, 82, 0.9)",
  },
  dotActive: {
    backgroundColor: AUTH.gold,
    width: 14,
    opacity: 0.85,
  },
});
