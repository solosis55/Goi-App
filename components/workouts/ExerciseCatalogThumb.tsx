import { Image, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { CATALOG_UI } from "../../constants/exerciseCatalogUi";
import { exerciseCatalogInitials } from "../../utils/catalogExerciseDisplay";

type ExerciseCatalogThumbProps = {
  name: string;
  imageUri?: string | null;
  size?: number;
};

export function ExerciseCatalogThumb({ name, imageUri, size = CATALOG_UI.thumbSize }: ExerciseCatalogThumbProps) {
  const radius = Math.round(size * 0.2);
  const uri = imageUri?.trim();

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: radius }}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
    );
  }

  const initials = exerciseCatalogInitials(name);

  return (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: radius }]}>
      <View style={[styles.glow, { borderRadius: radius }]} />
      <Text style={[styles.initials, { fontSize: Math.round(size * 0.32) }]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.28)",
    backgroundColor: "rgba(14, 12, 8, 0.95)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  glow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(212, 175, 55, 0.12)",
  },
  initials: {
    color: AUTH.gold,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
