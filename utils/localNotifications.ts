import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Linking, Platform } from "react-native";
import { WORKOUT_TRAINING_REMINDER_KEY } from "../constants/storageKeys";

export type WorkoutTrainingReminderPrefs = {
  enabled: boolean;
  weekday: number;
  hour: number;
  minute: number;
  notificationId?: string | null;
};

export const DEFAULT_WORKOUT_REMINDER: WorkoutTrainingReminderPrefs = {
  enabled: false,
  weekday: 2,
  hour: 18,
  minute: 0,
  notificationId: null,
};

const ANDROID_CHANNEL_ID = "goi-training-reminder";

let handlerConfigured = false;

export function configureLocalNotifications() {
  if (handlerConfigured) return;
  handlerConfigured = true;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Recordatorios de entreno",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: "default",
  });
}

export async function requestLocalNotificationPermission(): Promise<
  "granted" | "denied" | "undetermined"
> {
  configureLocalNotifications();
  await ensureAndroidChannel();
  const current = await Notifications.getPermissionsAsync();
  if (current.status === "granted") return "granted";
  const next = await Notifications.requestPermissionsAsync();
  return next.status;
}

export function openNotificationSettings() {
  void Linking.openSettings();
}

export async function loadWorkoutTrainingReminderPrefs(): Promise<WorkoutTrainingReminderPrefs> {
  try {
    const raw = await AsyncStorage.getItem(WORKOUT_TRAINING_REMINDER_KEY);
    if (!raw) return { ...DEFAULT_WORKOUT_REMINDER };
    const parsed = JSON.parse(raw) as Partial<WorkoutTrainingReminderPrefs>;
    return {
      enabled: parsed.enabled === true,
      weekday: typeof parsed.weekday === "number" ? parsed.weekday : DEFAULT_WORKOUT_REMINDER.weekday,
      hour: typeof parsed.hour === "number" ? parsed.hour : DEFAULT_WORKOUT_REMINDER.hour,
      minute: typeof parsed.minute === "number" ? parsed.minute : DEFAULT_WORKOUT_REMINDER.minute,
      notificationId: parsed.notificationId ?? null,
    };
  } catch {
    return { ...DEFAULT_WORKOUT_REMINDER };
  }
}

async function saveWorkoutTrainingReminderPrefs(prefs: WorkoutTrainingReminderPrefs) {
  await AsyncStorage.setItem(WORKOUT_TRAINING_REMINDER_KEY, JSON.stringify(prefs));
}

async function cancelScheduled(id: string | null | undefined) {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    /* ya cancelada */
  }
}

/** Programa recordatorio semanal local (sin servidor). */
export async function applyWorkoutTrainingReminderPrefs(
  prefs: WorkoutTrainingReminderPrefs
): Promise<{ ok: true; prefs: WorkoutTrainingReminderPrefs } | { ok: false; error: string }> {
  configureLocalNotifications();
  await cancelScheduled(prefs.notificationId);

  if (!prefs.enabled) {
    const next = { ...prefs, notificationId: null };
    await saveWorkoutTrainingReminderPrefs(next);
    return { ok: true, prefs: next };
  }

  const status = await requestLocalNotificationPermission();
  if (status !== "granted") {
    return {
      ok: false,
      error:
        status === "denied"
          ? "Activa las notificaciones para Goi en Ajustes del dispositivo."
          : "Necesitamos permiso para enviarte recordatorios de entreno.",
    };
  }

  await ensureAndroidChannel();

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Goi",
      body: "¿Entrenamos hoy? Revisa tus rutinas y mantén la racha.",
      ...(Platform.OS === "android" ? { channelId: ANDROID_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: prefs.weekday,
      hour: prefs.hour,
      minute: prefs.minute,
    },
  });

  const next = { ...prefs, notificationId };
  await saveWorkoutTrainingReminderPrefs(next);
  return { ok: true, prefs: next };
}

/** Reprograma el recordatorio guardado (p. ej. tras reinstalar o cambiar zona horaria). */
export async function syncLocalTrainingReminders(_userId?: string) {
  const prefs = await loadWorkoutTrainingReminderPrefs();
  if (!prefs.enabled) return;
  await applyWorkoutTrainingReminderPrefs(prefs);
}

/** Cancela cualquier recordatorio guardado (p. ej. al cerrar sesión). */
export async function clearWorkoutTrainingReminderSchedule() {
  const prefs = await loadWorkoutTrainingReminderPrefs();
  await cancelScheduled(prefs.notificationId);
  await saveWorkoutTrainingReminderPrefs({ ...prefs, enabled: false, notificationId: null });
}
