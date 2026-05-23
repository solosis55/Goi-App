import * as Haptics from "expo-haptics";
import * as LocalAuthentication from "expo-local-authentication";
import { Platform } from "react-native";
import type { GoiAlertOptions } from "../context/GoiAlertContext";
import { setBiometricUnlockEnabled } from "./biometricPreference";

type Replaceable = { replace: (href: string) => void };

/**
 * Tras un login o registro correcto: ofrece activar desbloqueo biométrico al abrir la app.
 * Si no hay hardware / enrolamiento, navega al feed directamente.
 */
export function offerBiometricUnlockAfterLogin(
  router: Replaceable,
  onOptIn: () => void,
  showAlert: (options: GoiAlertOptions) => void
): void {
  if (Platform.OS === "web") {
    router.replace("/(tabs)");
    return;
  }

  void (async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!compatible || !enrolled) {
        router.replace("/(tabs)");
        return;
      }

      showAlert({
        title: "Proteger acceso",
        message: "¿Activar Face ID o huella para desbloquear la app al abrirla?",
        buttons: [
          {
            text: "Ahora no",
            style: "cancel",
            onPress: () => router.replace("/feed"),
          },
          {
            text: "Activar",
            onPress: () => {
              void (async () => {
                try {
                  const r = await LocalAuthentication.authenticateAsync({
                    promptMessage: "Confirma para activar el desbloqueo biométrico",
                    cancelLabel: "Cancelar",
                  });
                  if (r.success) {
                    await setBiometricUnlockEnabled(true);
                    onOptIn();
                    try {
                      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    } catch {
                      /* sin módulo nativo */
                    }
                  }
                } finally {
                  router.replace("/(tabs)");
                }
              })();
            },
          },
        ],
      });
    } catch {
      router.replace("/(tabs)");
    }
  })();
}
