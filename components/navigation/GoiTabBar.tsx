import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useWorkoutTabBadge } from "../../hooks/useWorkoutTabBadge";
import { TabDumbbellIcon, TabHomeIcon, TabProfileIcon, TabStatsIcon } from "./TabBarIcons";

const ACTIVE = AUTH.gold;
const INACTIVE = AUTH.muted;

type GoiTabBarProps = BottomTabBarProps & {
  onCreatePress: () => void;
};

type TabRouteName = "index" | "entrenamientos" | "create" | "estadisticas" | "perfil";

function routeLabel(name: TabRouteName): string {
  switch (name) {
    case "index":
      return "Inicio";
    case "entrenamientos":
      return "Entrenar";
    case "estadisticas":
      return "Estad.";
    case "perfil":
      return "Perfil";
    default:
      return "";
  }
}

export function GoiTabBar({ state, navigation, onCreatePress }: GoiTabBarProps) {
  const insets = useSafeAreaInsets();
  const workoutBadge = useWorkoutTabBadge();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {state.routes.map((route, index) => {
        const name = route.name as TabRouteName;
        const focused = state.index === index;

        if (name === "create") {
          return (
            <Pressable
              key={route.key}
              onPress={onCreatePress}
              accessibilityRole="button"
              accessibilityLabel="Crear publicación o GoI Daily"
              style={styles.tabSlot}
            >
              <View style={styles.createOuter}>
                <View style={styles.createInner}>
                  <Text style={styles.createPlus}>+</Text>
                </View>
              </View>
            </Pressable>
          );
        }

        const color = focused ? ACTIVE : INACTIVE;
        const label = routeLabel(name);

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: focused }}
            style={styles.tabSlot}
          >
            {name === "index" ? (
              <TabHomeIcon color={color} filled={focused} />
            ) : name === "entrenamientos" ? (
              <View style={styles.iconBadgeWrap}>
                <TabDumbbellIcon color={color} filled={focused} />
                {workoutBadge.visible ? (
                  <View
                    style={[styles.tabBadge, workoutBadge.liveSession ? styles.tabBadgeLive : null]}
                    accessibilityLabel={
                      workoutBadge.liveSession ? "Entrenamiento en curso" : "Rutina en borrador"
                    }
                    accessible
                  />
                ) : null}
              </View>
            ) : name === "estadisticas" ? (
              <TabStatsIcon color={color} filled={focused} />
            ) : (
              <TabProfileIcon color={color} filled={focused} />
            )}
            <Text
              style={[styles.label, { color: focused ? ACTIVE : INACTIVE }]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    paddingTop: 8,
    paddingHorizontal: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(64, 64, 64, 0.9)",
    backgroundColor: "rgba(0, 0, 0, 0.98)",
  },
  tabSlot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: 52,
    paddingBottom: 2,
    gap: 4,
  },
  iconBadgeWrap: {
    position: "relative",
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  tabBadge: {
    position: "absolute",
    top: -1,
    right: -3,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: AUTH.gold,
    borderWidth: 1.5,
    borderColor: "#0a0a0a",
  },
  tabBadgeLive: {
    backgroundColor: "rgba(134, 239, 172, 0.95)",
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  createOuter: {
    marginBottom: 2,
    padding: 2,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "rgba(212, 175, 55, 0.55)",
  },
  createInner: {
    width: 44,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(35, 32, 22, 0.98)",
  },
  createPlus: {
    color: AUTH.gold,
    fontSize: 26,
    fontWeight: "300",
    lineHeight: 28,
    marginTop: -2,
  },
});
