import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type ProfileDirtyBannerProps = {
  onPressEdit: () => void;
};

export function ProfileDirtyBanner({ onPressEdit }: ProfileDirtyBannerProps) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Tienes cambios sin guardar en tu perfil.
      </Text>
      <Pressable
        onPress={onPressEdit}
        style={({ pressed }) => [styles.btn, pressed ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel="Ir a editar y guardar"
      >
        <Text style={styles.btnText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
          Editar y guardar
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 4,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
    backgroundColor: "rgba(35, 32, 22, 0.92)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  text: {
    flex: 1,
    color: AUTH.neutral100,
    fontSize: 13,
    lineHeight: 18,
  },
  btn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: AUTH.gold,
  },
  btnText: {
    color: "#0a0a0a",
    fontSize: 12,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.88,
  },
});
