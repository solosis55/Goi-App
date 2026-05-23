import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutSetTypeLabel, workoutSetTypePerformStyle } from "../../constants/workoutSetTypes";

type PerformSetTypeTriggerProps = {
  slug: string;
  disabled?: boolean;
  done?: boolean;
  emphasized?: boolean;
  onPress: () => void;
};

/**
 * Celda «Tipo» en filas de entrenamiento: glifo con color por tipo, sin tarjeta ni subtítulo.
 */
export function PerformSetTypeTrigger({
  slug,
  disabled,
  done,
  emphasized,
  onPress,
}: PerformSetTypeTriggerProps) {
  const style = workoutSetTypePerformStyle(slug);
  const isNormal = slug === "normal";
  const label = workoutSetTypeLabel(slug);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.hit,
        emphasized && !isNormal ? styles.hitEmphasized : null,
        pressed && !disabled ? styles.hitPressed : null,
        disabled ? styles.hitDisabled : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Tipo de serie: ${label}. Pulsa para cambiar.`}
      accessibilityHint="Abre el selector de tipo de serie"
    >
      <View style={styles.glyphWrap}>
        {!isNormal ? (
          <View
            style={[styles.glow, { backgroundColor: style.color }]}
            pointerEvents="none"
            accessibilityElementsHidden
          />
        ) : null}
        <Text
          style={[
            styles.glyph,
            {
              color: style.color,
              fontSize: style.fontSize,
              fontWeight: style.fontWeight,
              letterSpacing: style.letterSpacing ?? 0,
              opacity: done ? Math.min(style.opacity ?? 1, 0.38) : (style.opacity ?? 1),
            },
          ]}
          maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}
        >
          {style.glyph}
        </Text>
      </View>
    </Pressable>
  );
}

const TYPE_COL_WIDTH = 38;

export const PERFORM_SET_TYPE_COL_WIDTH = TYPE_COL_WIDTH;

const styles = StyleSheet.create({
  hit: {
    width: TYPE_COL_WIDTH,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  hitEmphasized: {
    transform: [{ scale: 1.04 }],
  },
  hitPressed: {
    opacity: 0.72,
  },
  hitDisabled: {
    opacity: 0.35,
  },
  glyphWrap: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: TYPE_COL_WIDTH,
    minHeight: 28,
  },
  glow: {
    position: "absolute",
    width: 26,
    height: 26,
    borderRadius: 13,
    opacity: 0.14,
  },
  glyph: {
    textAlign: "center",
    includeFontPadding: false,
  },
});
