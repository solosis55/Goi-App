import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  applyWorkoutTrainingReminderPrefs,
  configureLocalNotifications,
  DEFAULT_WORKOUT_REMINDER,
  loadWorkoutTrainingReminderPrefs,
  openNotificationSettings,
  type WorkoutTrainingReminderPrefs,
} from "../utils/localNotifications";

const WEEKDAY_LABELS: Record<number, string> = {
  1: "Dom",
  2: "Lun",
  3: "Mar",
  4: "Mié",
  5: "Jue",
  6: "Vie",
  7: "Sáb",
};

export function formatWorkoutReminderSummary(prefs: WorkoutTrainingReminderPrefs): string {
  if (!prefs.enabled) return "Desactivado";
  const day = WEEKDAY_LABELS[prefs.weekday] ?? "—";
  const hh = String(prefs.hour).padStart(2, "0");
  const mm = String(prefs.minute).padStart(2, "0");
  return `${day} ${hh}:${mm}`;
}

export function useWorkoutTrainingReminder() {
  const [prefs, setPrefs] = useState<WorkoutTrainingReminderPrefs>(DEFAULT_WORKOUT_REMINDER);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unsupported = Platform.OS === "web";

  useEffect(() => {
    configureLocalNotifications();
    void loadWorkoutTrainingReminderPrefs().then((loaded) => {
      setPrefs(loaded);
      setLoading(false);
    });
  }, []);

  const persist = useCallback(async (next: WorkoutTrainingReminderPrefs) => {
    setSaving(true);
    setError(null);
    const result = await applyWorkoutTrainingReminderPrefs(next);
    setSaving(false);
    if (!result.ok) {
      setError(result.error);
      return false;
    }
    setPrefs(result.prefs);
    return true;
  }, []);

  const setEnabled = useCallback(
    async (enabled: boolean) => {
      return persist({ ...prefs, enabled });
    },
    [persist, prefs]
  );

  const setSchedule = useCallback(
    async (patch: Pick<WorkoutTrainingReminderPrefs, "weekday" | "hour" | "minute">) => {
      return persist({ ...prefs, ...patch, enabled: true });
    },
    [persist, prefs]
  );

  return {
    prefs,
    loading,
    saving,
    error,
    unsupported,
    setEnabled,
    setSchedule,
    openSettings: openNotificationSettings,
    clearError: () => setError(null),
  };
}
