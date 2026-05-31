import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

export function SocialLocationCta() {
  const router = useRouter();

  return (
    <Pressable
      onPress={() => router.push({ pathname: "/(tabs)/perfil", params: { editPrivate: "1" } })}
      style={({ pressed }) => [styles.wrap, pressed ? styles.pressed : null]}
    >
      <Text style={styles.text} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Añade tu ubicación en el perfil para ver atletas cerca de ti.
      </Text>
      <Text style={styles.link} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Ir a privacidad del perfil →
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 10,
    gap: 4,
  },
  text: {
    color: AUTH.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  link: {
    color: AUTH.gold,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: { opacity: 0.88 },
});
