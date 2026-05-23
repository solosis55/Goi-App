import { StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

export function FeedFollowingScopeHint() {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Sigue a alguien en las sugerencias de arriba ↑ para ver sus publicaciones aquí.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.28)",
    backgroundColor: "rgba(35, 32, 22, 0.45)",
  },
  text: {
    color: AUTH.gold,
    fontSize: 12,
    lineHeight: 17,
    textAlign: "center",
  },
});
