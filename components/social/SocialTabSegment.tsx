import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

export type SocialTabSegmentId = "hub" | "discover" | "activity";

const OPTIONS: { id: SocialTabSegmentId; label: string }[] = [
  { id: "hub", label: "Inicio" },
  { id: "discover", label: "Buscar" },
  { id: "activity", label: "Actividad" },
];

type SocialTabSegmentProps = {
  value: SocialTabSegmentId;
  onChange: (id: SocialTabSegmentId) => void;
  activityBadge?: number;
  requestsBadge?: number;
};

export function SocialTabSegment({
  value,
  onChange,
  activityBadge = 0,
  requestsBadge = 0,
}: SocialTabSegmentProps) {
  return (
    <View style={styles.wrap}>
      {OPTIONS.map((opt) => {
        const active = value === opt.id;
        const badge =
          opt.id === "activity" ? activityBadge + requestsBadge : opt.id === "hub" ? requestsBadge : 0;
        return (
          <Pressable
            key={opt.id}
            onPress={() => onChange(opt.id)}
            style={({ pressed }) => [styles.tab, active ? styles.tabActive : null, pressed ? styles.pressed : null]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text
              style={[styles.label, active ? styles.labelActive : null]}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {opt.label}
            </Text>
            {badge > 0 ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
                  {badge > 9 ? "9+" : badge}
                </Text>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 4,
    borderRadius: 12,
    backgroundColor: "rgba(18, 18, 20, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabActive: {
    backgroundColor: "rgba(35, 32, 22, 0.95)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
  },
  label: {
    color: AUTH.muted,
    fontSize: 14,
    fontWeight: "600",
  },
  labelActive: {
    color: AUTH.gold,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: AUTH.danger,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  pressed: { opacity: 0.9 },
});
