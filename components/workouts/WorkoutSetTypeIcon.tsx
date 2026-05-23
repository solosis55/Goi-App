import { StyleSheet, Text, type TextStyle } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutSetTypeIcon, workoutSetTypeLabel } from "../../constants/workoutSetTypes";

type WorkoutSetTypeIconProps = {
  slug: string;
  size?: "sm" | "md" | "lg";
  style?: TextStyle;
};

const SIZE_STYLES = {
  sm: { fontSize: 12, fontWeight: "800" as const },
  md: { fontSize: 15, fontWeight: "800" as const },
  lg: { fontSize: 20, fontWeight: "800" as const },
};

/** Icono de una letra/símbolo según el tipo de serie (p. ej. W = calentamiento). */
function variantStyle(slug: string, size: WorkoutSetTypeIconProps["size"]) {
  if (slug === "calentamiento" && size !== "sm") return styles.warmup;
  if (slug === "amrap") return size === "sm" ? styles.amrapSm : styles.amrap;
  if (slug === "rest_pause") return styles.restPause;
  return null;
}

export function WorkoutSetTypeIcon({ slug, size = "md", style }: WorkoutSetTypeIconProps) {
  const label = workoutSetTypeLabel(slug);
  const glyph = workoutSetTypeIcon(slug);

  return (
    <Text
      style={[styles.base, SIZE_STYLES[size], variantStyle(slug, size), style]}
      maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      accessibilityLabel={label}
      numberOfLines={1}
      adjustsFontSizeToFit
      minimumFontScale={0.65}
    >
      {glyph}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: "#d4d4d4",
    textAlign: "center",
    includeFontPadding: false,
  },
  warmup: {
    fontSize: 18,
    letterSpacing: -0.5,
  },
  amrap: {
    fontSize: 9,
    letterSpacing: -0.4,
  },
  amrapSm: {
    fontSize: 8,
    letterSpacing: -0.3,
  },
  restPause: {
    fontSize: 12,
    letterSpacing: -0.2,
  },
});
