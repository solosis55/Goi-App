import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export function hapticLight() {
  if (Platform.OS === "web") return;
  try {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    /* sin módulo nativo */
  }
}

export function hapticSuccess() {
  if (Platform.OS === "web") return;
  try {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch {
    /* sin módulo nativo */
  }
}

export function hapticWarning() {
  if (Platform.OS === "web") return;
  try {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch {
    /* sin módulo nativo */
  }
}
