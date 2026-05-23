import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type ProfileAccountSecuritySectionProps = {
  email?: string;
};

export function ProfileAccountSecuritySection({ email }: ProfileAccountSecuritySectionProps) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Cuenta
      </Text>
      <Text style={styles.intro} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Información privada. Tu correo no aparece en el feed ni en tu perfil público.
      </Text>

      {email ? (
        <View style={styles.field}>
          <Text style={styles.label} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Correo
          </Text>
          <TextInput
            value={email}
            editable={false}
            accessibilityLabel="Correo de la cuenta"
            accessibilityHint="Solo visible para ti. No se puede cambiar desde la app."
            maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}
            style={styles.inputReadonly}
          />
          <Text style={styles.hint} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Visible solo para ti. Para cambiar el correo contacta con soporte o usa Goi Web cuando esté disponible.
          </Text>
        </View>
      ) : (
        <Text style={styles.empty} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          No hay correo en esta sesión.
        </Text>
      )}

      <Pressable
        onPress={() => router.push("/forgot-password")}
        style={({ pressed }) => [styles.rowBtn, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Cambiar contraseña"
        accessibilityHint="Abre el flujo para restablecer la contraseña por correo"
      >
        <Text style={styles.rowBtnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Cambiar contraseña
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    marginTop: 8,
  },
  title: {
    color: AUTH.muted,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  intro: {
    color: AUTH.faint,
    fontSize: 13,
    lineHeight: 19,
  },
  field: {
    gap: 6,
  },
  label: {
    color: AUTH.label,
    fontSize: 14,
    fontWeight: "600",
  },
  inputReadonly: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: AUTH.fieldBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: AUTH.muted,
    backgroundColor: "rgba(23, 23, 23, 0.5)",
    opacity: 0.9,
  },
  hint: {
    color: AUTH.faint,
    fontSize: 12,
    lineHeight: 17,
  },
  empty: {
    color: AUTH.muted,
    fontSize: 13,
  },
  rowBtn: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.5)",
    alignItems: "center",
  },
  rowBtnText: {
    color: AUTH.gold,
    fontSize: 15,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
