import { Image, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { WORKOUT_UI } from "../../constants/workoutScreenUi";

type ExerciseImageSlotProps = {
  /** URL remota o local cuando el catálogo exponga imagen. */
  imageUri?: string | null;
  size?: number;
};

/** Hueco para la foto del ejercicio; muestra placeholder hasta que haya `imageUri`. */
export function ExerciseImageSlot({ imageUri, size = 52 }: ExerciseImageSlotProps) {
  const radius = Math.round(size * 0.18);
  const iconSize = Math.round(size * 0.38);

  if (imageUri?.trim()) {
    return (
      <Image
        source={{ uri: imageUri.trim() }}
        style={{ width: size, height: size, borderRadius: radius }}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    );
  }

  return (
    <View
      style={[styles.placeholder, { width: size, height: size, borderRadius: radius }]}
      accessibilityLabel="Imagen del ejercicio, próximamente"
    >
      <Text
        style={[styles.icon, { fontSize: iconSize }]}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      >
        ▣
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    borderWidth: 1,
    borderColor: WORKOUT_UI.border,
    borderStyle: "dashed",
    backgroundColor: "rgba(8, 8, 10, 0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    color: AUTH.faint,
    fontWeight: "300",
    opacity: 0.75,
  },
});
