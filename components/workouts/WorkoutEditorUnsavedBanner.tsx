import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type WorkoutEditorUnsavedBannerProps = {
  status: "dirty" | "saved" | "saving";
};

export function WorkoutEditorUnsavedBanner({ status }: WorkoutEditorUnsavedBannerProps) {
  if (status === "saving") {
    return (
      <View style={[styles.banner, styles.bannerSaving]}>
        <View style={[styles.dot, styles.dotSaving]} />
        <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Guardando cambios…
        </Text>
      </View>
    );
  }

  if (status === "saved") {
    return (
      <View style={[styles.banner, styles.bannerSaved]}>
        <View style={[styles.dot, styles.dotSaved]} />
        <Text style={[styles.text, styles.textSaved]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Rutina guardada
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.banner, styles.bannerDirty]}>
      <View style={[styles.dot, styles.dotDirty]} />
      <Text style={[styles.text, styles.textDirty]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Cambios sin guardar · se guardan como borrador
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 18,
    marginBottom: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  bannerDirty: {
    borderColor: "rgba(251, 191, 36, 0.35)",
    backgroundColor: "rgba(48, 44, 28, 0.45)",
  },
  bannerSaved: {
    borderColor: "rgba(82, 82, 82, 0.65)",
    backgroundColor: "rgba(10, 10, 12, 0.5)",
  },
  bannerSaving: {
    borderColor: "rgba(212, 175, 55, 0.25)",
    backgroundColor: "rgba(35, 32, 22, 0.4)",
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotDirty: {
    backgroundColor: "#fbbf24",
  },
  dotSaved: {
    backgroundColor: "rgba(134, 239, 172, 0.85)",
  },
  dotSaving: {
    backgroundColor: AUTH.gold,
    opacity: 0.9,
  },
  text: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 16,
  },
  textDirty: {
    color: "#fde68a",
  },
  textSaved: {
    color: AUTH.muted,
  },
});
