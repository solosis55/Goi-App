import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AUTH, AUTH_MAX_FONT_MULTIPLIER } from "../../constants/authUi";

type SocialHubEmptyStateProps = {
  onExploreDiscover: () => void;
};

export function SocialHubEmptyState({ onExploreDiscover }: SocialHubEmptyStateProps) {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <Text style={styles.title} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        Tu red está tranquila
      </Text>
      <Text style={styles.body} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
        No hay solicitudes pendientes y aún no sigues a nadie. Descubre atletas o vuelve al feed para ver la
        comunidad.
      </Text>
      <View style={styles.actions}>
        <Pressable
          onPress={onExploreDiscover}
          style={({ pressed }) => [styles.primaryBtn, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Descubrir atletas"
        >
          <Text style={styles.primaryText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Descubrir atletas
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/(tabs)")}
          style={({ pressed }) => [styles.secondaryBtn, pressed ? styles.pressed : null]}
          accessibilityRole="button"
          accessibilityLabel="Ir al feed"
        >
          <Text style={styles.secondaryText} maxFontSizeMultiplier={AUTH_MAX_FONT_MULTIPLIER}>
            Ir al feed
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    padding: 20,
    alignItems: "center",
    gap: 10,
  },
  title: {
    color: AUTH.neutral100,
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  body: {
    color: AUTH.muted,
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },
  actions: {
    marginTop: 8,
    gap: 10,
    width: "100%",
    maxWidth: 280,
  },
  primaryBtn: {
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: "rgba(212, 175, 55, 0.2)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.45)",
  },
  primaryText: {
    color: AUTH.gold,
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryBtn: {
    alignItems: "center",
    paddingVertical: 10,
  },
  secondaryText: {
    color: AUTH.muted,
    fontSize: 13,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.88,
  },
});
