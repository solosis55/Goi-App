import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";
import { useGoiTheme } from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import { useGoiAlert } from "../../context/GoiAlertContext";

export function ProfileAccountSection() {
  const router = useRouter();
  const { showAlert } = useGoiAlert();
  const { palette, typography } = useGoiTheme();
  const { signOut, storedAccounts, biometricUnlockActive, disableBiometricUnlock } = useAuth();
  const hasMultipleAccounts = storedAccounts.length > 1;

  const onLogout = useCallback(() => {
    const run = async () => {
      await signOut();
      router.replace(hasMultipleAccounts ? "/(tabs)/perfil" : "/");
    };

    const message = hasMultipleAccounts
      ? "Se quitará esta cuenta del dispositivo. Las demás cuentas guardadas seguirán disponibles."
      : "¿Cerrar sesión?";
    showAlert({
      title: "Goi",
      message,
      buttons: [
        { text: "Cancelar", style: "cancel" },
        { text: "Salir", style: "destructive", onPress: () => void run() },
      ],
    });
  }, [hasMultipleAccounts, router, showAlert, signOut]);

  return (
    <View style={styles.wrap}>
      <Text
        style={{
          color: palette.text,
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.semibold,
          marginBottom: 10,
        }}
        maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
      >
        Cuenta y sesión
      </Text>

      {biometricUnlockActive && Platform.OS !== "web" ? (
        <Pressable
          onPress={() => void disableBiometricUnlock()}
          style={({ pressed }) => [styles.rowBtn, pressed ? styles.rowBtnPressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Desactivar desbloqueo biométrico"
        >
          <Text style={styles.rowBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Desactivar biometría
          </Text>
        </Pressable>
      ) : null}

      <Pressable
        onPress={onLogout}
        style={({ pressed }) => [styles.logoutBtn, pressed ? styles.rowBtnPressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Cerrar sesión"
      >
        <Text style={styles.logoutText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Cerrar sesión
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 28,
    paddingTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(64, 64, 64, 0.9)",
  },
  rowBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(64, 64, 64, 0.9)",
    backgroundColor: "rgba(23, 23, 23, 0.45)",
    marginBottom: 10,
    alignItems: "center",
  },
  rowBtnPressed: {
    opacity: 0.88,
  },
  rowBtnText: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "600",
  },
  logoutBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(248, 113, 113, 0.35)",
    backgroundColor: "rgba(40, 20, 20, 0.35)",
    alignItems: "center",
  },
  logoutText: {
    color: AUTH.danger,
    fontSize: 15,
    fontWeight: "600",
  },
});
