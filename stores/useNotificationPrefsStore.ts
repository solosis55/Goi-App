import { create } from "zustand";
import {
  loadNotificationPrefs,
  saveNotificationPrefs,
  type NotificationPrefs,
} from "../utils/notificationPrefs";

const DEFAULT_PREFS: NotificationPrefs = { mutedTypes: [] };

type NotificationPrefsState = {
  prefs: NotificationPrefs;
  hydrated: boolean;
  hydrate: (opts?: { force?: boolean }) => Promise<void>;
  applyRemotePrefs: (prefs: NotificationPrefs) => void;
  setPrefs: (prefs: NotificationPrefs) => void;
};

export const useNotificationPrefsStore = create<NotificationPrefsState>((set, get) => ({
  prefs: DEFAULT_PREFS,
  hydrated: false,

  hydrate: async (opts) => {
    if (get().hydrated && !opts?.force) return;
    try {
      const prefs = await loadNotificationPrefs();
      set({ prefs, hydrated: true });
    } catch {
      if (!get().hydrated) set({ prefs: DEFAULT_PREFS, hydrated: true });
    }
  },

  applyRemotePrefs: (prefs) => {
    set({
      prefs: {
        mutedTypes: Array.isArray(prefs.mutedTypes) ? prefs.mutedTypes : [],
      },
      hydrated: true,
    });
  },

  setPrefs: (prefs) => {
    const normalized = {
      mutedTypes: Array.isArray(prefs.mutedTypes) ? prefs.mutedTypes : [],
    };
    set({ prefs: normalized, hydrated: true });
    void saveNotificationPrefs(normalized).catch(() => {
      /* local ya guardado en saveNotificationPrefs */
    });
  },
}));

export type { NotificationPrefs };
