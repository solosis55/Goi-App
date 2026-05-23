import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";

type WorkoutFlowHeaderProps = {
  variant: "editor" | "perform";
  paddingTop: number;
  onBack: () => void;
  backLabel?: string;
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  rightSlot?: ReactNode;
  dense?: boolean;
};

export function WorkoutFlowHeader({
  paddingTop,
  onBack,
  backLabel = "Volver",
  title,
  subtitle,
  badge,
  rightSlot,
  dense,
}: WorkoutFlowHeaderProps) {
  return (
    <View style={[styles.wrap, dense ? styles.wrapDense : null, { paddingTop }]}>
      <View style={styles.row}>
        <Pressable
          onPress={onBack}
          hitSlop={10}
          style={({ pressed }) => [styles.backBtn, pressed ? workoutScreenStyles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel={backLabel}
        >
          <Text style={styles.backText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            ‹ {backLabel}
          </Text>
        </Pressable>

        <View style={styles.center}>
          {badge ? <View style={styles.badgeRow}>{badge}</View> : null}
          <Text
            style={[styles.title, dense ? styles.titleDense : null]}
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={[styles.subtitle, dense ? styles.subtitleDense : null]}
              numberOfLines={1}
              maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.right}>{rightSlot ?? <View style={styles.rightSpacer} />}</View>
      </View>
    </View>
  );
}

export function WorkoutModeBadge({ label }: { label: string }) {
  return (
    <View style={styles.modeBadge}>
      <Text style={styles.modeBadgeText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    backgroundColor: "transparent",
  },
  wrapDense: {
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 8,
    minWidth: 72,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: AUTH.gold,
  },
  center: {
    flex: 1,
    alignItems: "center",
    minWidth: 0,
    gap: 4,
    paddingTop: 2,
  },
  badgeRow: {
    marginBottom: 2,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.3,
  },
  titleDense: {
    fontSize: 16,
  },
  subtitle: {
    color: AUTH.muted,
    fontSize: 14,
    fontWeight: "500",
    maxWidth: "100%",
  },
  subtitleDense: {
    fontSize: 13,
  },
  right: {
    minWidth: 72,
    alignItems: "flex-end",
    paddingTop: 4,
  },
  rightSpacer: {
    width: 72,
  },
  modeBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.6)",
  },
  modeBadgeText: {
    color: AUTH.gold,
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
});
