import { useCallback, useEffect, useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { FEED_SCOPES, type FeedScope } from "../../constants/feed";

type FeedModeTabsProps = {
  mode: FeedScope;
  onChangeMode: (mode: FeedScope) => void;
};

type TabLayout = { x: number; width: number };

export function FeedModeTabs({ mode, onChangeMode }: FeedModeTabsProps) {
  const [layouts, setLayouts] = useState<Partial<Record<FeedScope, TabLayout>>>({});
  const pillX = useSharedValue(0);
  const pillW = useSharedValue(0);

  const applyPill = useCallback(
    (scope: FeedScope) => {
      const l = layouts[scope];
      if (!l) return;
      pillX.value = withTiming(l.x, { duration: 200 });
      pillW.value = withTiming(l.width, { duration: 200 });
    },
    [layouts, pillX, pillW]
  );

  const onTabLayout = useCallback(
    (scope: FeedScope, e: LayoutChangeEvent) => {
      const { x, width } = e.nativeEvent.layout;
      setLayouts((prev) => {
        const next = { ...prev, [scope]: { x, width } };
        return next;
      });
      if (scope === mode) {
        pillX.value = x;
        pillW.value = width;
      }
    },
    [mode, pillX, pillW]
  );

  const pillStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: pillX.value }],
    width: pillW.value,
  }));

  const handlePress = useCallback(
    (scope: FeedScope) => {
      onChangeMode(scope);
      applyPill(scope);
    },
    [applyPill, onChangeMode]
  );

  useEffect(() => {
    applyPill(mode);
  }, [mode, applyPill]);

  return (
    <View style={styles.wrap} accessibilityRole="tablist" accessibilityLabel="Modo del feed">
      <Animated.View style={[styles.pill, pillStyle]} pointerEvents="none" />
      {FEED_SCOPES.map((tab) => {
        const selected = mode === tab.id;
        return (
          <Pressable
            key={tab.id}
            onLayout={(e) => onTabLayout(tab.id, e)}
            onPress={() => handlePress(tab.id)}
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
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    position: "relative",
    padding: 3,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.85)",
    backgroundColor: "rgba(10, 10, 12, 0.9)",
  },
  pill: {
    position: "absolute",
    top: 3,
    bottom: 3,
    left: 0,
    borderRadius: 8,
    backgroundColor: "rgba(35, 32, 22, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 8,
    zIndex: 1,
  },
  label: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  labelActive: {
    color: AUTH.gold,
  },
  pressed: {
    opacity: 0.88,
  },
});
