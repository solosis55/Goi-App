import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

export function ProfilePinnedPostBanner() {
  return (
    <View style={styles.wrap} accessibilityLabel="Publicación destacada en tu perfil">
      <Text style={styles.star} accessibilityElementsHidden>
        ★
      </Text>
      <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Destacada en tu perfil
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 16,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.35)",
    backgroundColor: "rgba(35, 32, 22, 0.55)",
  },
  star: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  text: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
});
