import { StyleSheet, Text, View } from "react-native";
import { AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { workoutScreenStyles } from "../../constants/workoutScreenUi";
import { TabDumbbellIcon } from "../navigation/TabBarIcons";

type WorkoutHubHeroProps = {
  title?: string;
  body?: string;
  compact?: boolean;
};

export function WorkoutHubHero({
  title = "Entrenamientos",
  body = "Realiza tus rutinas serie a serie y guarda cada sesión al completarla.",
  compact,
}: WorkoutHubHeroProps) {
  if (compact) {
    return (
      <View style={styles.compactRow}>
        <View style={styles.compactIcon}>
          <TabDumbbellIcon size={22} color="#d4af37" filled />
        </View>
        <View style={styles.compactText}>
          <Text style={workoutScreenStyles.hubTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {title}
          </Text>
          <Text style={styles.compactBody} numberOfLines={2} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {body}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={workoutScreenStyles.hubCard}>
      <View style={workoutScreenStyles.cardGlowLine} />
      <View style={styles.inner}>
        <View style={workoutScreenStyles.hubIconRing}>
          <TabDumbbellIcon size={32} color="#d4af37" filled />
        </View>
        <Text style={workoutScreenStyles.hubTitle} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {title}
        </Text>
        <Text style={[workoutScreenStyles.hubBody, styles.bodyCenter]} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {body}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inner: {
    alignItems: "center",
    gap: 8,
    width: "100%",
  },
  bodyCenter: {
    textAlign: "center",
    marginTop: 0,
    marginBottom: 0,
  },
  compactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 4,
  },
  compactIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  compactText: {
    flex: 1,
    gap: 4,
  },
  compactBody: {
    color: "#a3a3a3",
    fontSize: 13,
    lineHeight: 18,
  },
});
