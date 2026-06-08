import { ActivityIndicator, Pressable, StyleSheet, Switch, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import {
  formatWorkoutReminderSummary,
  useWorkoutTrainingReminder,
} from "../../hooks/useWorkoutTrainingReminder";

const WEEKDAYS = [
  { id: 2, label: "Lun" },
  { id: 3, label: "Mar" },
  { id: 4, label: "Mié" },
  { id: 5, label: "Jue" },
  { id: 6, label: "Vie" },
  { id: 7, label: "Sáb" },
  { id: 1, label: "Dom" },
];

const HOURS = [7, 8, 9, 12, 17, 18, 19, 20, 21];

export function WorkoutTrainingReminderCard() {
  const reminder = useWorkoutTrainingReminder();

  if (reminder.unsupported) {
    return (
      <View style={styles.card}>
        <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Recordatorio local
        </Text>
        <Text style={styles.muted} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Disponible en la app móvil (iOS/Android).
        </Text>
      </View>
    );
  }

  if (reminder.loading) {
    return (
      <View style={[styles.card, styles.center]}>
        <ActivityIndicator color={AUTH.gold} />
      </View>
    );
  }

  return (
    <View style={styles.card} accessibilityLabel="Recordatorio de entreno semanal">
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Recordatorio de entreno
          </Text>
          <Text style={styles.muted} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Notificación local semanal · {formatWorkoutReminderSummary(reminder.prefs)}
          </Text>
        </View>
        <Switch
          value={reminder.prefs.enabled}
          onValueChange={(v) => void reminder.setEnabled(v)}
          disabled={reminder.saving}
          trackColor={{ false: "#333", true: "rgba(212, 175, 55, 0.45)" }}
          thumbColor={reminder.prefs.enabled ? AUTH.gold : "#888"}
          accessibilityLabel="Activar recordatorio semanal de entreno"
          accessibilityRole="switch"
          accessibilityState={{ checked: reminder.prefs.enabled, disabled: reminder.saving }}
        />
      </View>

      {reminder.prefs.enabled ? (
        <>
          <Text style={styles.subLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Día
          </Text>
          <View style={styles.chips}>
            {WEEKDAYS.map((d) => {
              const active = reminder.prefs.weekday === d.id;
              return (
                <Pressable
                  key={d.id}
                  onPress={() =>
                    void reminder.setSchedule({
                      weekday: d.id,
                      hour: reminder.prefs.hour,
                      minute: reminder.prefs.minute,
                    })
                  }
                  disabled={reminder.saving}
                  style={[styles.chip, active ? styles.chipActive : null]}
                  accessibilityRole="button"
                  accessibilityLabel={`Día ${d.label}`}
                  accessibilityState={{ selected: active, disabled: reminder.saving }}
                >
                  <Text
                    style={[styles.chipText, active ? styles.chipTextActive : null]}
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  >
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.subLabel} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Hora
          </Text>
          <View style={styles.chips}>
            {HOURS.map((h) => {
              const active = reminder.prefs.hour === h;
              return (
                <Pressable
                  key={h}
                  onPress={() =>
                    void reminder.setSchedule({
                      weekday: reminder.prefs.weekday,
                      hour: h,
                      minute: 0,
                    })
                  }
                  disabled={reminder.saving}
                  style={[styles.chip, active ? styles.chipActive : null]}
                  accessibilityRole="button"
                  accessibilityLabel={`Hora ${h}:00`}
                  accessibilityState={{ selected: active, disabled: reminder.saving }}
                >
                  <Text
                    style={[styles.chipText, active ? styles.chipTextActive : null]}
                    maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
                  >
                    {`${h}:00`}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}

      {reminder.error ? (
        <View style={styles.errorRow}>
          <Text style={styles.errorText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            {reminder.error}
          </Text>
          <Pressable
            onPress={reminder.openSettings}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Abrir ajustes de notificaciones del dispositivo"
          >
            <Text style={styles.errorLink} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
              Ajustes
            </Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(212, 175, 55, 0.22)",
    backgroundColor: "rgba(20, 20, 20, 0.95)",
    padding: 14,
    gap: 10,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 72,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  copy: { flex: 1, gap: 4 },
  title: {
    color: AUTH.neutral100,
    fontSize: 15,
    fontWeight: "700",
  },
  muted: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  subLabel: {
    color: AUTH.faint,
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    marginTop: 4,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.9)",
  },
  chipActive: {
    borderColor: "rgba(212, 175, 55, 0.55)",
    backgroundColor: "rgba(212, 175, 55, 0.12)",
  },
  chipText: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextActive: {
    color: AUTH.gold,
  },
  errorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  errorText: {
    color: "#f87171",
    fontSize: 12,
    flex: 1,
  },
  errorLink: {
    color: AUTH.gold,
    fontSize: 12,
    fontWeight: "600",
  },
});
