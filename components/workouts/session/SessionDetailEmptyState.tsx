import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../../constants/authUi";
import { workoutScreenStyles } from "../../../constants/workoutScreenUi";
import { TabDumbbellIcon } from "../../navigation/TabBarIcons";

export function SessionDetailEmptyState({ notesPreview }: { notesPreview?: string }) {
  return (
    <View style={styles.card}>
      <View style={workoutScreenStyles.cardGlowLine} />
      <View style={styles.iconRing}>
        <TabDumbbellIcon size={28} color={AUTH.gold} filled />
      </View>
      <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Sin detalle por ejercicio
      </Text>
      <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Esta sesión se guardó antes del registro detallado o sin snapshot. Solo mostramos el resumen
        general.
      </Text>
      {notesPreview?.trim() ? (
        <Text style={styles.notes} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          {notesPreview.trim()}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: "relative",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: AUTH.cardBorder,
    backgroundColor: AUTH.cardBg,
    padding: 20,
    alignItems: "center",
    gap: 10,
    overflow: "hidden",
  },
  iconRing: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    color: AUTH.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  notes: {
    color: AUTH.faint,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    marginTop: 4,
  },
});
