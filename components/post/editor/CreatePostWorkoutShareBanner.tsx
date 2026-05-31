import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";

type CreatePostWorkoutShareBannerProps = {
  workoutTitle?: string | null;
};

export function CreatePostWorkoutShareBanner({ workoutTitle }: CreatePostWorkoutShareBannerProps) {
  const title = workoutTitle?.trim();
  return (
    <View style={styles.banner}>
      <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        {title ? `Sesión guardada · ${title}` : "Sesión guardada"}
      </Text>
      <Text style={styles.sub} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Revisa el training y pulsa Publicar cuando quieras compartirlo.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.4)",
    backgroundColor: "rgba(35, 32, 22, 0.75)",
    gap: 4,
  },
  title: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  sub: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 17,
  },
});
