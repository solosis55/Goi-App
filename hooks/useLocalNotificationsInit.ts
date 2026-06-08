import { useEffect } from "react";
import { Platform } from "react-native";
import { configureLocalNotifications } from "../utils/localNotifications";

/** Registra el handler de notificaciones en primer plano (Fase 9). */
export function useLocalNotificationsInit() {
  useEffect(() => {
    if (Platform.OS === "web") return;
    configureLocalNotifications();
  }, []);
}
