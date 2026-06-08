import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import { Platform } from "react-native";
import { syncLocalTrainingReminders } from "../utils/localNotifications";

/** Reprograma recordatorios locales al volver a la app (borrador / inactividad). */
export function useLocalNotificationsSync(userId: string | undefined) {
  useFocusEffect(
    useCallback(() => {
      if (!userId || Platform.OS === "web") return;
      void syncLocalTrainingReminders(userId);
    }, [userId])
  );
}
