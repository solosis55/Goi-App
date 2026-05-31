import AsyncStorage from "@react-native-async-storage/async-storage";
import { getNotificationPrefsRemote, putNotificationPrefsRemote } from "../api/auth";
import { NOTIFICATION_PREFS_KEY } from "../constants/storageKeys";
import type { NotificationFilter } from "./notificationFilters";

export type NotificationPrefs = {
  mutedTypes: Array<"like" | "comment" | "follow">;
};

const DEFAULT: NotificationPrefs = { mutedTypes: [] };

export async function loadNotificationPrefs(): Promise<NotificationPrefs> {
  try {
    const remote = await getNotificationPrefsRemote();
    const prefs = remote.prefs ?? DEFAULT;
    await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
    return prefs;
  } catch {
    try {
      const raw = await AsyncStorage.getItem(NOTIFICATION_PREFS_KEY);
      if (!raw) return { ...DEFAULT };
      const parsed = JSON.parse(raw) as NotificationPrefs;
      return {
        mutedTypes: Array.isArray(parsed.mutedTypes) ? parsed.mutedTypes : [],
      };
    } catch {
      return { ...DEFAULT };
    }
  }
}

export async function saveNotificationPrefs(prefs: NotificationPrefs): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_PREFS_KEY, JSON.stringify(prefs));
  try {
    await putNotificationPrefsRemote(prefs);
  } catch {
    /* local guardado; sync en siguiente carga */
  }
}

export function applyNotificationPrefs<T extends { type: "like" | "comment" | "follow" }>(
  items: T[],
  prefs: NotificationPrefs
): T[] {
  const muted = new Set(prefs.mutedTypes);
  if (muted.size === 0) return items;
  return items.filter((n) => !muted.has(n.type));
}
